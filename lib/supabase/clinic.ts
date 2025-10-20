// lib/supabase/clinic.ts
import { createClient } from '@/lib/supabase/serverClient';

export type ClinicView = {
  slug: string;
  name: string;
  country: string;
  city: string;
  district?: string;
  about: string;
  images: string[];
  tags?: string[];
  services: Array<{ name: string; price?: number | string; description?: string }>;
  hours: Array<{ day: string; open?: string; close?: string }>;
  location?: { address?: string; mapEmbedUrl?: string };
  payments?: string[];
  staff: Array<{
    name: string;
    position: string;
    languages?: string[];
    bio?: string;
    photo?: string;
  }>;
  accreditations: Array<{ title: string; country?: string; desc?: string; logo_url?: string }>;
  additionalServices?: {
    premises?: string[];
    clinic_services?: string[];
    travel_services?: string[];
    languages_spoken?: string[];
  };
  verifiedByMedtravel?: boolean;
  isOfficialPartner?: boolean;
};

const norm = (v?: string | string[]) =>
  !v ? [] : Array.isArray(v) ? v : v.split(',').map(s => s.trim()).filter(Boolean);

export async function getClinicViewBySlug(slug: string): Promise<ClinicView | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('clinics')
    .select(`
    id, slug, name, country, city, district, about,
    address, map_embed_url,
    verified_by_medtravel, is_official_partner,

    clinic_images ( url ),
    clinic_hours ( * ),

    clinic_services (
      price, description,
      services ( name )
    ),

    doctors ( name, position, bio, photo, languages ),

    clinic_premises ( premises ( name ) ),
    clinic_travel_services ( travel_services ( name ) ),

    clinic_accreditations (
      description, logo_url,
      accreditations ( name, description, logo_url )
    )
  `)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('getClinicViewBySlug error:', error);
    return null;
  }
  if (!data) return null;

  const images = (data.clinic_images ?? []).map((i: any) => i.url).filter(Boolean);

  const hours = (data.clinic_hours ?? []).map((h: any) => ({
    day: h.day,
    open: h.open ?? undefined,
    close: h.close ?? undefined,
  }));

  const services = (data.clinic_services ?? [])
    .map((cs: any) => ({
      name: cs?.services?.name ?? '',
      price: cs?.price ?? undefined,
      description: cs?.description ?? undefined,
    }))
    .filter((s: any) => s.name);

  const staff = (data.doctors ?? []).map((d: any) => ({
    name: d.name,
    position: d.position,
    bio: d.bio ?? undefined,
    photo: d.photo ?? undefined,
    languages: Array.isArray(d.languages)
      ? d.languages
      : (typeof d.languages === 'string'
        ? d.languages.split(',').map((s: string) => s.trim()).filter(Boolean)
        : []),
  }));

  const premises = (data.clinic_premises ?? [])
    .map((p: any) => p?.premises?.name)
    .filter(Boolean);

  const travel = (data.clinic_travel_services ?? [])
    .map((t: any) => t?.travel_services?.name)
    .filter(Boolean);

  const accreditations = (data.clinic_accreditations ?? []).map((x: any) => ({
    title: x?.accreditations?.name ?? '',
    desc: x?.accreditations?.description ?? x?.description ?? '',
    logo_url: x?.accreditations?.logo_url ?? x?.logo_url ?? '',
  })).filter((a: any) => a.title);

  const clinic: ClinicView = {
    slug: data.slug,
    name: data.name,
    country: data.country,
    city: data.city,
    district: data.district ?? undefined,
    about: data.about ?? '',
    images,
    services,
    hours,
    location: {
      address: data.address ?? undefined,
      mapEmbedUrl: data.map_embed_url ?? undefined,
    },
    staff,
    accreditations,
    additionalServices: {
      premises,
      clinic_services: [], // при необходимости завести отдельный справочник
      travel_services: travel,
      languages_spoken: [], // при необходимости завести связь
    },
    payments: [], // если будет таблица payments — подхватим
    verifiedByMedtravel: !!data.verified_by_medtravel,
    isOfficialPartner: !!data.is_official_partner,
  };

  return clinic;
}
