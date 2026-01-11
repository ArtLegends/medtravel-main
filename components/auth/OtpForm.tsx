// components/auth/OtpForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputOtp, Button, Link } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browserClient";
import { useSupabase } from "@/lib/supabase/supabase-provider";

const { supabase } = useSupabase();

type Props = {
  email: string;
  as?: string;    // CUSTOMER / PARTNER / PATIENT / ADMIN
  next?: string;  // куда редиректить после успешного ввода
  onBack?: () => void;
};

const schema = z.object({
  token: z
    .string()
    .length(6, "6 digits")
    .regex(/^[0-9]{6}$/),
});

type FormValues = z.infer<typeof schema>;

export default function OtpForm({ email, as = "CUSTOMER", next = "/", onBack }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const resend = async () => {
    if (seconds === 0) {
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?as=${encodeURIComponent(
        as
      )}&next=${encodeURIComponent(next)}`;

      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          data: { requested_role: as },
        },
      });
      setSeconds(60);
      reset();
    }
  };

  const onSubmit = async (data: FormValues) => {
    setErrorMsg(null);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: data.token,
      type: "email",
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.replace(next || "/");
      router.refresh();
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
      <p className="text-tiny text-default-500">
        Didn&apos;t receive code?{" "}
        <Link as="button" disabled={seconds !== 0} size="sm" onClick={resend}>
          Resend{seconds ? ` (${seconds}s)` : ""}
        </Link>
      </p>
      <Button color="primary" isLoading={isSubmitting} type="submit">
        Verify
      </Button>
      <Button
        type="button"
        variant="light"
        onClick={onBack || (() => window.history.back())}
      >
        Back
      </Button>
    </form>
  );
}
