// app/api/clinic-requests/route.ts
import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic'; // для Node runtime

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'clinic-requests.json');

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, '[]', 'utf8');
  }
}

async function readAll() {
  await ensureFile();
  const raw = await fs.readFile(FILE, 'utf8');
  return JSON.parse(raw) as any[];
}

async function writeAll(rows: any[]) {
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2), 'utf8');
}

export async function GET() {
  const rows = await readAll();
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();

  const record = {
    id: 'cr_' + Date.now().toString(36),
    clinic: String(body.clinicName || '').trim(),
    name: `${String(body.firstName || '').trim()} ${String(body.lastName || '').trim()}`.trim(),
    email: String(body.email || '').trim(),
    phone: String(body.phone || '').trim() || null,
    address: String(body.address || '').trim() || null,
    country: String(body.country || '').trim() || null,
    city: String(body.city || '').trim() || null,
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  if (!record.clinic || !record.name || !record.email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const rows = await readAll();
  rows.push(record);
  await writeAll(rows);

  return NextResponse.json({ ok: true, id: record.id });
}
