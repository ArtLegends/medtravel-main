// lib/mock/db.ts
// Простейшее in-memory хранилище (живет в памяти dev-сервера)

export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  createdAt: string; // ISO or human
};

type DB = {
  contacts: Contact[];
};

declare global {
  // eslint-disable-next-line no-var
  var __medtravelDB__: DB | undefined;
}

function nowStr() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function getDB(): DB {
  if (!globalThis.__medtravelDB__) {
    globalThis.__medtravelDB__ = { contacts: [] };
  }
  return globalThis.__medtravelDB__;
}

export async function getContacts(): Promise<Contact[]> {
  return getDB().contacts.slice().reverse(); // последние — первыми
}

export async function addContact(input: Omit<Contact, "id" | "createdAt">) {
  const db = getDB();
  const id = `ct_${Math.random().toString(36).slice(2, 10)}`;
  db.contacts.push({
    id,
    createdAt: nowStr(),
    ...input,
  });
  return id;
}
