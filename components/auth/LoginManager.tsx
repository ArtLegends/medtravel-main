"use client";

import { useState } from "react";
import EmailForm from "./EmailForm";
import OtpForm from "./OtpForm";

export default function LoginManager() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");

  const handleEmailSuccess = (emailValue: string) => {
    setEmail(emailValue);
    setStep("otp");
  };

  const handleBack = () => {
    setStep("email");
    setEmail("");
  };

  if (step === "otp") {
    return <OtpForm email={email} onBack={handleBack} />;
  }

  return <EmailForm onSuccess={handleEmailSuccess} />;
}
