"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

import { createClient } from "@/lib/supabase/browserClient";

const supabase = createClient();

type Props = {
  onSuccess?: (email: string) => void;
};

const schema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

export default function EmailForm({ onSuccess }: Props) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      onSuccess?.(data.email);
    }
  };

  const signInWithGoogle = async () => {
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button
        color="default"
        variant="bordered"
        startContent={
          <Icon
            className="pointer-events-none text-2xl"
            icon="logos:google-icon"
          />
        }
        onClick={signInWithGoogle}
      >
        {t("auth.continueWithGoogle")}
      </Button>

      <div className="relative flex items-center">
        <div className="flex-grow border-t border-divider"></div>
        <span className="flex-shrink mx-4 text-small text-default-500">
          {t("auth.or")}
        </span>
        <div className="flex-grow border-t border-divider"></div>
      </div>

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
          startContent={
            <Icon
              className="pointer-events-none text-2xl"
              icon="solar:letter-bold"
            />
          }
          type="submit"
        >
          {t("auth.continueWithEmail")}
        </Button>
      </form>
    </div>
  );
}
