import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const sb = supabaseServer;
    const body = await req.json();

    const clinic_id: string = body?.clinic_id;
    const name: string | null = body?.name ?? null;
    const email: string | null = body?.email ?? null;
    const phone: string | null = body?.phone ?? null;
    const message: string | null = body?.message ?? null;

    if (!clinic_id || !name || !phone) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    // убедимся, что клиника существует
    const { data: clinic, error: cErr } = await sb
      .from('clinics')
      .select('id')
      .eq('id', clinic_id)
      .maybeSingle();

    if (cErr || !clinic) {
      return NextResponse.json({ ok: false, error: 'Clinic not found' }, { status: 404 });
    }

    // ВСТАВЛЯЕМ ТОЛЬКО СУЩЕСТВУЮЩИЕ КОЛОНКИ ТАБЛИЦЫ: id (auto), user_id (NULL), clinic_id, name, email, phone, message, created_at (default)
    const { error: insErr } = await sb
      .from('clinic_inquiries')
      .insert({
        clinic_id,
        name,
        email,
        phone,
        message,
        // user_id: null  // если колонка существует и допускает NULL, можно явно указать
      } as any);

    if (insErr) {
      console.error('clinic_inquiries INSERT error', insErr);
      return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Server error' }, { status: 500 });
  }
}
