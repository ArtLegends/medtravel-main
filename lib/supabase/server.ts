// lib/supabase/server.ts
// lib/supabase/server.ts
// lib/supabase/server.ts
import { createClient as createSb } from '@supabase/supabase-js';
import type { Database } from './types';

// Один серверный клиент на процесс (используем service role — ТОЛЬКО на сервере!)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  // Поможет быстрее понять проблему в проде, чем "undefined key"
  // eslint-disable-next-line no-console
  console.warn('[supabase] Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseServer = createSb<Database>(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Совместимый экспорт с index.ts
export function getServerSupabase() {
  return supabaseServer;
}

// import { cache } from "react";
// import { cookies } from "next/headers";
// import { createServerClient } from "@supabase/ssr";
// import { redirect } from "next/navigation";
// import type { User } from "@supabase/supabase-js";

// import { env } from "@/config/env";
// import type { UserRole } from "./supabase-provider";
// import type { Database } from "./types";

// export const getServerSupabase = cache(() => {
//   return createServerClient<Database>(
//     env.NEXT_PUBLIC_SUPABASE_URL,
//     env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//     {
//       cookies: {
//         getAll: async () => {
//           const store = await cookies();
//           return store.getAll().map(({ name, value }) => ({ name, value }));
//         },
//         setAll: (cookies) => {
//           const store = require("next/headers").cookies();
//           cookies.forEach(({ name, value, options }) => {
//             store.set(name, value, options);
//           });
//         },
//       },
//     }
//   );
// });

// export const getCurrentUser = cache(async (): Promise<User | null> => {
//   const supabase = getServerSupabase();
//   const {
//     data: { user },
//     error,
//   } = await supabase.auth.getUser();

//   if (error || !user) {
//     return null;
//   }

//   return user;
// });

// export const getUserProfile = cache(async (userId: string) => {
//   const supabase = getServerSupabase();

//   const { data, error } = await supabase
//     .from("profiles")
//     .select("*")
//     .eq("id", userId)
//     .maybeSingle();

//   if (error) {
//     return null;
//   }

//   return data;
// });

// export const getCurrentUserData = cache(async () => {
//   const user = await getCurrentUser();

//   if (!user) return null;

//   const profile = await getUserProfile(user.id);

//   return {
//     user,
//     profile,
//     role: (profile?.role as UserRole) || "USER",
//   };
// });

// export async function requireAuth(): Promise<User> {
//   const user = await getCurrentUser();

//   if (!user) {
//     redirect("/login");
//   }

//   return user;
// }

// export async function requireRole(
//   requiredRole: UserRole | UserRole[]
// ): Promise<User> {
//   const user = await requireAuth();
//   const userData = await getCurrentUserData();

//   if (!userData) {
//     redirect("/login");
//   }

//   const userRole = userData.role;
//   const roleHierarchy: Record<UserRole, number> = {
//     USER: 1,
//     CREATOR: 2,
//     ADMIN: 3,
//     SUPER_ADMIN: 4,
//   };

//   const requiredRoles =
//     Array.isArray(requiredRole) ? requiredRole : [requiredRole];
//   const hasAccess = requiredRoles.some(
//     (role) => roleHierarchy[userRole] >= roleHierarchy[role]
//   );

//   if (!hasAccess) {
//     redirect("/");
//   }

//   return user;
// }

// export async function hasRole(
//   requiredRole: UserRole | UserRole[]
// ): Promise<boolean> {
//   const userData = await getCurrentUserData();

//   if (!userData) return false;

//   const userRole = userData.role;
//   const roleHierarchy: Record<UserRole, number> = {
//     USER: 1,
//     CREATOR: 2,
//     ADMIN: 3,
//     SUPER_ADMIN: 4,
//   };

//   const requiredRoles =
//     Array.isArray(requiredRole) ? requiredRole : [requiredRole];

//   return requiredRoles.some(
//     (role) => roleHierarchy[userRole] >= roleHierarchy[role]
//   );
// }
