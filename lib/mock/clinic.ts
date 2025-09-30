// lib/mock/clinic.ts

export type ClinicMock = {
  slug: string;
  name: string;
  country: string;
  city: string;
  district?: string;
  about: string;
  images: string[];
  categories?: string[];

  // для листингов
  rating?: number;        // 0..5
  fromPrice?: number;     // минимальная цена, для "From $..."
  tags?: string[];

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
    description?: string; // либо duration в старом формате
    duration?: string;    // на всякий случай — поддержим старое поле
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
  "dr-cagatay-ozyildirim": {
    slug: "dr-cagatay-ozyildirim",
    name: "Dr Çağatay Özyıldırım",
    country: "Turkey",
    city: "Istanbul",
    district: "Şişli",
    about:
      "Dr Çağatay Özyıldırım Care is a dental clinic located in Istanbul, Turkey, offering a comprehensive range of dental services. The clinic provides treatments in general dentistry, cosmetic procedures, and restorative care. Services include routine cleanings, fillings, and preventive care, as well as cosmetic treatments such as teeth whitening, veneers, and orthodontic options like braces and Invisalign. For restorative needs, the clinic offers dental implants, dentures, and fixed prostheses. Advanced diagnostic tools, including 3D dental X-rays, are utilised to support accurate treatment planning.",

    // геро-галерея (1 большой + до 4 превью)
    images: [
      "https://cdn.whatclinic.com/clinics/thumbnails/stockpictures/236910a5efa39582/23.jpg?width=400&height=400&background-color=0xeeede8&operation=pad&float-y=0.25&hmac=8330f15bc95df732ac168471726b0839bfc4f522",
      // можно добавить дополнительные превью сюда
    ],

    categories: ["dentistry"],

    // чтобы попадать в категорию /dentistry
    // tags: ["dentistry", "dentists"],

    // методы оплаты (для сайдбара)
    payments: ["Cash", "VISA", "Mastercard", "Apple Pay", "Google Pay"],

    // услуги
    services: [
      {
        name: "Bone Graft",
        price: "$300",
        description:
          "Bone grafts are important in dentistry for implant treatments because they help to create a strong and stable foundation for the implant.",
      },
      {
        name: "Dental Crowns",
        price: "$250",
        description:
          "Dental crowns are a common method used to repair and protect damaged teeth.",
      },
      {
        name: "Dental Bridges",
        price: "$500",
        description:
          "Dental bridges are a common method used to replace missing teeth in dentistry.",
      },
    ],

    // персонал
    staff: [
      {
        name: "Mr Alexis Hernandez",
        position: "Chief Executive",
        languages: ["English", "Spanish"],
        bio: "He is in charge of daily operations and finances. He has spent his entire life in this dental office and is committed to the quality and prestige of maintaining it to its highest standards.",
        photo: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39",
      },
      {
        name: "Mr Luis Padilla",
        position: "Administration Manager",
        languages: ["English", "Spanish"],
        bio: "Business Administration and Fianncing Marketing Career Highligts 9 Year Dental advisor. Patient coordiantor Clinic manager, in charge of daily operation, making sure everything is ready for Bussiness operations.",
        photo: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c",
      },
    ],

    // аккредитации (новый формат с логотипами)
    accreditations: [
      {
        name: "TDB - Turkish Dental Association (Turkey)",
        logo_url:
          "https://cdn.whatclinic.com/thumbnails/f64f2175f6ac5bd4/turk_dishekimleri_birligi.png?width=89&height=45&background-color=0xeeede8&operation=pad&float-y=0.25&hmac=b8a58951a71977ec23514e50e3edd9a48ed030a6",
        description: "",
      },
      {
        name: "ESCD - European Society of Cosmetic Dentistry (International)",
        logo_url:
          "https://cdn.whatclinic.com/thumbnails/48cdc7977bef10e6/european_society_of_cosmetic_dentistry.png?width=89&height=45&background-color=0xeeede8&operation=pad&float-y=0.25&hmac=92bf5f40ca3880fcd021b903b2dfaa63924a2aac",
        description: "",
      },
    ],

    // график работы
    hours: [
      { day: "MONDAY", open: "09:30", close: "20:00" },
      { day: "TUESDAY", open: "09:30", close: "20:00" },
      { day: "WEDNESDAY", open: "09:30", close: "20:00" },
      { day: "THURSDAY", open: "09:30", close: "20:00" },
      { day: "FRIDAY", open: "09:30", close: "20:00" },
      { day: "SATURDAY", open: "10:00", close: "17:00" },
      { day: "SUNDAY" }, // прочерк
    ],

    location: {
      address:
        "Harbiye, Mim Kemal Öke Cd. No:6, 34367, Şişli/İstanbul, 34250 Turkey",
      mapEmbedUrl:
        "https://www.google.com/maps?q=41.049758,28.990391&z=16&output=embed",
    },

    // Additional Services (1:1 с макетом)
    additionalServices: {
      premises: [
        "Parking",
        "Accessible to disabled people",
        "Public transport access",
        "Wheelchair accessible toilet",
        "Access without steps",
        "Disabled parking",
        "Patient bathroom",
        "Wireless access",
        "On-site pharmacy",
      ],
      clinic_services: ["Open weekends"],
      travel_services: [
        "International travel",
        "Local travel",
        "Local accommodation",
        "Translation services",
        "Local guide",
        "Tours and vacation services",
        "Pick up service from hotel",
        "Pick up service from airport",
      ],
      languages_spoken: [],
    },

    verifiedByMedtravel: true,
    isOfficialPartner: true,
  },
  "novusklinik-kadikoy": {
    slug: "novusklinik-kadikoy",
    name: "Novusklinik - Kadıköy",
    country: "Turkey",
    city: "Istanbul",
    district: "",
    about:
      "Pioneer and Leader of The Single Stage Implant Procedure. Experts in All Dental Treatments. Since 2009, Novusklinik is Serving with 100% Satisfaction Guarantee. Combination of Highly Expert Doctors and Best Quality Metarials Results in Absolute Success at Novusklinik. Check Out The Experience Videos of Our Patients at Youtube, Facebook, Instagram, Tik Tok, X and Threads. Search @novusklinikistanbul. And Even Better, Contact With Us And Ask Every Questions You Wonder To Our Lovely Representatives.",

    // геро-галерея (1 большой + до 4 превью)
    images: [
      "https://cdn.whatclinic.com//dentists/turkey/istanbul-province/istanbul/kadikoy/novusklinik-kadikoy/thumbnails/6064b512f2accb21/whatsapp_image_20231116_at_162617.jpg?width=400&height=400&background-color=0xeeede8&operation=pad&float-y=0.25&hmac=78c4fe68b4115c2a26cb8935e502bd3c520d37c6",
      // можно добавить дополнительные превью сюда
    ],

    categories: ["dentistry"],

    // чтобы попадать в категорию /dentistry
    // tags: ["dentistry", "dentists"],

    // методы оплаты (для сайдбара)
    payments: ["Discounts", "Payment plans", "Free initial consultation", "Cheques", "Credit cards"],

    // услуги
    services: [
      {
        name: "Bone Graft",
        price: "803 zł",
        description:
          "",
      },
      {
        name: "CAD/CAM Dental Restorations",
        price: "298 zł",
        description:
          "",
      },
      {
        name: "CEREC Dental Restorations",
        price: "298 zł",
        description:
          "",
      },
    ],

    // персонал
    staff: [
      {
        name: "Dr Mustafa Sabri Şencan",
        position: "Dentist",
        languages: ["English", "Turkish"],
        bio: "Mustafa Sabri Şencan, an Oral, Dental and Maxillofacial Surgery Specialist, was born in 1980 in Isparta. After completing his primary and secondary education in Isparta, he studied Basic Medical Sciences at Kadir Has University Faculty of Medicine between 1999-2001.",
        photo: "",
      },
      {
        name: "Dr Doğan Tiryaki",
        position: "Dentist",
        languages: ["English", "Turkish"],
        bio: "EducationGaziantep University Faculty of Dentistry Foreign languageEnglish Areas of expertiseSurgical Applicationsimplantology Restorative Dentistry Endodontics Implant Prostheses Smile Design.",
        photo: "",
      },
    ],

    // аккредитации (новый формат с логотипами)
    accreditations: [
      {
        name: "ITI - International Team for Implantology (International)",
        logo_url:
          "https://cdn.whatclinic.com/thumbnails/42ab752ba5a9e216/international_team_for_implantology.png?width=89&height=45&background-color=0xeeede8&operation=pad&float-y=0.25&hmac=44d5a5f2990a3fccc75b1508b93d33b5646bb7f9",
        description: "",
      },
      {
        name: "ICOI - International Congress of Oral Implantologists (International)",
        logo_url:
          "https://cdn.whatclinic.com/thumbnails/ecf1bbc60e10883d/international_congress_of_oral_implantologists.png?width=89&height=45&background-color=0xeeede8&operation=pad&float-y=0.25&hmac=f2749740f5198d29208ffe6cff7e18313525b62a",
        description: "",
      },
    ],

    // график работы
    hours: [
      { day: "MONDAY", open: "08:30", close: "23:45" },
      { day: "TUESDAY", open: "08:30", close: "23:45" },
      { day: "WEDNESDAY", open: "08:30", close: "23:45" },
      { day: "THURSDAY", open: "08:30", close: "23:45" },
      { day: "FRIDAY", open: "08:30", close: "23:45" },
      { day: "SATURDAY", open: "08:30", close: "23:45" },
      { day: "SUNDAY", open: "08:00", close: "23:45" },
    ],

    location: {
      address:
        "Eğitim, Fahrettin Kerim Gökay Cd. 135/2, Istanbul, Kadıköy, 34722 Turkey",
      mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.7484210256675!2d29.046602099999998!3d40.98698939999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cac7882c213a8f%3A0x6b1873d14425762a!2zTm92dXNrbGluaWsgS2FkxLFrw7Z5!5e0!3m2!1sru!2s!4v1759178459806!5m2!1sru!2s",
    },

    // Additional Services (1:1 с макетом)
    additionalServices: {
      premises: [
        "Parking",
        "Accessible to disabled people",
        "Public transport access",
        "Wheelchair accessible toilet",
        "Access without steps",
        "Disabled parking",
        "Patient bathroom",
        "Wireless access",
        "On-site pharmacy",
      ],
      clinic_services: [
        "Open weekends",
        "Emergency service",
        "Text message reminders",
      ],
      travel_services: [
        "International travel",
        "Local travel",
        "Local accommodation",
        "Translation services",
        "Local guide",
        "Tours and vacation services",
        "Pick up service from hotel",
        "Pick up service from airport",
      ],
      languages_spoken: [
        "English",
        "Turkish"
      ],
    },

    verifiedByMedtravel: true,
    isOfficialPartner: true,
  },
  "clinic-prime-istanbul": {
    slug: "clinic-prime-istanbul",
    name: "Clinic Prime Istanbul",
    country: "Turkey",
    city: "Istanbul",
    district: "",
    about:
      "Clinic Prime Istanbul is located in Kartal, Asian Side of Istanbul just 20 minutes away to SAW airport.We offer you aesthetic and top-tier dental services with a high-tech clinic environment near the seaside. We deliver excellence through the gentle hands of our expert staff in Asian Istanbul. All implants and crowns used in our clinic are guaranteed and certified. Additionally, every operation is satisfaction guaranteed.",

    // геро-галерея (1 большой + до 4 превью)
    images: [
      "https://cdn.whatclinic.com//dentists/turkey/istanbul-province/istanbul/kartal/clinic-prime-istanbul/thumbnails/6339804d066c8610/clinicprimewhatclinic.jpg?width=400&height=400&background-color=0xeeede8&operation=pad&float-y=0.25&hmac=b056c08ee3927daf14af8a5c2750b41a380b20d9",
      // можно добавить дополнительные превью сюда
    ],

    categories: ["dentistry"],

    // чтобы попадать в категорию /dentistry
    // tags: ["dentistry", "dentists"],

    // методы оплаты (для сайдбара)
    payments: ["Discounts", "Payment plans", "Free initial consultation", "Credit cards"],

    // услуги
    services: [
      {
        name: "Bone Graft",
        price: "",
        description:
          "Bone grafts are important in dentistry for implant treatments because they help to create a strong and stable foundation for the implant. When a tooth is lost, the bone in the area of the missing tooth begins to resorb or shrink.",
      },
      {
        name: "Dental Crowns",
        price: "",
        description:
          "Dental crowns are a common method used to repair and protect damaged teeth. The advantages of dental crowns include: Restoration of function: Dental crowns can help restore the patient's ability to chew and speak properly by protecting and strengthening a damaged or weak tooth.",
      },
      {
        name: "Dental Bridges",
        price: "",
        description:
          "Dental bridges are a common method used to replace missing teeth in dentistry. The advantages of dental bridges include: Restoration of function: Dental bridges can help restore the patient's ability to chew and speak properly.",
      },
    ],

    // персонал
    staff: [
      {
        name: "Dr Haktan Ilhan",
        position: "Dentist",
        languages: [""],
        bio: "Born in 1988 in Turkey, he graduated from Istanbul University Faculty of Dentistry in 2012. A year later he took Laminate Veneer & Zircon Crown Courses to specialize in Cosmetic Dentistry.",
        photo: "",
      },
      {
        name: "Prof Sabit  Demircan",
        position: "Dentist",
        languages: [""],
        bio: "Born in 1982 in Turkey, he graduated from Istanbul University Faculty of Dentistry in 2005. In the same year, he completed his doctoral program in Oral, Dental and Maxillofacial Surgery in 2011. He continues his academic education with presentations and lectures at various congresses, special courses and universities.",
        photo: "",
      },
    ],

    // аккредитации (новый формат с логотипами)
    accreditations: [
      {
        name: "TDB - Turkish Dental Association (Turkey)",
        logo_url:
          "https://cdn.whatclinic.com/thumbnails/f64f2175f6ac5bd4/turk_dishekimleri_birligi.png?width=89&height=45&background-color=0xeeede8&operation=pad&float-y=0.25&hmac=b8a58951a71977ec23514e50e3edd9a48ed030a6",
        description: "",
      },
      {
        name: "ESCD - European Society of Cosmetic Dentistry (International)",
        logo_url:
          "https://cdn.whatclinic.com/thumbnails/48cdc7977bef10e6/european_society_of_cosmetic_dentistry.png?width=89&height=45&background-color=0xeeede8&operation=pad&float-y=0.25&hmac=92bf5f40ca3880fcd021b903b2dfaa63924a2aac",
        description: "",
      },
    ],

    // график работы
    hours: [
      { day: "MONDAY", open: "09:00", close: "19:00" },
      { day: "TUESDAY", open: "09:00", close: "19:00" },
      { day: "WEDNESDAY", open: "09:00", close: "19:00" },
      { day: "THURSDAY", open: "09:00", close: "19:00" },
      { day: "FRIDAY", open: "09:00", close: "19:00" },
      { day: "SATURDAY", open: "09:00", close: "19:00" },
      { day: "SUNDAY" },
    ],

    location: {
      address:
        "ISTMarina Shopping Mall, Kordonboyu, Ankara Cd. No:147/6, Istanbul, 34860 Turkey",
      mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3016.416187618115!2d29.201750876482414!3d40.884684627025415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cac3f34c60c959%3A0xeab00056e9e6e88b!2sClinic%20Prime%20Istanbul!5e0!3m2!1sru!2s!4v1759178736688!5m2!1sru!2s",
    },

    // Additional Services (1:1 с макетом)
    additionalServices: {
      premises: [
        "Parking",
        "Accessible to disabled people",
        "Public transport access",
        "Wheelchair accessible toilet",
        "Access without steps",
        "Disabled parking",
        "Patient bathroom",
        "Wireless access",
        "On-site pharmacy"
      ],
      clinic_services: [
        "Open weekends"
      ],
      travel_services: [
        "International travel",
        "Local travel",
        "Local accommodation",
        "Translation services",
        "Local guide",
        "Tours and vacation services",
        "Pick up service from hotel",
        "Pick up service from airport"
      ],
      languages_spoken: [

      ],
    },

    verifiedByMedtravel: true,
    isOfficialPartner: true,
  },
  "vanity-cosmetic-surgery-hospital": {
    slug: "vanity-cosmetic-surgery-hospital",
    name: "Vanity Cosmetic Surgery Hospital",
    country: "Turkey",
    city: "Istanbul",
    district: "",
    about:
      "Founded in 2016 in Istanbul, Vanity Cosmetic Surgery Hospital combines 10+ years of experience of its 10 surgeons specializing in different areas, with new methods and technologies and lists 24/7 patient experience as the top priority. Our doctors are the best plastic surgeons in their fields. In addition, they are internationally certified and acknowledged by global core institutions such as ISAPS and EBOPRAS. Vanity Cosmetic Surgery Hospital operations are carried out in which high-quality service and patient satisfaction have the utmost importance.",

    // геро-галерея (1 большой + до 4 превью)
    images: [
      "https://cdn.whatclinic.com//cosmetic-plastic-surgery/turkey/istanbul-province/istanbul/umraniye/vanity-cosmetic-surgery-hospital/thumbnails/1ac1c9933d08fd25/whatsapp_image_20250224_at_083016.jpg?width=400&height=400&background-color=0xeeede8&operation=pad&float-y=0.25&hmac=f82d64fa79bf7ab66cc25c7c0da7b682a6fba9c7",
      // можно добавить дополнительные превью сюда
    ],

    categories: ["plastic-surgery"],

    // чтобы попадать в категорию /dentistry
    // tags: ["dentistry", "dentists"],

    // методы оплаты (для сайдбара)
    payments: ["Discounts", "Free initial consultation", "Credit cards"],

    // услуги
    services: [
      {
        name: "Arm Lift",
        price: "7651 zł",
        description:
          "",
      },
      {
        name: "BBL - Brazilian Butt Lift",
        price: "10202 zł",
        description:
          "",
      },
      {
        name: "Breast Augmentation with Implants",
        price: "12327 zł",
        description:
          "",
      },
    ],

    // персонал
    staff: [
      {
        name: "Prof Sinem  Eroğlu",
        position: "Surgeon",
        languages: ["English"],
        bio: "Prof. Dr. Sinem Eroğlu (FEBOPRAS) was born in 1977. She graduated from Marmara University Faculty of Medicine in English in 2000. She completed her residency in the field of Plastic, Reconstructive and Aesthetic Surgery at Haydarpaşa Numune Training and Research Hospital in 2006.",
        photo: "",
      },
      {
        name: "Dr Can Zeliha Gül",
        position: "Surgeon",
        languages: ["English, Turkish"],
        bio: "Dr. Can Zeliha Gül completed her medical training at Istanbul University Faculty of Medicine (Çapa Medicine) in 2011. M.D. Gül began her professional career by receiving specialization training in Plastic, Reconstructive, and Aesthetic Surgery at Şişli Etfal Research and Training Hospital, where she worked between 2011 and 2017.",
        photo: "",
      },
    ],

    // аккредитации (новый формат с логотипами)
    accreditations: [
      {
        name: "TTB - Turkish Medical Association (Turkey)",
        logo_url:
          "https://cdn.whatclinic.com/thumbnails/801f55404e3ef3f9/turk_tabipleri_birligi.png?width=89&height=45&background-color=0xeeede8&operation=pad&float-y=0.25&hmac=455035c5d6bedf41a9e38f0775a0a51db3d099cd",
        description: "",
      },
      {
        name: "TPCD - Turkish Society of Plastic Reconstructive and Aesthetic Surgeons (Turkey)",
        logo_url:
          "https://cdn.whatclinic.com/thumbnails/b738b83dd3b3f99d/turk_plastik,_rekonstruktif_ve_estetik_cerrahi_dernegi.png?width=89&height=45&background-color=0xeeede8&operation=pad&float-y=0.25&hmac=3634fe514a3129d231b2510f8ae4ad2ece6b1bd9",
        description: "",
      },
    ],

    // график работы
    hours: [
      { day: "MONDAY", open: "09:30", close: "19:00" },
      { day: "TUESDAY", open: "09:30", close: "19:00" },
      { day: "WEDNESDAY", open: "09:30", close: "19:00" },
      { day: "THURSDAY", open: "09:30", close: "19:00" },
      { day: "FRIDAY", open: "09:30", close: "19:00" },
      { day: "SATURDAY", open: "11:00", close: "16:00" },
      { day: "SUNDAY" },
    ],

    location: {
      address:
        "Bahçelievler Mahallesi, Zübeyde Hanım Cad. No:4, 34680, Istanbul, 34662 Turkey",
      mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.844170756476!2d29.076765299999998!3d41.0505367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab6e464844fe5%3A0x9960aad8e69aa0!2sVanity%20Estetik%20%2F%20Vanity%20Cosmetic%20Surgery%20Hospital%20Istanbul!5e0!3m2!1sru!2s!4v1759189631297!5m2!1sru!2s",
    },

    // Additional Services (1:1 с макетом)
    additionalServices: {
      premises: [
        "Parking",
        "Accessible to disabled people",
        "Public transport access",
        "Wheelchair accessible toilet",
        "Access without steps",
        "Disabled parking",
        "Patient bathroom",
        "Wireless access", "On-site pharmacy"
      ],
      clinic_services: [
        "Emergency service",
        "Text message reminders",
        "Open 24 hours",
        "Open weekends"
      ],
      travel_services: [
        "International travel",
        "Local travel",
        "Local accommodation",
        "Translation services",
        "Local guide",
        "Tours and vacation services",
        "Pick up service from hotel",
        "Pick up service from airport"
      ],
      languages_spoken: [
        "English",
        "Turkish"
      ],
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
    const svc = (c.services ?? []).map((s) => (s.name ?? "").toLowerCase());

    // соберём все теги из обоих полей
    const tags = ((c as any).tags ?? []) as string[];
    const ctg = ((c as any).ctg ?? []) as string[];
    const allTags = [...tags, ...ctg].map((t) => t.toLowerCase());

    return (
      svc.some((n) => n.includes(cat)) ||
      allTags.some((t) => t.includes(cat))
    );
  });
}


// обратная совместимость
export const getMockClinicBySlug = getClinicBySlug;
