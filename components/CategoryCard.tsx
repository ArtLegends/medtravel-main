// components/CategoryCard.tsx
'use client';

import Link from 'next/link';
import type { Category } from '@/lib/supabase/requests';

type Props = {
  // нам в карточке нужны только эти поля
  category: Pick<Category, 'id' | 'slug' | 'name'>;
};

export default function CategoryCard({ category }: Props) {
  if (!category) return null;

  return (
    <Link href={`/${category.slug}`} className="block">
      <article className="rounded-xl border p-4 hover:shadow-md transition">
        <h3 className="text-lg font-medium">{category.name}</h3>
        {/* тут можно добавить описание/иконку */}
      </article>
    </Link>
  );
}
