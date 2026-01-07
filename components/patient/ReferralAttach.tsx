"use client";

import { useEffect, useRef } from "react";
import { useSupabase } from "@/lib/supabase/supabase-provider";
import type { SupabaseContextType } from "@/lib/supabase/supabase-provider";

export default function ReferralAttach() {
  const { session } = useSupabase() as SupabaseContextType;
  const fired = useRef(false);

  useEffect(() => {
    if (!session) return;
    if (fired.current) return;
    fired.current = true;

    fetch("/api/patient/referral/attach", { method: "POST" }).catch(() => {});
  }, [session]);

  return null;
}
