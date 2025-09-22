// lib/mock/clinic.ts 
export type ClinicMock = {
  slug: string;
  name: string;
  country: string;
  city: string;
  district?: string;
  about: string;
  images: string[];
  // для листингов
  rating?: number;          // 0..5
  fromPrice?: number;       // минимальная цена, для "From $..."
  tags?: string[];          // короткие теги (crowns, veneers и т.п.)

  payments?: string[];

  // персонал
  staff?: Array<{
    name: string;
    position: string;
    experienceYears?: number;
    languages?: string[];
    specialisations?: string[];
    photo?: string;
    bio?: string;
  }>;

  // услуги
  services?: Array<{
    name: string;
    price?: string | number;
    description?: string;
  }>;

  // аккредитации — поддерживаем оба формата
  accreditations?: Array<
    | { title: string; country?: string; desc?: string }
    | { name: string; logo_url?: string; description?: string }
  >;

  // часы работы
  hours?: Array<{ day: string; open?: string; close?: string }>;

  // локация
  location?: {
    address: string;
    mapEmbedUrl?: string;
  };

  // дополнительные сервисы (как в референсе)
  additionalServices?: {
    premises?: string[];
    clinic_services?: string[];
    travel_services?: string[];
    languages_spoken?: string[];
  };

  // бейджи
  verifiedByMedtravel?: boolean;
  isOfficialPartner?: boolean;
};

// ---------------- MOCK ----------------

const MOCK_CLINICS: Record<string, ClinicMock> = {
  'dr-cagatay-ozyildirim': {
    slug: 'dr-cagatay-ozyildirim',
    name: 'Dr Çağatay Özyıldırım',
    country: 'Turkey',
    city: 'Istanbul',
    district: 'Şişli',
    about:
      'Dr Çağatay Özyıldırım Care is a dental clinic located in Istanbul, Turkey, offering a comprehensive range of dental services. The clinic provides treatments in general dentistry, cosmetic procedures, and restorative care. Services include routine cleanings, fillings, and preventive care, as well as cosmetic treatments such as teeth whitening, veneers, and orthodontic options like braces and Invisalign. For restorative needs, the clinic offers dental implants, dentures, and fixed prostheses. Advanced diagnostic tools, including 3D dental X-rays, are utilised to support accurate treatment planning.',

    // геро-галерея (1 большой + до 4 превью)
    images: [
      'https://pixsector.com/cache/517d8be6/av5c8336583e291842624.png',
      
    ],

    // чтобы попадать в категорию /dentistry
    tags: ['dentistry', 'dentists'],

    // методы оплаты (для сайдбара)
    payments: ['Cash', 'VISA', 'Mastercard', 'Apple Pay', 'Google Pay'],

    // услуги
    services: [
      {
        name: 'Bone Graft',
        price: 300,
        description:
          'Bone grafts are important in dentistry for implant treatments because they help to create a strong and stable foundation for the implant.',
      },
      {
        name: 'Dental Crowns',
        price: 250,
        description:
          'Dental crowns are a common method used to repair and protect damaged teeth.',
      },
      {
        name: 'Dental Bridges',
        price: 500,
        description:
          'Dental bridges are a common method used to replace missing teeth in dentistry.',
      },
    ],

    // персонал (сопоставил с твоим форматом: Job Title → position, Languages → массив, Biography → bio)
    staff: [
      {
        name: 'Mr Alexis Hernandez',
        position: 'Chief Executive',
        languages: ['English', 'Spanish'],
        bio: 'He is in charge of daily operations and finances. He has spent his entire life in this dental office and is committed to the quality and prestige of maintaining it to its highest standards.',
        photo: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39',
      },
      {
        name: 'Mr Luis Padilla',
        position: 'Administration Manager',
        languages: ['English', 'Spanish'],
        bio: 'Business Administration and Fianncing Marketing Career Highligts 9 Year Dental advisor. Patient coordiantor Clinic manager, in charge of daily operation, making sure everything is ready for Bussiness operations.',
        photo: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c',
      },
    ],

    // аккредитации (новый формат с логотипами)
    accreditations: [
      {
        name: 'TDB - Turkish Dental Association (Turkey)',
        logo_url:
          'https://cdn.whatclinic.com/thumbnails/f64f2175f6ac5bd4/turk_dishekimleri_birligi.png?width=89&height=45&background-color=0xeeede8&operation=pad&float-y=0.25&hmac=b8a58951a71977ec23514e50e3edd9a48ed030a6',
        description: '',
      },
      {
        name: 'ESCD - European Society of Cosmetic Dentistry (International)',
        logo_url:
          'https://cdn.whatclinic.com/thumbnails/48cdc7977bef10e6/european_society_of_cosmetic_dentistry.png?width=89&height=45&background-color=0xeeede8&operation=pad&float-y=0.25&hmac=92bf5f40ca3880fcd021b903b2dfaa63924a2aac',
        description: '',
      },
    ],

    // график работы (как в примере)
    hours: [
      { day: 'MONDAY', open: '09:30', close: '20:00' },
      { day: 'TUESDAY', open: '09:30', close: '20:00' },
      { day: 'WEDNESDAY', open: '09:30', close: '20:00' },
      { day: 'THURSDAY', open: '09:30', close: '20:00' },
      { day: 'FRIDAY', open: '09:30', close: '20:00' },
      { day: 'SATURDAY', open: '10:00', close: '17:00' },
      { day: 'SUNDAY' }, // как в референсе — прочерк
    ],

    location: {
      address:
        'Harbiye, Mim Kemal Öke Cd. No:6, 34367, Şişli/İstanbul, 34250 Turkey',
      mapEmbedUrl:
        'https://www.google.com/maps?q=41.049758,28.990391&z=16&output=embed',
    },

    // Additional Services (1:1 с макетом)
    additionalServices: {
      premises: [
        'Parking',
        'Accessible to disabled people',
        'Public transport access',
        'Wheelchair accessible toilet',
        'Access without steps',
        'Disabled parking',
        'Patient bathroom',
        'Wireless access',
        'On-site pharmacy',
      ],
      clinic_services: ['Open weekends'],
      travel_services: [
        'International travel',
        'Local travel',
        'Local accommodation',
        'Translation services',
        'Local guide',
        'Tours and vacation services',
        'Pick up service from hotel',
        'Pick up service from airport',
      ],
      // если нужны — добавь языки, иначе карточка просто не отрендерится
      languages_spoken: [],
    },

    verifiedByMedtravel: true,
    isOfficialPartner: true,
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
