// app/api/admin/clinics/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/serviceClient';

/* ===== helpers ===== */

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const Amenities = z.object({
  premises: z.array(z.string()).default([]),
  clinic_services: z.array(z.string()).default([]),
  travel_services: z.array(z.string()).default([]),
  languages_spoken: z.array(z.string()).default([]),
});

const Body = z.object({
  clinic: z.object({
    name: z.string().min(1),
    about: z.string().min(1),
    specialty: z.string().min(1), // используется для categories
    slug: z.string().trim().optional(),
    status: z.enum(['Pending', 'Published', 'Hidden']),
    country: z.string().min(1),
    region: z.string().nullable().optional(),
    city: z.string().min(1),
    district: z.string().nullable().optional(),
    address: z.string().min(1),

    // старые поля – можно оставить, они optional
    lat: z.string().nullable().optional(),
    lng: z.string().nullable().optional(),

    // НОВОЕ: google maps URL
    map_embed_url: z.string().url().nullable().optional(),

    // НОВОЕ: payments как [{ method: "..." }]
    payments: z
      .array(
        z.object({
          method: z.string().min(1),
        }),
      )
      .default([]),

    // НОВОЕ: amenities jsonb
    amenities: Amenities.default({
      premises: [],
      clinic_services: [],
      travel_services: [],
      languages_spoken: [],
    }),
  }),

  services: z
    .array(
      z.object({
        name: z.string().min(1),
        desc: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().min(1),
      }),
    )
    .default([]),

  images: z
    .array(
      z.object({
        url: z.string().url(),
        title: z.string().optional(),
      }),
    )
    .default([]),

  doctors: z
    .array(
      z.object({
        name: z.string().min(1),
        title: z.string().optional(),
        spec: z.string().optional(),
        photo: z.string().url().optional(),
        bio: z.string().optional(),
      }),
    )
    .default([]),

  hours: z
    .array(
      z.object({
        day: z.string().min(1),
        time: z.string().optional(),
      }),
    )
    .default([]),

  accreditations: z
    .array(
      z.object({
        name: z.string().min(1),
        logo_url: z.string().url().optional(),
        description: z.string().optional(),
      }),
    )
    .default([]),
});

/** map weekday tokens → [1..7] */
function normalizeWeekdays(token: string): number[] {
  const mapName: Record<string, number> = {
    mon: 1, monday: 1,
    tue: 2, tues: 2, tuesday: 2,
    wed: 3, wednesday: 3,
    thu: 4, thur: 4, thurs: 4, thursday: 4,
    fri: 5, friday: 5,
    sat: 6, saturday: 6,
    sun: 7, sunday: 7,
  };
  const clean = token.trim().toLowerCase().replace(/\s+/g, '');
  if (/^\d+$/.test(clean)) {
    const n = Number(clean);
    return (n >= 1 && n <= 7) ? [n] : [];
  }
  const range = clean.split(/-|–|—/);
  if (range.length === 2 && mapName[range[0]] && mapName[range[1]]) {
    const a = mapName[range[0]], b = mapName[range[1]];
    if (a <= b) return Array.from({ length: b - a + 1 }, (_, i) => a + i);
  }
  if (mapName[clean]) return [mapName[clean]];
  return [];
}

