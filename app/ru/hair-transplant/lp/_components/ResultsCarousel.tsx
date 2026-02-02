"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ResultsCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const safeImages = useMemo(() => images.filter(Boolean), [images]);

  function scrollTo(i: number) {
    const next = Math.max(0, Math.min(i, safeImages.length - 1));
    setIdx(next);
    const el = wrapRef.current?.querySelectorAll<HTMLElement>("[data-slide]")?.[next];
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  if (safeImages.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={wrapRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" as any }}
      >
        {safeImages.map((src, i) => (
          <div
            key={src + i}
            data-slide
            className="min-w-[85%] sm:min-w-[60%] lg:min-w-[42%]"
            style={{ scrollSnapAlign: "center" as any }}
          >
            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
              <div className="aspect-[16/9] bg-slate-100">
                <img
                  src={src}
                  alt={`Результат пациента ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* controls */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between sm:flex">
        <button
          type="button"
          onClick={() => scrollTo(idx - 1)}
          className="pointer-events-auto ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 shadow-sm hover:bg-white"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => scrollTo(idx + 1)}
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
            onClick={() => scrollTo(i)}
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
