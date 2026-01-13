// components/auth/CredentialsForm.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type Mode = "signin" | "signup";

type Props = {
  mode: Mode;
  role: string; // PATIENT | PARTNER | CUSTOMER
  next: string;

  onOtpRequired: (payload: { email: string; password: string }) => void;
  onSignedIn?: () => void; // для модалки: закрыть
};

export default function CredentialsForm({
  mode,
  role,
  next,
  onOtpRequired,
  onSignedIn,
}: Props) {
  const { supabase, refreshRoles, setActiveRole } = useSupabase();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const schema = useMemo(() => {
    const base = {
      email: z.string().email("Enter a valid email"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    };

    if (mode === "signin") {
      return z.object(base);
    }

    return z
      .object({
        ...base,
        password2: z.string().min(8, "Password must be at least 8 characters"),
      })
      .refine((v) => v.password === v.password2, {
        message: "Passwords do not match",
        path: ["password2"],
      });
  }, [mode]);

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setErrorMsg(null);

    const email = String(data.email).trim().toLowerCase();
    const password = String(data.password);

    try {
      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        const userId = data.user?.id;
        if (userId) {
          const roleSlug = role.toLowerCase();

          await supabase.from("user_roles").upsert(
            { user_id: userId, role: roleSlug },
            { onConflict: "user_id,role" }
          );

          await supabase.from("profiles").upsert(
            { id: userId, email, role: roleSlug },
            { onConflict: "id" }
          );

          // ✅ обновить активную роль в UI
          setActiveRole(role.toUpperCase() as any);

          // ✅ принудительно перечитать роли (убирает гонку)
          await refreshRoles();
        }

        // (необязательно, но полезно для контекста)
        await supabase.auth.updateUser({
          data: { requested_role: role },
        });

        onSignedIn?.();
        return;
      }

      // signup
      const res = await fetch("/api/auth/email/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, as: role, next }),
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(json?.error || "Failed to sign up");
        return;
      }

      // отправляем OTP (теперь user уже существует, send-otp пропустит)
      const res2 = await fetch("/api/auth/email/send-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, as: role, next, purpose: "verify_email" }),
        cache: "no-store",
      });

      const json2 = await res2.json().catch(() => ({}));
      if (!res2.ok) {
        setErrorMsg(json2?.error || "Failed to send code");
        return;
      }

      onOtpRequired({ email, password });
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error");
    }
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <Input
        isRequired
        type="email"
        variant="bordered"
        placeholder="you@email.com"
        errorMessage={errors.email?.message as any}
        {...register("email")}
      />

      <Input
        isRequired
        type={showPass ? "text" : "password"}
        variant="bordered"
        placeholder="Password"
        errorMessage={errors.password?.message as any}
        endContent={
          <button
            type="button"
            className="text-default-500"
            onClick={() => setShowPass((s) => !s)}
            aria-label="toggle password"
          >
            <Icon icon={showPass ? "solar:eye-closed-linear" : "solar:eye-linear"} width={18} />
          </button>
        }
        {...register("password")}
      />

      {mode === "signup" ? (
        <Input
          isRequired
          type={showPass ? "text" : "password"}
          variant="bordered"
          placeholder="Confirm password"
          errorMessage={(errors as any).password2?.message}
          {...register("password2" as any)}
        />
      ) : null}

      {errorMsg && <p className="text-danger text-small">{errorMsg}</p>}

      <Button
        color="primary"
        isLoading={isSubmitting}
        type="submit"
        className="justify-center"
        startContent={<Icon icon={mode === "signin" ? "solar:login-3-linear" : "solar:user-plus-linear"} width={18} />}
      >
        {mode === "signin" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}
