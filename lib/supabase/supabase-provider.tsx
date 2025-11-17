// lib/supabase/supabase-provider.tsx
"use client";
import type { Session } from "@supabase/supabase-js";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";

import { createClient } from "@/lib/supabase/browserClient";

export type UserRole = "GUEST" | "PATIENT" | "CUSTOMER" | "PARTNER" | "ADMIN";

const mapRole = (r?: string | null): UserRole => {
  const v = String(r || "GUEST").toUpperCase();
  if (["GUEST","PATIENT","CUSTOMER","PARTNER","ADMIN"].includes(v)) return v as UserRole;
  return "GUEST";
};

export interface SupabaseContextType {
  supabase: ReturnType<typeof createClient>;
  session: Session | null;
  role: UserRole | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined,
);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchRole(data.session.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      if (sess) fetchRole(sess.user.id);
      else setRole(null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const fetchRole = async (id: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) { setRole("GUEST"); return; }
    setRole(mapRole((data as any).role));
  };

  // Мемоизируем контекстное значение чтобы избежать ненужных перерендеров
  const contextValue = useMemo(
    () => ({
      supabase,
      session,
      role,
    }),
    [supabase, session, role],
  );

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const ctx = useContext(SupabaseContext);

  if (!ctx) throw new Error("useSupabase must be used inside provider");

  return ctx;
};
