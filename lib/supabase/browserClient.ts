"use client";
import { createClient as _createClient } from '@supabase/supabase-js'

const url    = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return _createClient(url, key)
}






// import { createBrowserClient } from "@supabase/ssr";

// import { env } from "@/config/env";

// export const createClient = () =>
//   createBrowserClient(
//     env.NEXT_PUBLIC_SUPABASE_URL,
//     env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//   );