// components/auth/EmailForm.tsx
"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { createClient } from "@/lib/supabase/browserClient";

const supabase = createClient();

type Props = { onSuccess?: (email: string) => void; };

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export default function EmailForm({ onSuccess }: Props) {
  const { t } = useTranslation();
  const sp = useSearchParams();
  const next = sp?.get("next") || "/";
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setErrorMsg(error.message);
    else onSuccess?.(data.email);
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <Input
        isRequired
        errorMessage={errors.email?.message}
        label={t("auth.emailLabel")}
        placeholder={t("auth.emailPlaceholder")}
        type="email"
        variant="bordered"
        {...register("email")}
      />
      {errorMsg && <p className="text-danger text-small">{errorMsg}</p>}
      <Button
        color="primary"
        isLoading={isSubmitting}
        startContent={<Icon className="text-2xl" icon="solar:letter-bold" />}
        type="submit"
      >
        {t("auth.continueWithEmail")}
      </Button>
    </form>
  );
}
