// components/auth/UnifiedAuthModal.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
  Card,
  CardBody,
} from "@heroui/react";
import { useRouter } from "next/navigation";

import type { UserRole } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";

import CredentialsForm from "@/components/auth/CredentialsForm";
import OtpForm from "@/components/auth/OtpForm";

type Step = "role" | "auth" | "otp";
type Mode = "signin" | "signup";

type Props = {
  open: boolean;
  onClose: () => void;
  initialRole?: Exclude<UserRole, "ADMIN" | "GUEST"> | null;
  next?: string;
};

const ROLE_META: Record<
  Exclude<UserRole, "GUEST">,
  { title: string; subtitle: string; icon: string }
> = {
  PATIENT: {
    title: "Patient",
    subtitle: "Book appointments, manage visits, chat with clinics",
    icon: "solar:heart-pulse-2-linear",
  },
  PARTNER: {
    title: "Partner",
    subtitle: "Referral links, programs, reports, payouts",
    icon: "solar:users-group-two-rounded-linear",
  },
  CUSTOMER: {
    title: "Clinic",
    subtitle: "Manage clinic profile, services, doctors and bookings",
    icon: "solar:hospital-linear",
  },
  ADMIN: {
    title: "Admin",
    subtitle: "Administration panel",
    icon: "solar:shield-user-bold",
  },
};

function isAllowedRole(r: any): r is Exclude<UserRole, "ADMIN" | "GUEST"> {
  return r === "PATIENT" || r === "PARTNER" || r === "CUSTOMER";
}

export default function UnifiedAuthModal({
  open,
  onClose,
  initialRole = null,
  next = "/",
}: Props) {
  const router = useRouter();
  const { supabase } = useSupabase();

  const safeNext = useMemo(() => {
    const n = String(next || "/");
    return n.startsWith("/") ? n : "/";
  }, [next]);

  const [step, setStep] = useState<Step>("role");
  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<Exclude<UserRole, "ADMIN" | "GUEST"> | null>(
    null,
  );
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    if (!open) return;

    const r = isAllowedRole(initialRole) ? initialRole : null;
    setRole(r);
    setEmail("");
    setMode("signin");
    setStep(r ? "auth" : "role");
  }, [open, initialRole]);

  const roleLabel = useMemo(() => (role ? ROLE_META[role]?.title ?? role : ""), [role]);

  const title = useMemo(() => {
    if (step === "role") return "Sign in / Sign up";
    if (step === "auth") return role ? `${mode === "signin" ? "Sign in" : "Create account"} — ${roleLabel}` : "Sign in";
    return `Enter code (${roleLabel})`;
  }, [step, role, roleLabel, mode]);

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

  const goBack = useCallback(() => {
    if (step === "otp") return setStep("auth");
    if (step === "auth") return setStep(initialRole ? "auth" : "role");
    onClose();
  }, [step, onClose, initialRole]);

  const pickRole = (r: Exclude<UserRole, "ADMIN" | "GUEST">) => {
    setRole(r);
    setStep("auth");
  };

  return (
    <Modal
      isOpen={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      placement="center"
      backdrop="blur"
      size="md"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <Icon icon="solar:login-3-linear" width={20} />
              <span>{title}</span>
            </ModalHeader>

            <Divider />

            <ModalBody className="py-5">
              {/* STEP: ROLE */}
              {step === "role" ? (
                <div className="grid grid-cols-1 gap-3">
                  {(["PATIENT", "PARTNER", "CUSTOMER"] as const).map((r) => (
                    <Card
                      key={r}
                      isPressable
                      onPress={() => pickRole(r)}
                      className="border border-divider hover:border-primary transition-colors"
                    >
                      <CardBody className="flex flex-row items-center gap-4 py-4">
                        <div className="h-10 w-10 rounded-full bg-default-100 flex items-center justify-center">
                          <Icon icon={ROLE_META[r].icon} width={22} />
                        </div>
                        <div className="flex flex-col">
                          <div className="font-semibold">{ROLE_META[r].title}</div>
                          <div className="text-tiny text-default-500">
                            {ROLE_META[r].subtitle}
                          </div>
                        </div>
                        <div className="ml-auto text-default-400">
                          <Icon icon="solar:alt-arrow-right-linear" width={18} />
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : null}

              {/* STEP: AUTH */}
              {step === "auth" && role ? (
                <div className="flex flex-col gap-4">
                  {/* segmented sign in / sign up */}
                  <div className="w-full rounded-xl border border-divider bg-default-50 p-1 flex gap-1">
                    <Button
                      className="flex-1"
                      color={mode === "signin" ? "primary" : "default"}
                      variant={mode === "signin" ? "solid" : "light"}
                      onPress={() => setMode("signin")}
                    >
                      Sign in
                    </Button>
                    <Button
                      className="flex-1"
                      color={mode === "signup" ? "primary" : "default"}
                      variant={mode === "signup" ? "solid" : "light"}
                      onPress={() => setMode("signup")}
                    >
                      Sign up
                    </Button>
                  </div>

                  <CredentialsForm
                    mode={mode}
                    role={role}
                    next={safeNext}
                    onSignedIn={() => {
                      close();
                      onClose();
                      router.replace(safeNext);
                      router.refresh();
                    }}
                    onOtpRequired={(e) => {
                      setEmail(e);
                      setStep("otp");
                    }}
                  />

                  <Divider />

                  <Button
                    variant="bordered"
                    startContent={<Icon icon="logos:google-icon" width={18} />}
                    onPress={signInWithGoogle}
                    className="justify-center"
                  >
                    Continue with Google
                  </Button>

                  {mode === "signup" ? (
                    <p className="text-tiny text-default-500 text-center">
                      We’ll send a 6-digit code to confirm your email.
                    </p>
                  ) : (
                    <p className="text-tiny text-default-500 text-center">
                      Use your email and password to sign in.
                    </p>
                  )}
                </div>
              ) : null}

              {/* STEP: OTP */}
              {step === "otp" && role ? (
                <div className="flex flex-col gap-4">
                  <OtpForm
                    email={email}
                    as={role}
                    next={safeNext}
                    onBack={() => setStep("auth")}
                    onSuccess={() => {
                      // закроем модалку сразу, UX чище
                      onClose();
                    }}
                  />
                </div>
              ) : null}
            </ModalBody>

            <Divider />

            <ModalFooter className="flex items-center justify-between">
              <Button
                variant="light"
                onPress={() => {
                  if (step === "role") {
                    close();
                    onClose();
                    return;
                  }
                  goBack();
                }}
              >
                Back
              </Button>

              {step !== "role" && !initialRole ? (
                <Button
                  variant="light"
                  onPress={() => {
                    setRole(null);
                    setEmail("");
                    setMode("signin");
                    setStep("role");
                  }}
                  startContent={<Icon icon="solar:refresh-linear" width={16} />}
                >
                  Change role
                </Button>
              ) : (
                <span />
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
