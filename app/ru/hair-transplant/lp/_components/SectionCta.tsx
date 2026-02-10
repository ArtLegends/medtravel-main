'use client';

import LeadModalCta from "./LeadModalCta";

type Props = {
  badge?: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonVariant?: "default" | "secondary" | "outline";
  note?: string;
  className?: string;
};

export default function SectionCta({
  badge,
  title,
  subtitle,
  buttonText,
  buttonVariant = "default",
  note = "Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности",
  className,
}: Props) {
  return (
    <div
      className={[
        "relative w-full max-w-3xl overflow-hidden rounded-3xl border",
        "bg-white/75 backdrop-blur",
        "p-6 text-center shadow-[0_22px_70px_-55px_rgba(15,23,42,0.55)] ring-1 ring-black/5",
        "sm:p-8",
        className ?? "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 opacity-90 bg-[radial-gradient(700px_circle_at_15%_0%,rgba(20,184,166,0.14),transparent_55%),radial-gradient(700px_circle_at_90%_15%,rgba(59,130,246,0.12),transparent_55%)]" />

      <div className="relative">
        {badge ? (
          <div className="mx-auto mb-3 inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-800 ring-1 ring-black/5">
            {badge}
          </div>
        ) : null}

        <div className="text-base font-semibold text-slate-900 sm:text-lg">{title}</div>

        {subtitle ? (
          <div className="mt-1 text-sm leading-relaxed text-slate-600">{subtitle}</div>
        ) : null}

        <div className="mt-5 flex justify-center">
          <LeadModalCta
            buttonText={buttonText}
            className="w-full sm:w-auto"
            buttonVariant={buttonVariant}
          />
        </div>

        {note ? <div className="mt-3 text-xs text-slate-500">{note}</div> : null}
      </div>
    </div>
  );
}