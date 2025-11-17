// lib/supabase/supabase-provider.tsx
"use client";
import type { Session } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browserClient";

export type UserRole = "GUEST" | "PATIENT" | "CUSTOMER" | "PARTNER" | "ADMIN";

const mapRole = (r?: string | null): UserRole => {
  const v = String(r || "guest").toUpperCase() as UserRole;
  return (["GUEST","PATIENT","CUSTOMER","PARTNER","ADMIN"] as const).includes(v) ? v : "GUEST";
};

export interface SupabaseContextType {
  supabase: ReturnType<typeof createClient>;
  session: Session | null;
  role: UserRole | null;
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
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // если initialSession нет — подтянем из SDK
    if (!initialSession) {
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
        if (data.session) fetchRole(data.session.user.id);
      });
    } else {
      fetchRole(initialSession.user.id);
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      if (sess) fetchRole(sess.user.id);
      else setRole(null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]); // eslint-disable-line

  const fetchRole = async (uid: string) => {
    // 1) user_roles
    const { data: ur } = await supabase.from("user_roles").select("role").eq("user_id", uid).maybeSingle();
    if (ur?.role) return setRole(mapRole(ur.role));
    // 2) profiles fallback
    const { data: pr } = await supabase.from("profiles").select("role").eq("id", uid).maybeSingle();
    setRole(mapRole(pr?.role ?? "guest"));
  };

  const value = useMemo(() => ({ supabase, session, role }), [supabase, session, role]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSupabase = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSupabase must be used inside provider");
  return ctx;
};
