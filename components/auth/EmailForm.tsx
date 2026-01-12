// components/auth/EmailForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

type Props = {
  as: string; // "CUSTOMER" / "PARTNER" / "PATIENT" / "ADMIN"
  next: string;
  onSuccess?: (email: string) => void;
};

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;

export default function EmailForm({ as, next, onSuccess }: Props) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/email/send-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: data.email, as, next }),
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(json?.error || "Failed to send code");
        return;
      }

      onSuccess?.(data.email);
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error");
    }
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <Input
        isRequired
        placeholder="you@clinic.com"
        className="h-full"
        type="email"
        variant="bordered"
        errorMessage={errors.email?.message}
        {...register("email")}
      />

      {errorMsg && <p className="text-danger text-small">{errorMsg}</p>}

      <Button
        color="primary"
        isLoading={isSubmitting}
        startContent={<Icon className="text-2xl" icon="solar:letter-bold" />}
        type="submit"
      >
        Continue with email
      </Button>
    </form>
  );
}
