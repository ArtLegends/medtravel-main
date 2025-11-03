// lib/supabase/adminClient.ts
import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
}

export const sbAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
    global: { headers: { "X-Client-Role": "service" } },
  }
);

// «контекст» фиктивного customer для дев-режима
export function getDevCustomerContext() {
  const clinicId = process.env.DEV_CUSTOMER_CLINIC_ID!;
  const userId = process.env.DEV_CUSTOMER_USER_ID ?? null;
  if (!clinicId) throw new Error("DEV_CUSTOMER_CLINIC_ID missing");
  return { clinicId, userId };
}
