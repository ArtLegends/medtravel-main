// !!! серверный клиент с service_role; использовать только на сервере
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // <- серверный ключ
    { auth: { persistSession: false } }
  );
}
