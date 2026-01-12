// components/auth/AuthLoginClient.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button, Card, CardBody, Divider } from "@heroui/react";

import type { UserRole } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";

import EmailForm from "@/components/auth/EmailForm";
import OtpForm from "@/components/auth/OtpForm";

type Step = "role" | "method" | "email" | "otp";

type Props = {
  as?: string;   // из query
  next?: string; // из query
};

const ROLE_META: Record<
  Exclude<UserRole, "GUEST">,
  { title: string; subtitle: string; icon: string }
> = {
  PATIENT: {
    title: "Patient",
    subtitle: "Book appointments, manage visits",
    icon: "solar:heart-pulse-2-linear",
  },
  PARTNER: {
    title: "Partner",
    subtitle: "Referral links, programs, reports",
    icon: "solar:users-group-two-rounded-linear",
  },
  CUSTOMER: {
    title: "Clinic",
    subtitle: "Manage clinic profile and bookings",
    icon: "solar:hospital-linear",
  },
  ADMIN: {
    title: "Admin",
    subtitle: "Administration panel",
    icon: "solar:shield-user-bold",
  },
};

type LoginRole = Exclude<UserRole, "GUEST" | "ADMIN">; // PATIENT | PARTNER | CUSTOMER

function normalizeRole(v?: string): LoginRole | null {
  const r = String(v || "").trim().toUpperCase();
  if (r === "PATIENT" || r === "PARTNER" || r === "CUSTOMER") return r as LoginRole;
  return null;
}


export default function AuthLoginClient({ as, next }: Props) {
  const router = useRouter();
  const { supabase } = useSupabase();

  const safeNext = useMemo(() => {
    const n = String(next || "/");
    // защита от внешних редиректов
    return n.startsWith("/") ? n : "/";
  }, [next]);

  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<LoginRole | null>(null);

  const [email, setEmail] = useState("");

  useEffect(() => {
    const r = normalizeRole(as);
    setRole(r);
    setEmail("");
    setStep(r ? "method" : "role");
  }, [as]);

  const roleLabel = role ? ROLE_META[role]?.title ?? role : "";

  const signInWithGoogle = useCallback(async () => {
    if (!role) return;

    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?as=${encodeURIComponent(
      role,
    )}&next=${encodeURIComponent(safeNext)}`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }, [supabase, role, safeNext]);

  const onEmailSuccess = (e: string) => {
    setEmail(e);
    setStep("otp");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[520px]">
        <div className="mb-6 flex items-center justify-between">
          <NextLink
            href="/"
            className="text-sm text-default-500 hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <Icon icon="solar:alt-arrow-left-linear" width={18} />
            Back to home
          </NextLink>

          <div className="text-sm text-default-500">
            {role ? (
              <span className="inline-flex items-center gap-2">
                <Icon icon={ROLE_META[role].icon} width={16} />
                {roleLabel}
              </span>
            ) : (
              "Choose role"
            )}
          </div>
        </div>

        <Card className="border border-divider">
          <CardBody className="p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Icon icon="solar:login-3-linear" width={20} />
              <div className="font-semibold text-lg">
                {step === "role" ? "Sign in / Sign up" : `Continue as ${roleLabel}`}
              </div>
            </div>

            <Divider />

            {/* STEP: role */}
            {step === "role" ? (
              <div className="grid grid-cols-1 gap-3">
                {(["PATIENT", "PARTNER", "CUSTOMER"] as const).map((r) => (
                  <button
                    key={r}
                    className="w-full text-left rounded-xl border border-divider hover:border-primary transition-colors p-4 flex items-center gap-4"
                    onClick={() => {
                      setRole(r);
                      setStep("method");
                      // обновляем URL параметр as (удобно шарить ссылку)
                      router.replace(`/auth/login?as=${r}&next=${encodeURIComponent(safeNext)}`);
                    }}
                  >
                    <div className="h-10 w-10 rounded-full bg-default-100 flex items-center justify-center">
                      <Icon icon={ROLE_META[r].icon} width={22} />
                    </div>
                    <div className="flex flex-col">
                      <div className="font-semibold">{ROLE_META[r].title}</div>
                      <div className="text-tiny text-default-500">{ROLE_META[r].subtitle}</div>
                    </div>
                    <div className="ml-auto text-default-400">
                      <Icon icon="solar:alt-arrow-right-linear" width={18} />
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {/* STEP: method */}
            {step === "method" ? (
              <div className="flex flex-col gap-3">
                <Button
                  color="primary"
                  startContent={<Icon icon="solar:letter-bold" width={18} />}
                  onPress={() => setStep("email")}
                  className="justify-center"
                >
                  Continue with email
                </Button>

                <Button
                  variant="bordered"
                  startContent={<Icon icon="logos:google-icon" width={18} />}
                  onPress={signInWithGoogle}
                  className="justify-center"
                >
                  Continue with Google
                </Button>

                <div className="flex items-center justify-between mt-2">
                  <Button
                    variant="light"
                    onPress={() => {
                      setRole(null);
                      setStep("role");
                      router.replace(`/auth/login?next=${encodeURIComponent(safeNext)}`);
                    }}
                    startContent={<Icon icon="solar:refresh-linear" width={16} />}
                  >
                    Change role
                  </Button>

                  <span className="text-tiny text-default-500">
                    Next: <b>{safeNext}</b>
                  </span>
                </div>
              </div>
            ) : null}

            {/* STEP: email */}
            {step === "email" && role ? (
              <div className="flex flex-col gap-4">
                <EmailForm as={role} next={safeNext} onSuccess={onEmailSuccess} />
                <Button variant="light" onPress={() => setStep("method")}>
                  Back
                </Button>
              </div>
            ) : null}

            {/* STEP: otp */}
            {step === "otp" && role ? (
              <div className="flex flex-col gap-4">
                <OtpForm
                  email={email}
                  as={role}
                  next={safeNext}
                  onBack={() => setStep("email")}
                />
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
