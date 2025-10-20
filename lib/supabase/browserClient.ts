// lib/supabase/browserClient.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, key);
}






// lib/supabase/browserClient.ts
// "use client";
// import { createClient as _createClient } from '@supabase/supabase-js'

// const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// export function createClient() {
//   return _createClient(url, key)
// }
