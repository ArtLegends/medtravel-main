"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ResultsCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);

  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const len = safeImages.length;

  function mod(n: number) {
    return ((n % len) + len) % len;
  }

  function go(nextIdx: number) {
    if (len === 0) return;
    setIdx(mod(nextIdx));
  }

  if (len === 0) return null;

  const prevIdx = mod(idx - 1);
  const nextIdx = mod(idx + 1);

  const slots = [
    { slot: "prev", i: prevIdx },
    { slot: "current", i: idx },
    { slot: "next", i: nextIdx },
  ] as const;

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* 3 visible cells */}
      <div className="mx-auto flex max-w-[1320px] items-center justify-center gap-4">
        {slots.map(({ slot, i }) => {
          const src = safeImages[i];
          const isCurrent = slot === "current";

          return (
            <button
              key={`${slot}-${src}-${i}`}
              type="button"
              onClick={() => go(i)}
              className="shrink-0"
              aria-label={
                isCurrent ? `Текущий слайд ${i + 1}` : `Перейти к слайду ${i + 1}`
              }
            >
              <div
                className={[
                  "overflow-hidden rounded-3xl border bg-white shadow-sm",
                  // width increased to 410 on desktop, height unchanged
                  "w-[240px] h-[240px]",
                  "sm:w-[280px] sm:h-[280px]",
                  "lg:w-[410px] lg:h-[345px]",
                  // subtle emphasis for current
                  isCurrent ? "ring-2 ring-teal-200" : "opacity-95 hover:opacity-100",
                ].join(" ")}
              >
                <img
                  src={src}
                  alt={`Результат пациента ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* controls */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between sm:flex">
        <button
          type="button"
          onClick={() => go(idx - 1)}
          className="pointer-events-auto ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 shadow-sm hover:bg-white"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => go(idx + 1)}
          className="pointer-events-auto mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 shadow-sm hover:bg-white"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* dots */}
      <div className="mt-4 flex justify-center gap-2">
        {safeImages.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            className={
              "h-2 w-2 rounded-full transition " +
              (i === idx ? "bg-teal-600" : "bg-slate-300 hover:bg-slate-400")
            }
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}