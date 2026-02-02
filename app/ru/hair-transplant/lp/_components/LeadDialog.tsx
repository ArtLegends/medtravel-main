"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Phone, User, Calendar } from "lucide-react";

type Props = {
  title: string;
  primaryCta: string;
  secondaryCta?: string;
  variant?: "hero" | "final";
};

export default function LeadDialog({ title, primaryCta, secondaryCta, variant = "hero" }: Props) {
  const [open, setOpen] = useState(false);

  const cardClass = useMemo(() => {
    const base =
      "rounded-3xl border bg-white p-6 shadow-sm";
    if (variant === "hero") return base + " lg:min-w-[420px]";
    return base + " lg:min-w-[420px]";
  }, [variant]);

  return (
    <div className={cardClass}>
      <div className="text-center">
        <div className="text-base font-semibold text-slate-900">{title}</div>
      </div>

      <div className="mt-5 space-y-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full rounded-xl bg-teal-600 hover:bg-teal-700">
              {primaryCta}
            </Button>
          </DialogTrigger>

          {secondaryCta ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700"
            //   onClick={() => {
            //     // пока просто UX-кнопка без логики
            //     setOpen(true);
            //   }}
            >
              {secondaryCta}
            </Button>
          ) : null}

          <div className="mt-3 text-center text-[11px] text-slate-500">
            Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
          </div>

          <DialogContent className="sm:max-w-[520px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-center text-lg">
                Запишитесь на бесплатную консультацию и расчёт стоимости
              </DialogTitle>
            </DialogHeader>

            <form
              className="mt-2 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                // без логики отправки — по ТЗ
                setOpen(false);
              }}
            >
              <Field icon={<User className="h-4 w-4" />} placeholder="ФИО*" name="fullName" />
              <Field icon={<Phone className="h-4 w-4" />} placeholder="Телефон*" name="phone" />
              <Field icon={<Mail className="h-4 w-4" />} placeholder="Email" name="email" />
              <Field icon={<Calendar className="h-4 w-4" />} placeholder="Возраст" name="age" />

              <Button type="submit" className="w-full rounded-xl bg-teal-600 hover:bg-teal-700">
                Получить консультацию
              </Button>

              <div className="text-center text-[11px] text-slate-500">
                Мы свяжемся с вами и уточним детали.
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function Field({
  icon,
  placeholder,
  name,
}: {
  icon: React.ReactNode;
  placeholder: string;
  name: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </span>
      <Input
        name={name}
        placeholder={placeholder}
        className="h-11 rounded-xl pl-10"
        autoComplete="off"
      />
    </div>
  );
}
