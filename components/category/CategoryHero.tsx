// components/category/CategoryHero.tsx
"use client";

export default function CategoryHero({
  title,
  ctaText = "Receive a Personalized Offer on Us",
  onCtaClick,
}: {
  title: string;
  ctaText?: string;
  onCtaClick?: () => void;
}) {
  return (
    <section className="relative overflow-hidden bg-slate-800">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-14">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
            {title}
          </h1>
          <button
            onClick={onCtaClick}
            className="mt-6 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-600"
          >
            {ctaText}
          </button>
        </div>
      </div>
    </section>
  );
}
