// lib/supabase/requests.ts
// import { createClient as createBrowserClient } from '@/lib/supabase/browserClient'
import { createServerClient } from '@/lib/supabase/serverClient'
import type Clinic from "@/components/ClinicCard"
// import { createClient } from "@/lib/supabase/browserClient"
import { createClient } from "./browserClient";
// import type { Category } from '@/lib/supabase/types'
import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import { getPublicClient } from '@/lib/supabase/publicClient'

// Типы
export type Category = { id: number; name: string; slug: string }

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  country: string;
  province: string;
  city: string;
  district: string;
  description: string | null;
  cover_url?: string | null;
  services: string[];
}

// Публичный запрос — работает в SSG/ISR
export async function getAllCategories(): Promise<Category[]> {
  const supabase = getPublicClient()
  const { data, error }: PostgrestSingleResponse<Category[]> = await supabase
    .from('categories')
    .select('id,name,slug')
    .order('name', { ascending: true })

  if (error) {
    console.error('getAllCategories error', error)
    return []
  }
  return data ?? []
}

/**
 * Если нужно — оставьте client-функции отдельно в другом файле,
 * например lib/supabase/requests.client.ts, чтобы не смешивать окружения.
 * Ваш searchClinics сейчас использует browser-клиент — перенесите его туда.
 */

// export type Category = {id: number; name: string; slug: string}

// export interface Category {
//   id:       number
//   name:     string
//   slug:     string
// }

export async function searchClinics(query: string): Promise<Clinic[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .rpc("search_clinics", { q: query })
    .order("rank", { ascending: false });

  if (error) {
    console.error("searchClinics error", error);
    return [];
  }

  return (data as Clinic[]) ?? [];
}

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  country: string;
  province: string;
  city: string;
  district: string;
  description: string | null;
  cover_url?: string | null;
  services: string[];
}

// export async function getAllCategories(): Promise<Category[]> {
//   const supabase = createServerClient()
//   const { data, error } = await supabase
//     .from('categories')
//     .select('id, name, slug')
//     .order('name', { ascending: true })

//   if (error) {
//     console.error('getAllCategories error', error)
//     return []
//   }
//   return data ?? []
// }