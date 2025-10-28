// import { createClient } from '@supabase/supabase-js'
// import { env } from '@/config/env'

// export function createServiceClient() {
//   return createClient(
//     env.NEXT_PUBLIC_SUPABASE_URL,
//     env.SUPABASE_SERVICE_ROLE_KEY,
//     { auth: { persistSession: false } }
//   )
// }

import { createClient } from '@supabase/supabase-js';

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // ← service key
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
