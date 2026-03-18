// components/auth/AddRoleModal.tsx
"use client";

import React, { useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Divider, Card, CardBody,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Step = "pick" | "confirm" | "result";
type ResultStatus = "pending" | "granted" | "error";

const ROLE_META: Record<string, { title: string; subtitle: string; icon: string; needsApproval: boolean }> = {
  PATIENT: {
    title: "Patient",
    subtitle: "Book appointments, manage visits, chat with clinics",
    icon: "solar:heart-pulse-2-linear",
    needsApproval: false,
  },
  PARTNER: {
    title: "Partner",
    subtitle: "Referral links, programs, reports, payouts",
    icon: "solar:users-group-two-rounded-linear",
    needsApproval: true,
  },
  CUSTOMER: {
    title: "Clinic",
    subtitle: "Manage clinic profile, services, doctors and bookings",
    icon: "solar:hospital-linear",
    needsApproval: true,
  },
  SUPERVISOR: {
    title: "Supervisor",
    subtitle: "Recruit partners, earn from their referrals",
    icon: "solar:crown-linear",
    needsApproval: true,
  },
};

export default function AddRoleModal({ open, onClose }: Props) {
  const router = useRouter();
  const { session, roles, refreshRoles, setActiveRole } = useSupabase();

  const [step, setStep] = useState<Step>("pick");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resultStatus, setResultStatus] = useState<ResultStatus>("pending");
  const [resultMessage, setResultMessage] = useState("");

  const userEmail = session?.user?.email ?? null;
  const hasEmail = !!userEmail;

  // Roles the user doesn't have yet
  const availableRoles = ["PATIENT", "PARTNER", "CUSTOMER", "SUPERVISOR"].filter(
    (r) => !roles.includes(r as UserRole)
  );

  const reset = useCallback(() => {
    setStep("pick");
    setSelectedRole(null);
    setBusy(false);
    setResultStatus("pending");
    setResultMessage("");
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handlePickRole = (role: string) => {
    setSelectedRole(role);
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!selectedRole) return;
    setBusy(true);

    try {
      const res = await fetch("/api/auth/add-role", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (json?.already_has) {
          setResultStatus("granted");
          setResultMessage("You already have this role! Redirecting...");
          await refreshRoles();
          setActiveRole(selectedRole as UserRole);
          setTimeout(() => {
            const map: Record<string, string> = { PATIENT: "/patient", PARTNER: "/partner", CUSTOMER: "/customer", SUPERVISOR: "/supervisor" };
            router.push(map[selectedRole] ?? "/");
            handleClose();
          }, 1000);
          setStep("result");
          return;
        }
        setResultStatus("error");
        setResultMessage(json?.error ?? "Failed to request role");
        setStep("result");
        return;
      }

      if (json.status === "granted") {
        setResultStatus("granted");
        setResultMessage(`${ROLE_META[selectedRole]?.title} role activated! Redirecting...`);
        await refreshRoles();
        setActiveRole(selectedRole as UserRole);
        setTimeout(() => {
          const map: Record<string, string> = { PATIENT: "/patient", PARTNER: "/partner", CUSTOMER: "/customer", SUPERVISOR: "/supervisor" };
          router.push(map[selectedRole] ?? "/");
          handleClose();
        }, 1500);
      } else {
        setResultStatus("pending");
        setResultMessage(`Your request for ${ROLE_META[selectedRole]?.title} access has been submitted. You'll receive an email once approved.`);
      }

      setStep("result");
    } catch (e: any) {
      setResultStatus("error");
      setResultMessage(e?.message ?? "Network error");
      setStep("result");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={open} onOpenChange={(v) => { if (!v) handleClose(); }} placement="center" backdrop="blur" size="md">
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <Icon icon="solar:add-circle-linear" width={20} />
              <span>
                {step === "pick" ? "Add another role" :
                 step === "confirm" ? `Confirm — ${ROLE_META[selectedRole!]?.title}` :
                 "Request status"}
              </span>
            </ModalHeader>

            <Divider />

            <ModalBody className="py-5">
              {/* STEP: Pick Role */}
              {step === "pick" && (
                <div className="space-y-3">
                  {hasEmail && (
                    <div className="rounded-lg border bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      Signed in as <span className="font-semibold">{userEmail}</span>. No password needed — role will be linked to your existing account.
                    </div>
                  )}

                  {!hasEmail && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      Your account doesn't have an email address. Some roles require email for approval process. Please add an email in your profile settings first.
                    </div>
                  )}

                  {availableRoles.length === 0 ? (
                    <div className="text-center py-6 text-slate-500">
                      You already have all available roles!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {availableRoles.map((r) => {
                        const meta = ROLE_META[r];
                        if (!meta) return null;
                        const disabled = !hasEmail && meta.needsApproval;

                        return (
                          <Card
                            key={r}
                            isPressable={!disabled}
                            isDisabled={disabled}
                            onPress={() => !disabled && handlePickRole(r)}
                            className={`border border-divider transition-colors ${disabled ? "opacity-50" : "hover:border-primary"}`}
                          >
                            <CardBody className="flex flex-row items-center gap-4 py-4">
                              <div className="h-10 w-10 rounded-full bg-default-100 flex items-center justify-center">
                                <Icon icon={meta.icon} width={22} />
                              </div>
                              <div className="flex flex-col flex-1">
                                <div className="font-semibold">{meta.title}</div>
                                <div className="text-tiny text-default-500">{meta.subtitle}</div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {meta.needsApproval ? (
                                  <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Needs approval</span>
                                ) : (
                                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Instant</span>
                                )}
                                <Icon icon="solar:alt-arrow-right-linear" width={16} className="text-default-400" />
                              </div>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* STEP: Confirm */}
              {step === "confirm" && selectedRole && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-xl border p-4">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <Icon icon={ROLE_META[selectedRole].icon} width={26} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{ROLE_META[selectedRole].title}</div>
                      <div className="text-sm text-default-500">{ROLE_META[selectedRole].subtitle}</div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 border p-3 text-sm text-slate-600 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:user-check-rounded-linear" width={16} className="text-emerald-500" />
                      <span>Account: <b>{userEmail}</b></span>
                    </div>
                    {ROLE_META[selectedRole].needsApproval ? (
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:clock-circle-linear" width={16} className="text-amber-500" />
                        <span>This role requires admin approval. You'll get an email when approved.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:check-circle-linear" width={16} className="text-emerald-500" />
                        <span>This role will be activated immediately.</span>
                      </div>
                    )}
                  </div>

                  <Button
                    color="primary"
                    className="w-full"
                    isLoading={busy}
                    onPress={handleConfirm}
                  >
                    {ROLE_META[selectedRole].needsApproval ? "Submit request" : "Activate role"}
                  </Button>
                </div>
              )}

              {/* STEP: Result */}
              {step === "result" && (
                <div className="space-y-4 text-center py-4">
                  {resultStatus === "granted" && (
                    <>
                      <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Icon icon="solar:check-circle-bold" width={40} className="text-emerald-500" />
                      </div>
                      <div className="text-lg font-semibold text-emerald-700">Role activated!</div>
                    </>
                  )}
                  {resultStatus === "pending" && (
                    <>
                      <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                        <Icon icon="solar:clock-circle-bold" width={40} className="text-amber-500" />
                      </div>
                      <div className="text-lg font-semibold text-amber-700">Request submitted</div>
                    </>
                  )}
                  {resultStatus === "error" && (
                    <>
                      <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                        <Icon icon="solar:close-circle-bold" width={40} className="text-red-500" />
                      </div>
                      <div className="text-lg font-semibold text-red-700">Error</div>
                    </>
                  )}
                  <p className="text-sm text-default-500">{resultMessage}</p>
                </div>
              )}
            </ModalBody>

            <Divider />

            <ModalFooter>
              {step === "result" ? (
                <Button variant="ghost" color="primary" onPress={handleClose}>Done</Button>
              ) : step === "confirm" ? (
                <Button variant="ghost" color="primary" onPress={() => setStep("pick")}>← Back</Button>
              ) : (
                <Button variant="ghost" color="primary" onPress={handleClose}>Cancel</Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}