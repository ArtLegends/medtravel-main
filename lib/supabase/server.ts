// lib/supabase/server.ts
import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { env } from "@/config/env";
import type { UserRole } from "./supabase-provider";
import type { Database } from "./types";

// Кэшированный Supabase серверный клиент
export const getServerSupabase = cache(() => {
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: async () => {
          const store = await cookies();
          return store.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll: (cookies) => {
          const store = require("next/headers").cookies();
          cookies.forEach(({ name, value, options }) => {
            store.set(name, value, options);
          });
        },
      },
    }
  );
});

// Получение текущего пользователя
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = getServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
});

// Получение профиля пользователя с ролью
export const getUserProfile = cache(async (userId: string) => {
  const supabase = getServerSupabase();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
});

// Получение полных данных пользователя
export const getCurrentUserData = cache(async () => {
  const user = await getCurrentUser();

  if (!user) return null;

  const profile = await getUserProfile(user.id);

  return {
    user,
    profile,
    role: (profile?.role as UserRole) || "USER",
  };
});

// Проверка аутентификации с редиректом
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

// Проверка роли с редиректом
export async function requireRole(
  requiredRole: UserRole | UserRole[]
): Promise<User> {
  const user = await requireAuth();
  const userData = await getCurrentUserData();

  if (!userData) {
    redirect("/login");
  }

  const userRole = userData.role;
  const roleHierarchy: Record<UserRole, number> = {
    USER: 1,
    CREATOR: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4,
  };

  const requiredRoles =
    Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const hasAccess = requiredRoles.some(
    (role) => roleHierarchy[userRole] >= roleHierarchy[role]
  );

  if (!hasAccess) {
    redirect("/");
  }

  return user;
}

// Проверка доступа без редиректа
export async function hasRole(
  requiredRole: UserRole | UserRole[]
): Promise<boolean> {
  const userData = await getCurrentUserData();

  if (!userData) return false;

  const userRole = userData.role;
  const roleHierarchy: Record<UserRole, number> = {
    USER: 1,
    CREATOR: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4,
  };

  const requiredRoles =
    Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  return requiredRoles.some(
    (role) => roleHierarchy[userRole] >= roleHierarchy[role]
  );
}
