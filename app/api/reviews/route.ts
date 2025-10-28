import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/serviceClient';

const Body = z.object({
  clinicId: z.string().uuid(),
  review: z.string().trim().max(5000).optional().nullable(),
  ratings: z.object({
    doctor: z.number().int().min(0).max(10),
    staff: z.number().int().min(0).max(10),
    assistant: z.number().int().min(0).max(10),
    support: z.number().int().min(0).max(10),
    facilities: z.number().int().min(0).max(10),
    overall: z.number().int().min(0).max(10),
  }),
  name: z.string().trim().min(1).max(120),
  email: z.string().email(),
  phone: z.string().trim().max(50),
  consent: z.boolean().refine(v => v === true),
});

export async function POST(req: Request) {
  try {
    const parsed = Body.parse(await req.json());

    const supabase = createServiceClient();

    const { error } = await supabase.from('reviews').insert([{
      clinic_id: parsed.clinicId,
      review: parsed.review ?? null,
      rating_doctor: parsed.ratings.doctor,
      rating_staff: parsed.ratings.staff,
      rating_assistant: parsed.ratings.assistant,
      rating_support: parsed.ratings.support,
      rating_facilities: parsed.ratings.facilities,
      rating_overall: parsed.ratings.overall,
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      consent_privacy: true,
      status: 'new',              // модерация
    }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Invalid payload' },
      { status: 400 },
    );
  }
}
