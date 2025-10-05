// components/WhyChooseUs.tsx
'use client'

import type { Category } from '@/lib/supabase/requests'
import CategoryCard from './category/CategoryCard'

interface Props {
  categories: Category[]  // передадим сверху список категорий
}

export default function WhyChooseUs({ categories }: Props) {
  return (
    <section className="container mx-auto py-20 space-y-12">
      {/* 1. Заголовок */}
      <h2 className="text-3xl font-bold text-center">Why Choose Us?</h2>

      {/* 2. Статистика */}
      <div className="flex justify-center gap-12">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">700+</div>
          <div className="text-sm text-gray-600">clinics</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">10+</div>
          <div className="text-sm text-gray-600">years of industry expertise</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">500+</div>
          <div className="text-sm text-gray-600">satisfied patients</div>
        </div>
      </div>

      {/* 3. Сетка карточек категорий */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map(cat => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </section>
  )
}
