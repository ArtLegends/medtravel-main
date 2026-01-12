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

import type { UserRole } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";

import EmailForm from "@/components/auth/EmailForm";
import OtpForm from "@/components/auth/OtpForm";

type Step = "role" | "method" | "email" | "otp";

type Props = {
  open: boolean;
  onClose: () => void;

  /** если передан — модалка стартует сразу с выбранной роли */
  initialRole?: Exclude<UserRole, "ADMIN" | "GUEST"> | null;

  /** куда редиректить после успешного логина */
  next?: string;
};

const ROLE_META: Record<
  Exclude<UserRole, "GUEST">,
  { title: string; subtitle: string; icon: string; color?: any }
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
  const { supabase } = useSupabase();

  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Exclude<UserRole, "ADMIN" | "GUEST"> | null>(
    null,
  );
  const [email, setEmail] = useState<string>("");

  // reset при открытии
  useEffect(() => {
    if (!open) return;

    const r = isAllowedRole(initialRole) ? initialRole : null;

    setRole(r);
    setEmail("");
    setStep(r ? "method" : "role");
  }, [open, initialRole]);

  const roleLabel = useMemo(() => {
    if (!role) return "";
    return ROLE_META[role]?.title ?? role;
  }, [role]);

  const title = useMemo(() => {
    if (step === "role") return "Sign in / Sign up";
    if (step === "method") return `Continue as ${roleLabel}`;
    if (step === "email") return `Email verification (${roleLabel})`;
    return `Enter code (${roleLabel})`;
  }, [step, roleLabel]);

  const goBack = useCallback(() => {
    if (step === "otp") return setStep("email");
    if (step === "email") return setStep("method");
    if (step === "method") return setStep(initialRole ? "method" : "role");
    onClose();
  }, [step, onClose, initialRole]);

  const signInWithGoogle = useCallback(async () => {
    if (!role) return;

    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?as=${encodeURIComponent(
      role,
    )}&next=${encodeURIComponent(next)}`;

    // OAuth оставляем через Supabase (callback уже всё проставляет: profile/roles/referral)
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }, [supabase, role, next]);

  const pickRole = (r: Exclude<UserRole, "ADMIN" | "GUEST">) => {
    setRole(r);
    setStep("method");
  };

  const goEmail = () => {
    if (!role) return;
    setStep("email");
  };

  const onEmailSuccess = (e: string) => {
    setEmail(e);
    setStep("otp");
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

              {/* STEP: METHOD */}
              {step === "method" ? (
                <div className="flex flex-col gap-3">
                  <Button
                    color="primary"
                    startContent={<Icon icon="solar:letter-bold" width={18} />}
                    onPress={goEmail}
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

                  <p className="text-tiny text-default-500 text-center mt-1">
                    You’ll be signed in as <b>{roleLabel}</b>. You can switch portal later.
                  </p>
                </div>
              ) : null}

              {/* STEP: EMAIL */}
              {step === "email" && role ? (
                <div className="flex flex-col gap-4">
                  <EmailForm as={role} next={next} onSuccess={onEmailSuccess} />
                </div>
              ) : null}

              {/* STEP: OTP */}
              {step === "otp" && role ? (
                <div className="flex flex-col gap-4">
                  <OtpForm
                    email={email}
                    as={role}
                    next={next}
                    onBack={() => setStep("email")}
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
