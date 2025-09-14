// lib/mock/clinic.ts
export type ClinicMock = {
  slug: string;
  name: string;
  country: string;
  city: string;
  district?: string;
  about: string;
  images: string[];
  // дополнительные (опц.) поля для листингов
  rating?: number;          // 0..5
  fromPrice?: number;       // минимальная цена, для "From $..."
  tags?: string[];          // короткие теги (crowns, veneers и т.п.)

  payments?: string[];
  staff?: Array<{
    name: string;
    position: string;
    experienceYears?: number;
    languages?: string[];
    specialisations?: string[];
    photo?: string;
  }>;
  services?: Array<{
    name: string;
    price?: string | number;
    duration?: string;
  }>;
  accreditations?: Array<{ title: string; country?: string; desc?: string }>;
  hours?: Array<{ day: string; open?: string; close?: string }>;
  location?: {
    address: string;
    mapEmbedUrl?: string;
  };
  verifiedByMedtravel?: boolean;
  isOfficialPartner?: boolean;
};

// ---------------- MOCK ----------------

const MOCK_CLINICS: Record<string, ClinicMock> = {
  'premium-aesthetic-istanbul': {
    slug: 'premium-aesthetic-istanbul',
    name: 'Premium Aesthetic Istanbul',
    country: 'Turkey',
    city: 'Istanbul',
    district: 'Besiktas',
    about:
      'State-of-the-art clinic in the heart of Istanbul. We provide cosmetic dentistry, implants, orthodontics, and more.',
    images: [
      'https://images.unsplash.com/photo-1518131678677-a9b1e8e1f3bd?q=80&w=1200',
      'https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=1200',
    ],
    rating: 4.8,
    fromPrice: 200,
    tags: ['hair-transplant', 'dental-implants'],
    payments: ['Cash', 'VISA', 'Mastercard', 'Apple Pay', 'Google Pay'],
    services: [
      { name: 'Dental Implant', price: '$850', duration: '2-3 days' },
      { name: 'Crown',         price: '$350', duration: '1 day'   },
      { name: 'Veneer',        price: '$300', duration: '1-2 days'},
      { name: 'Teeth Whitening', price: '$200', duration: '1 day' },
    ],
    staff: [
      {
        name: 'Dr. John Smith',
        position: 'Consultant & Assistant Professor, Department of Plastic Surgery',
        experienceYears: 8,
        languages: ['English', 'Turkish'],
        specialisations: ['Implantology', 'Oral Surgery'],
      },
      {
        name: 'Dr. Sarah Johnson',
        position: 'Assistant Professor, Department of Dental Surgery',
        experienceYears: 10,
        languages: ['English', 'Turkish', 'German'],
        specialisations: ['Cosmetic Dentistry', 'Implantology'],
      },
    ],
    accreditations: [
      { title: 'Joint Commission International', country: 'US' },
      { title: 'Turkish Medical Association', country: 'TR' },
    ],
    hours: [
      { day: 'MONDAY', open: '09:00', close: '19:00' },
      { day: 'TUESDAY', open: '09:00', close: '19:00' },
      { day: 'WEDNESDAY', open: '09:00', close: '19:00' },
      { day: 'THURSDAY', open: '09:00', close: '19:00' },
      { day: 'FRIDAY', open: '09:00', close: '19:00' },
      { day: 'SATURDAY', open: '09:00', close: '19:00' },
      { day: 'SUNDAY' },
    ],
    location: {
      address:
        'Halaskargazi Caddesi No: 26-36 Nişantaşı Lotus Ofisleri B Blok No:5 Pangaltı, 34371 Şişli/İstanbul, Turkey',
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.814797344833!2d28.987831!3d41.051179!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7d42978bb9d%3A0x5e1b321d23860f73!2sClinic%20EGO!5e0!3m2!1sen!2s',
    },
    verifiedByMedtravel: true,
    isOfficialPartner: true,
  },

  'ankara-dental-clinic': {
    slug: 'ankara-dental-clinic',
    name: 'Ankara Dental Clinic',
    country: 'Turkey',
    city: 'Ankara',
    about: 'Modern clinic providing a full range of dental services.',
    images: [
      'https://images.unsplash.com/photo-1530023367847-a683933f4176?q=80&w=1200',
    ],
    rating: 4.6,
    fromPrice: 180,
    tags: ['crowns', 'veneers'],
    services: [
      { name: 'Crown',  price: '$320', duration: '1 day' },
      { name: 'Veneer', price: '$280', duration: '1-2 days' },
    ],
  },

  'medplast-warsaw': {
    slug: 'medplast-warsaw',
    name: 'MedPlast Warsaw',
    country: 'Poland',
    city: 'Warsaw',
    about: 'Plastic surgery and dental procedures with European standards.',
    images: [
      'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=1200',
    ],
    rating: 4.7,
    fromPrice: 160,
    tags: ['plastic-surgery'],
    services: [
      { name: 'Crown', price: '$290', duration: '1 day' },
    ],
  },
};

// --------- API ---------

export function getClinicBySlug(slug: string): ClinicMock | null {
  return MOCK_CLINICS[slug] ?? null;
}

export const clinicsBySlug = MOCK_CLINICS;

// массив для листингов / категорий
export const clinics: ClinicMock[] = Object.values(MOCK_CLINICS);

// удобный фильтр для страницы категории
export function getClinicsByCategory(category: string): ClinicMock[] {
  const cat = category.toLowerCase();
  return clinics.filter((c) => {
    const svc = (c.services ?? []).map((s) => (s.name ?? '').toLowerCase());
    const tgs = (c.tags ?? []).map((t) => t.toLowerCase());
    return svc.some((n) => n.includes(cat)) || tgs.some((t) => t.includes(cat));
  });
}

// обратная совместимость
export const getMockClinicBySlug = getClinicBySlug;
