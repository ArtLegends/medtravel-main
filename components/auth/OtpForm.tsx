// components/auth/OtpForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputOtp, Button, Link } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type Props = {
  email: string;
  password?: string;
  as?: string; // CUSTOMER / PARTNER / PATIENT / ADMIN
  next?: string; // куда редиректить после успешного ввода
  onBack?: () => void;
  onSuccess?: () => void;
};

const schema = z.object({
  token: z.string().length(6, "6 digits").regex(/^[0-9]{6}$/),
});

type FormValues = z.infer<typeof schema>;

export default function OtpForm({
  email,
  password,
  as = "CUSTOMER",
  next = "/",
  onBack,
  onSuccess,
}: Props) {
  const { supabase } = useSupabase();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(60);
  const [resending, setResending] = useState(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const resend = async () => {
    if (seconds !== 0 || resending) return;

    setErrorMsg(null);
    setResending(true);

    try {
      const res = await fetch("/api/auth/email/send-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, as, next, purpose: "verify_email" }),
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(json?.error || "Failed to resend code");
        return;
      }

      setSeconds(60);
      reset();
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error");
    } finally {
      setResending(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/email/verify-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          token: data.token,
          as,
          next,
          purpose: "verify_email",
        }),
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(json?.error || "Invalid code");
        return;
      }

      setSuccessMsg("Email confirmed. Signing you in...");

      // ✅ после подтверждения — логин
      if (password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setErrorMsg(error.message);
          return;
        }
      }

      await new Promise((r) => setTimeout(r, 500));

      onSuccess?.();
      router.replace(next || "/");
      router.refresh();
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error");
    }
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <InputOtp
        isRequired
        aria-label="OTP input"
        length={6}
        placeholder="0"
        {...register("token")}
      />

      {errors.token && (
        <p className="text-danger text-small">{errors.token.message}</p>
      )}
      {errorMsg && <p className="text-danger text-small">{errorMsg}</p>}

      {successMsg && <p className="text-success text-small">{successMsg}</p>}

      <p className="text-tiny text-default-500">
        Didn&apos;t receive code?{" "}
        <Link
          as="button"
          disabled={seconds !== 0 || resending}
          size="sm"
          onClick={resend}
        >
          Resend{seconds ? ` (${seconds}s)` : ""}
        </Link>
      </p>

      <Button color="primary" isLoading={isSubmitting} type="submit">
        Verify
      </Button>

      <Button
        type="button"
        variant="ghost"
        color="primary"
        onClick={onBack || (() => window.history.back())}
      >
        Back
      </Button>
    </form>
  );
}
