// lib/supabase/requests.ts
import { createClient as createBrowserClient } from '@/lib/supabase/browserClient'
import { createServerClient } from '@/lib/supabase/serverClient'
import type Clinic from "@/components/ClinicCard"
// import { createClient } from "@/lib/supabase/browserClient"
import { createClient } from "./browserClient";
// import type { Category } from '@/lib/supabase/types'

export interface Category {
  id:       number
  name:     string
  slug:     string
  // cover_url: string | null
}

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
  about: string | null;
  cover_url?: string | null;
  services: string[];
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })

  if (error) {
    console.error('getAllCategories error', error)
    return []
  }
  return data!
}