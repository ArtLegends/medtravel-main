// lib/supabase/serverClient.ts
import "server-only";
import { createClient as _createClient } from '@supabase/supabase-js'

const url         = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!  // <-- сервисный ключ, **не** публичный

export function createServerClient() {
  return _createClient(url, serviceKey)
}
