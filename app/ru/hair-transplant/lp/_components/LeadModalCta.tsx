// app/ru/hair-transplant/lp/_components/LeadModalCta.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import LeadForm from "./LeadForm";

type Props = {
  buttonText: string;
  title?: string;
  subtitle?: string;
  className?: string;
  buttonVariant?: "default" | "secondary" | "outline";
};

export default function LeadModalCta({
  buttonText,
  title = "Запишитесь на бесплатную консультацию и расчёт стоимости",
  subtitle = "Оставьте контакты — мы свяжемся с вами и подскажем лучший вариант.",
  className,
  buttonVariant = "default",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size="lg" className={className}>
          {buttonText}
        </Button>
      </DialogTrigger>

      <DialogContent
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('[data-phone-dropdown]')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('[data-phone-dropdown]')) {
            e.preventDefault();
          }
        }}
        onFocusOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('[data-phone-dropdown]')) {
            e.preventDefault();
          }
        }}
        className={[
          "w-[calc(100vw-24px)] max-w-[520px] sm:max-w-[560px]",
          "rounded-2xl sm:rounded-3xl",
          "p-5 sm:p-6",
          "bg-white/95 backdrop-blur",
          "max-h-[85vh] overflow-auto",
        ].join(" ")}
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-center text-lg font-semibold leading-snug sm:text-xl">
            {title}
          </DialogTitle>
          <p className="text-center text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            {subtitle}
          </p>
        </DialogHeader>

        <div className="mt-4">
          {/* No onSubmitted — let the user complete the full flow (SMS verification etc.) 
              inside the modal. The modal stays open until the user closes it manually 
              or gets redirected to /patient after successful OTP verification. */}
          <LeadForm
            className="space-y-3.5"
            submitText="Отправить"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}