// components/partner/ProgramDetail.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useSupabase } from "@/lib/supabase/supabase-provider";
import type { SupabaseContextType } from "@/lib/supabase/supabase-provider";

export type ProgramDetailConfig = {
  key: string;                 // <--- добавили
  name: string;
  rewardRate: string;
  cookieLifetime: string;
  platforms: string;
  programDetails: string;
  payoutProcess: string;
  languages: string;
  targetCountries: string;
  allowedChannels: string;
  programTerms: string;
};

type RequestStatus = "none" | "pending" | "approved" | "rejected";

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-white p-4 md:p-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-gray-700">
        {children}
      </div>
    </section>
  );
}

export default function ProgramDetail({
  config,
}: {
  config: ProgramDetailConfig;
}) {
  const { supabase, session } =
    useSupabase() as SupabaseContextType;

  const [status, setStatus] = useState<RequestStatus>("none");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // подгружаем текущее состояние заявки для этой программы
  useEffect(() => {
    if (!supabase || !session) return;

    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("partner_program_requests")
        .select("id,status")
        .eq("user_id", session.user.id)
        .eq("program_key", config.key)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        // тихо игнорируем, просто остаётся status = "none"
        console.error("load partner_program_request error", error);
        return;
      }

      if (data?.status === "pending") setStatus("pending");
      else if (data?.status === "approved") setStatus("approved");
      else if (data?.status === "rejected") setStatus("rejected");
      else setStatus("none");
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase, session, config.key]);

  const handleConnect = useCallback(async () => {
    setErrorMsg(null);

    // если по каким-то причинам юзер не авторизован — ведём на логин
    if (!session) {
      if (typeof window !== "undefined") {
        const next =
          window.location.pathname + window.location.search;
        window.location.href =
          `/auth/login?as=PARTNER&next=${encodeURIComponent(next)}`;
      }
      return;
    }

    if (!supabase) return;

    setBusy(true);
    try {
      const { error } = await supabase
        .from("partner_program_requests")
        .insert({
          user_id: session.user.id,
          program_key: config.key,
          status: "pending",
        });

      if (error) {
        console.error("insert partner_program_request error", error);
        setErrorMsg(
          error.message || "Failed to send request. Please try again.",
        );
      } else {
        setStatus("pending");
      }
    } finally {
      setBusy(false);
    }
  }, [supabase, session, config.key]);

  let buttonLabel = "Connect to program";
  if (status === "pending") buttonLabel = "Request sent (pending)";
  if (status === "approved") buttonLabel = "Connected";
  if (status === "rejected") buttonLabel = "Request rejected";

  const buttonDisabled =
    busy || status === "pending" || status === "approved";

  return (
    <div className="space-y-6">
      {/* Верх: back + заголовок + кнопка */}
      <div className="space-y-3">
        <Link
          href="/partner/programs"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>

        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <h1 className="text-2xl font-bold">{config.name}</h1>

          <button
            type="button"
            onClick={handleConnect}
            disabled={buttonDisabled}
            className={[
              "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white",
              buttonDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-900 hover:bg-black",
            ].join(" ")}
          >
            {busy ? "Processing…" : buttonLabel}
          </button>
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}
      </div>

      {/* Overview */}
      <section className="rounded-xl border bg-white p-4 md:p-5">
        <h2 className="text-base font-semibold text-gray-900">
          Overview
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-700 md:grid-cols-3">
          <div>
            <dt className="text-gray-500">Reward rate</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900">
              {config.rewardRate}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Cookie lifetime</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900">
              {config.cookieLifetime}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Rewarded platforms</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900">
              {config.platforms}
            </dd>
          </div>
        </dl>
      </section>

      {/* Остальные секции без изменений */}
      <SectionCard title="Program details">
        <p>{config.programDetails}</p>
      </SectionCard>

      <SectionCard title="Payout process">
        <p>{config.payoutProcess}</p>
      </SectionCard>

      <SectionCard title="Reward rate">
        <p className="text-base font-semibold text-gray-900">
          {config.rewardRate}
        </p>
      </SectionCard>

      <SectionCard title="Languages">
        <p>{config.languages}</p>
      </SectionCard>

      <SectionCard title="Target countries">
        <p>{config.targetCountries}</p>
      </SectionCard>

      <SectionCard title="Allowed brand promotion methods & channels">
        <p>{config.allowedChannels}</p>
      </SectionCard>

      <SectionCard title="Program terms">
        <p>{config.programTerms}</p>
      </SectionCard>
    </div>
  );
}
