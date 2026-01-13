// lib/supabase/supabase-provider.tsx
"use client";

import type { Session } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browserClient";

export type UserRole = "GUEST" | "PATIENT" | "CUSTOMER" | "PARTNER" | "ADMIN";

const ROLE_SET = new Set<UserRole>(["GUEST", "PATIENT", "CUSTOMER", "PARTNER", "ADMIN"]);

const mapRole = (r?: string | null): UserRole => {
  const v = String(r || "guest").toUpperCase();
  const vv = v as UserRole;
  return ROLE_SET.has(vv) ? vv : "GUEST";
};

const readActiveRole = (): UserRole => {
  if (typeof window === "undefined") return "GUEST";
  return mapRole(window.localStorage.getItem("mt_active_role"));
};

const writeActiveRole = (role: UserRole) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("mt_active_role", role);
};

export interface SupabaseContextType {
  supabase: ReturnType<typeof createClient>;
  session: Session | null;
  roles: UserRole[];      // все роли пользователя
  activeRole: UserRole;   // текущий портал/роль в UI
  setActiveRole: (role: UserRole) => void;
  refreshRoles: () => Promise<void>;
}

const Ctx = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({
  children,
  initialSession = null,
}: {
  children: React.ReactNode;
  initialSession?: Session | null;
}) {
  const supabase = useMemo(() => createClient(), []);

  const [session, setSession] = useState<Session | null>(initialSession);
  const [roles, setRoles] = useState<UserRole[]>(["GUEST"]);
  const [activeRole, _setActiveRole] = useState<UserRole>(readActiveRole());

  const setActiveRole = (role: UserRole) => {
    _setActiveRole(role);
    writeActiveRole(role);
  };

  const refreshRoles = async () => {
    const uid = session?.user?.id;
    if (!uid) return;
    await fetchRoles(uid);
  };

  const fetchRoles = async (uid: string) => {
    // 1) user_roles — источник истины
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid);

    let collected: UserRole[] = [];

    if (!error && Array.isArray(data) && data.length) {
      collected = data
        .map((r: any) => mapRole(r?.role))
        .filter((x) => x !== "GUEST");
    }

    // 2) fallback на profiles.role
    if (!collected.length) {
      const { data: pr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .maybeSingle();

      const primary = mapRole(pr?.role ?? "guest");
      collected = primary !== "GUEST" ? [primary] : ["GUEST"];
    }

    // нормализуем
    const uniq = Array.from(new Set(collected));
    setRoles(uniq.length ? uniq : ["GUEST"]);

    // activeRole: если текущая активная роль недоступна — ставим первую доступную
    const current = readActiveRole();
    const ok = uniq.includes(activeRole);
    if (!ok) {
      const next = uniq[0] ?? "GUEST";
      setActiveRole(next);
    }
  };

  useEffect(() => {
    // подтянуть сессию при старте
    if (!initialSession) {
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
        if (data.session) fetchRoles(data.session.user.id);
        else setRoles(["GUEST"]);
      });
    } else {
      fetchRoles(initialSession.user.id);
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      if (sess) fetchRoles(sess.user.id);
      else {
        setRoles(["GUEST"]);
        setActiveRole("GUEST");
      }
    });

    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const value = useMemo(
    () => ({ supabase, session, roles, activeRole, setActiveRole, refreshRoles }),
    [supabase, session, roles, activeRole],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSupabase = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSupabase must be used inside provider");
  return ctx;
};
