// components/auth/EmailForm.tsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createClient } from "@/lib/supabase/browserClient";

const supabase = createClient();

type Props = {
  as: string; // "CUSTOMER" / "ADMIN" / ...
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

    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?as=${encodeURIComponent(
      as,
    )}&next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: redirectTo,
        data: { requested_role: as },
      },
    });

    if (error) setErrorMsg(error.message);
    else onSuccess?.(data.email);
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
