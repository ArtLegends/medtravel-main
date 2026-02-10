import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  dot?: boolean;
  className?: string;
  tone?: "teal" | "blue"; // опционально
};

export default function SectionBadge({ children, dot = false, className, tone = "teal" }: Props) {
  const toneClasses =
    tone === "blue"
      ? {
          wrap:
            "bg-gradient-to-r from-blue-600 to-sky-500 ring-1 ring-blue-500/30 shadow-[0_14px_34px_-18px_rgba(37,99,235,0.6)]",
          dot: "bg-white/95 shadow-[0_0_0_4px_rgba(255,255,255,0.18)]",
        }
      : {
          wrap:
            "bg-gradient-to-r from-teal-600 to-emerald-500 ring-1 ring-teal-500/30 shadow-[0_14px_34px_-18px_rgba(16,185,129,0.55)]",
          dot: "bg-white/95 shadow-[0_0_0_4px_rgba(255,255,255,0.18)]",
        };

  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full",
        "px-3.5 py-1.5 sm:px-4 sm:py-2",
        "text-[13px] sm:text-[14px] font-semibold tracking-tight text-white",
        "border border-white/15",
        "backdrop-blur",
        toneClasses.wrap,
        className ?? "",
      ].join(" ")}
    >
      {dot ? <span className={["h-2 w-2 rounded-full", toneClasses.dot].join(" ")} /> : null}
      <span className="leading-none">{children}</span>
    </div>
  );
}