// app/api/clinic-requests/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

type ContactAllowed = 'Email' | 'Phone' | 'WhatsApp' | 'Telegram';
const CONTACT_ALLOWED: ContactAllowed[] = ['Email', 'Phone', 'WhatsApp', 'Telegram'];

function normalizeContact(input: unknown): ContactAllowed | undefined {
  const raw = String(input ?? '').trim().toLowerCase();
  switch (raw) {
    case 'email':     return 'Email';
    case 'phone':     return 'Phone';
    case 'whatsapp':  return 'WhatsApp';
    case 'telegram':  return 'Telegram';
    default:          return undefined;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const clinic_id = String(body.clinic_id ?? '').trim();
    const name      = String(body.name ?? '').trim();
    const phone     = String(body.phone ?? '').trim();

    // приводим к ожидаемому CHECK-значению
    const contact_method = normalizeContact(body.contact_method);

    // origin должен быть одним из: homepage | service | doctor
    // т.к. это заявка со страницы клиники/услуг, используем 'service'
    const origin: 'homepage' | 'service' | 'doctor' = 'service';

    if (!clinic_id || !name || !phone || !contact_method || !CONTACT_ALLOWED.includes(contact_method)) {
      return NextResponse.json(
        { ok: false, error: 'clinic_id, name, phone and valid contact_method are required' },
        { status: 400 }
      );
    }

    // найти service_id по имени (если указано)
    let service_id: number | null = null;
    const serviceName = String(body.service ?? '').trim();
    if (serviceName) {
      const { data: svc } = await supabaseServer
        .from('services')
        .select('id,name')
        .ilike('name', serviceName)
        .maybeSingle();
      if (svc?.id) service_id = svc.id;
    }

    const { error } = await supabaseServer.from('clinic_requests').insert({
      clinic_id,
      service_id,
      doctor_id: body.doctor_id ?? null,
      name,
      phone,
      contact_method, // строго 'Email' | 'Phone' | 'WhatsApp' | 'Telegram'
      origin,         // строго 'homepage' | 'service' | 'doctor'
    } as any);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Bad request' }, { status: 400 });
  }
}
