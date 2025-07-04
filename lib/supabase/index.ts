// Единый экспорт всех Supabase утилит
export { createClient } from "./browserClient";
export { getServerSupabase } from "./server";
export { useSupabase, SupabaseProvider } from "./supabase-provider";
export type { UserRole, SupabaseContextType } from "./supabase-provider";
export type { Database } from "./types";
