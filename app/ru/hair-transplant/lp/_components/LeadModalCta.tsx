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
        className={[
          // мобилки: почти на весь экран, но с отступами
          "w-[calc(100vw-24px)] max-w-[520px] sm:max-w-[560px]",
          "rounded-2xl sm:rounded-3xl",
          "p-5 sm:p-6",
          "bg-white/95 backdrop-blur",
          // чтобы на маленьких экранах не вылезало за высоту
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
          <LeadForm
            className="space-y-3.5"
            submitText="Отправить"
            onSubmitted={() => setOpen(false)}
          />

        </div>
      </DialogContent>
    </Dialog>
  );
}