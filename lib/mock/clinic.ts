// lib/mock/clinic.ts
export type ClinicMock = {
  slug: string;
  name: string;
  country: string;
  city: string;
  district?: string;
  about: string;
  images: string[];
  payments?: string[]; // допустим, иконки/лейблы
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
  // бэйджи под названием
  verifiedByMedtravel?: boolean;
  isOfficialPartner?: boolean;
};

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
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWGNSUDbKL8jg2WWrIriEo_tICC9AqHqn2Jw&s',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw5yTM-WQjG0gErTfnI6F2RdlrD7cN0sbUby_cN1btlAjeTmJNQHkSV4BEt80Hk35ADUY&usqp=CAU',
      // 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWfAN5oNM96tckSGOkJvDo6S6L4PmJ2JPu88ZUEu2ea4Jo4Oz6TA9-ZavsXCzY5hCWyMY&usqp=CAU',
      // 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLmhZmMglX9ZOXGGWAF0Um0_1fNUxUjeTKeyLRFp7fQ6gtBENNIvn4m0o6h4Rxkz5Ygic&usqp=CAU',
      // 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRisWbCub7Pq3X2gDseo_RitzWcTgksHHnya7vi8-treqy81FCZ4yUNnkoatS1pDz9t_1o&usqp=CAU',
    ],
    payments: ['Cash', 'VISA', 'Mastercard', 'Apple Pay', 'Google Pay'],
    services: [
      { name: 'Dental Implant', price: '$850', duration: '2-3 days' },
      { name: 'Crown', price: '$350', duration: '1 day' },
      { name: 'Veneer', price: '$300', duration: '1-2 days' },
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
      address: 'Halaskargazi Caddesi No: 26-36 Nişantaşı Lotus Ofisleri B Blok No:5 Pangaltı, 34371 Şişli/İstanbul, Турция',
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.814797344833!2d28.987831000000003!3d41.05117899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7d42978bb9d%3A0x5e1b321d23860f73!2sClinic%20EGO!5e0!3m2!1sru!2skh!4v1757327041393!5m2!1sru!2skh',
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
  },
};

export function getClinicBySlug(slug: string): ClinicMock | null {
  return MOCK_CLINICS[slug] ?? null;
}

// для удобства — если где-то звали иначе
export const clinicsBySlug = MOCK_CLINICS;
export const getMockClinicBySlug = getClinicBySlug;