/** parse "9:00 AM - 6:00 PM" → {open:'09:00:00', close:'18:00:00'}; "Closed" → {is_closed:true} */
function parseTimeSpan(s?: string): { open: string | null; close: string | null; is_closed: boolean } {
  const text = (s || '').trim();
  if (!text) return { open: null, close: null, is_closed: false };
  if (/^closed$/i.test(text)) return { open: null, close: null, is_closed: true };

  const m = text.match(/^\s*([0-9: ]+(?:am|pm)?)\s*[-–—]\s*([0-9: ]+(?:am|pm)?)\s*$/i);
  if (!m) return { open: null, close: null, is_closed: false };

  const to24 = (v: string) => {
    const t = v.trim().toLowerCase();
    const ampm = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
    if (ampm) {
      let hh = Number(ampm[1]);
      const mm = Number(ampm[2] ?? 0);
      const ap = ampm[3].toLowerCase();
      if (ap === 'pm' && hh !== 12) hh += 12;
      if (ap === 'am' && hh === 12) hh = 0;
      return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:00`;
    }
    const hhmm = t.match(/^(\d{1,2})(?::(\d{2}))?$/);
    if (hhmm) {
      const hh = Number(hhmm[1]);
      const mm = Number(hhmm[2] ?? 0);
      return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:00`;
    }
    return null;
  };

  const open = to24(m[1]) as string | null;
  const close = to24(m[2]) as string | null;
  return { open, close, is_closed: false };
}

/* ===== handler ===== */

function isAcctsSlugConflict(err: any): boolean {
  if (!err) return false;
  const code = err.code;
  const msg = `${err.message ?? ''} ${err.details ?? ''}`;
  return code === '23505' && msg.includes('accts_slug_uq');
}

