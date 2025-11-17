"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/lib/supabase/supabase-provider";

export default function Logout() {
  const { supabase } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await supabase.auth.signOut();
      router.replace("/");
    })();
  }, [supabase, router]);

  return null;
}
