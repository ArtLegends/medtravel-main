// app/api/contacts/route.ts
import { NextResponse } from "next/server";
import { addContact, getContacts } from "@/lib/mock/db";

export async function GET() {
  const rows = await getContacts();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const firstName = (body.firstName ?? "").trim();
    const lastName  = (body.lastName ?? "").trim();
    const email     = (body.email ?? "").trim();
    const phone     = (body.phone ?? "").trim();

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { ok: false, error: "firstName, lastName and email are required" },
        { status: 400 }
      );
    }

    const id = await addContact({ firstName, lastName, email, phone });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