export async function POST(req: Request) {
  try {
    const parsed = Body.parse(await req.json());
    const sb = createServiceClient();

    // ---- 1) create clinic ----
    const isPublished = parsed.clinic.status === 'Published';
    const status = isPublished ? 'published' : 'draft';

    const { data: clinicRow, error: clinicErr } = await sb
      .from('clinics')
      .insert([{
        name: parsed.clinic.name,
        slug: parsed.clinic.slug || slugify(parsed.clinic.name),
        about: parsed.clinic.about,
        address: parsed.clinic.address,
        country: parsed.clinic.country,
        city: parsed.clinic.city,
        province: parsed.clinic.region ?? null,
        district: parsed.clinic.district ?? null,
  
        // lat/lng – если ты их не используешь, можно потом выпилить
        lat: parsed.clinic.lat ? Number(parsed.clinic.lat) : null,
        lng: parsed.clinic.lng ? Number(parsed.clinic.lng) : null,
  
        // НОВОЕ: google maps url → колонка clinics.map_embed_url
        map_embed_url: parsed.clinic.map_embed_url ?? null,
  
        // НОВОЕ: jsonb поля
        amenities: parsed.clinic.amenities,
        payments: parsed.clinic.payments,
  
        status,
        is_published: isPublished,
        verified_by_medtravel: true,
        is_official_partner: true,

        moderation_status: 'approved',
      }])
      .select('id')
      .single();

      if (clinicErr || !clinicRow) {
        // если именно дубликат accts_slug_uq — пробуем найти клинику по slug и считаем это мягким успехом
        if (isAcctsSlugConflict(clinicErr)) {
          const { data: existingClinic } = await sb
            .from('clinics')
            .select('id')
            .eq('slug', parsed.clinic.slug || slugify(parsed.clinic.name))
            .maybeSingle();
      
          if (existingClinic?.id) {
            return NextResponse.json({ ok: true, id: existingClinic.id }, { status: 201 });
          }
        }
      
        return NextResponse.json(
          { error: clinicErr?.message ?? 'Insert clinic failed' },
          { status: 400 }
        );
      }
      
      const clinicId = clinicRow.id as string;

    // ---- 2) category link (НОВОЕ) ----
    // Берём specialty как имя категории. Находим по slug, иначе создаём.
    const catSlug = slugify(parsed.clinic.specialty);
    let categoryId: number | null = null;

    {
      const { data: existing, error: catSelErr } = await sb
        .from('categories')
        .select('id')
        .eq('slug', catSlug)
        .maybeSingle();

        if (catSelErr && !isAcctsSlugConflict(catSelErr)) {
          return NextResponse.json({ error: catSelErr.message }, { status: 400 });
        }
        
        if (existing?.id) {
          categoryId = existing.id as number;
        } else {
          const { data: created, error: catInsErr } = await sb
            .from('categories')
            .insert([{ name: parsed.clinic.specialty, slug: catSlug }])
            .select('id')
            .single();
        
          if (catInsErr && !isAcctsSlugConflict(catInsErr)) {
            return NextResponse.json(
              { error: catInsErr?.message ?? 'Create category failed' },
              { status: 400 }
            );
          }
        
          if (created?.id) {
            categoryId = created.id as number;
          }
        }
    }

    // upsert связь в clinic_categories
    {
      const { error: ccErr } = await sb
        .from('clinic_categories')
        .upsert([{ clinic_id: clinicId, category_id: categoryId! }], { onConflict: 'clinic_id,category_id' });
      if (ccErr) return NextResponse.json({ error: ccErr.message }, { status: 400 });
    }

    // ---- 3) images ----
    if (parsed.images.length) {
      const imgRows = parsed.images.map(im => ({
        clinic_id: clinicId,
        url: im.url,
        title: im.title ?? null,
        sort: 0,
        created_at: new Date().toISOString(),
      }));
      const { error } = await sb.from('clinic_images').insert(imgRows);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // ---- 4) staff (clinic_staff) ----
    if (parsed.doctors.length) {
      const staffRows = parsed.doctors.map(d => ({
        clinic_id: clinicId,
        name: d.name,
        title: d.title ?? null,
        position: d.title ?? null,
        bio: d.bio ?? null,
        languages: '{}', // пустой text[]
        photo_url: d.photo ?? null,
        created_at: new Date().toISOString(),
      }));
      const { error } = await sb.from('clinic_staff').insert(staffRows);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // ---- 5) services: upsert service → link in clinic_services ----
    if (parsed.services.length) {
      for (const s of parsed.services) {
        const { data: svc, error: svcErr } = await sb
          .from('services')
          .upsert([{ name: s.name, slug: slugify(s.name), description: s.desc ?? null }], { onConflict: 'name' })
          .select('id')
          .single();
        if (svcErr || !svc) {
          return NextResponse.json({ error: svcErr?.message ?? 'Service upsert failed' }, { status: 400 });
        }
        const priceNum = s.price && s.price.trim() !== '' ? Number(s.price.replace(',', '.')) : null;
        const { error: linkErr } = await sb
          .from('clinic_services')
          .upsert([{
            clinic_id: clinicId,
            service_id: svc.id,
            price: priceNum,
            currency: s.currency || 'USD',
          }], { onConflict: 'clinic_id,service_id' });
        if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 400 });
      }
    }

    // ---- 6) hours: parse → upsert (clinic_id, weekday) ----
    if (parsed.hours.length) {
      const rows: { clinic_id: string; weekday: number; open: string | null; close: string | null; is_closed: boolean }[] = [];
      for (const h of parsed.hours) {
        const wds = normalizeWeekdays(h.day);
        const times = parseTimeSpan(h.time);
        for (const wd of wds) {
          rows.push({ clinic_id: clinicId, weekday: wd, open: times.open, close: times.close, is_closed: times.is_closed });
        }
      }
      if (rows.length) {
        const { error } = await sb.from('clinic_hours')
          .upsert(rows, { onConflict: 'clinic_id,weekday' });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    // ---- 7) accreditations: upsert master → link table ----
    if (parsed.accreditations.length) {
      for (const a of parsed.accreditations) {
        const { data: acc, error: accErr } = await sb
          .from('accreditations')
          .upsert([{ name: a.name, logo_url: a.logo_url ?? null, description: a.description ?? null }], { onConflict: 'name' })
          .select('id')
          .single();
        if (accErr || !acc) {
          return NextResponse.json({ error: accErr?.message ?? 'Accreditation upsert failed' }, { status: 400 });
        }
        const { error: linkErr } = await sb
          .from('clinic_accreditations')
          .upsert([{ clinic_id: clinicId, accreditation_id: acc.id }], { onConflict: 'clinic_id,accreditation_id' });
        if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 400 });
      }
    }

    return NextResponse.json({ ok: true, id: clinicId }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Invalid payload' }, { status: 400 });
  }
}
