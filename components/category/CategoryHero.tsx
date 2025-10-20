// components/category/CategoryHero.tsx
'use client';

import { useState } from 'react';
// Если ты положил модалку в components/admin/bookings — оставь этот импорт,
// если перенёс в components/bookings — измени путь на '@/components/bookings/BookingsModal'
import BookingsModal from '@/components/admin/bookings/BookingsModal';

export default function CategoryHero({
  title,
  categoryName,                           // ← имя категории для автоподстановки
  ctaText = 'Receive a Personalized Offer on Us',
}: {
  title: string;
  categoryName: string;
  ctaText?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden bg-slate-800">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-14">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
              {title}
            </h1>
            <button
              onClick={() => setOpen(true)}
              className="mt-6 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-600"
            >
              {ctaText}
            </button>
          </div>
        </div>
      </section>

      {/* компактная модалка, как на странице клиники */}
      <BookingsModal
        open={open}
        onClose={() => setOpen(false)}
        preselectedService={categoryName}   // ← подставляем текущую категорию
      />
    </>
  );
}
