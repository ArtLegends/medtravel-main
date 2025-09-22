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
    slug: 'dr-cagatay-ozyildirim',
    name: 'Dr Çağatay Özyıldırım',
    city: 'Istanbul',
    country: 'Turkey',
    cover: 'https://cdn.whatclinic.com//clinics/thumbnails/stockpictures/236910a5efa39582/23.jpg?width=400&height=400&background-color=0xeeede8&operation=pad&float-y=0.25&hmac=8330f15bc95df732ac168471726b0839bfc4f522',
    priceFrom: 200,
    rating: 4.8,
    categories: ['dentistry', 'dentists'],
  }
];

export function getClinicsByCategory(category: string): CategoryClinic[] {
  const key = category.toLowerCase();
  return CATEGORY_CLINICS.filter((c) => c.categories.includes(key));
}

export function getAllCategories(): string[] {
  return Array.from(new Set(CATEGORY_CLINICS.flatMap((c) => c.categories)));
}
