// app/api/bookings/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body.name ?? '').toString().trim();
    const phone = (body.phone ?? '').toString().trim();
    const contact_method = (body.contact_method ?? '').toString().toLowerCase();
    const service = (body.service ?? '').toString().toLowerCase();

    if (!name || !phone || !contact_method || !service) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({ name, phone, contact_method, service }) // status = 'New' по умолчанию
      .select('*')
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, booking: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Server error' }, { status: 500 });
  }
}
