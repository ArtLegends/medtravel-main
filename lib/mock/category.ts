// lib/mock/category.ts
export type CategoryClinic = {
  slug: string;
  name: string;
  city: string;
  country: string;
  cover: string;
  priceFrom?: number;
  rating?: number;
  categories: string[]; // ключи категорий в нижнем регистре
};

export const CATEGORY_CLINICS: CategoryClinic[] = [
  {
    slug: 'premium-aesthetic-istanbul',
    name: 'Premium Aesthetic Istanbul',
    city: 'Istanbul',
    country: 'Turkey',
    cover: 'https://images.unsplash.com/photo-1550336406-6f1cf9a28f67?q=80&w=1200',
    priceFrom: 200,
    rating: 4.8,
    categories: ['crowns', 'veneers', 'implants'],
  },
  {
    slug: 'medical-magnus',
    name: 'Medical Magnus',
    city: 'Lodz',
    country: 'Poland',
    cover: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200',
    priceFrom: 160,
    rating: 4.6,
    categories: ['crowns', 'plastic-surgery'],
  },
  {
    slug: 'smile-pro-prague',
    name: 'Smile Pro Prague',
    city: 'Prague',
    country: 'Czech Republic',
    cover: 'https://images.unsplash.com/photo-1588771930292-4cbf57176f5f?q=80&w=1200',
    priceFrom: 180,
    rating: 4.7,
    categories: ['veneers', 'whitening', 'crowns'],
  },
];

export function getClinicsByCategory(category: string): CategoryClinic[] {
  const key = category.toLowerCase();
  return CATEGORY_CLINICS.filter((c) => c.categories.includes(key));
}

export function getAllCategories(): string[] {
  return Array.from(new Set(CATEGORY_CLINICS.flatMap((c) => c.categories)));
}
