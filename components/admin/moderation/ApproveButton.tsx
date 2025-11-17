"use client";
import { useTransition } from "react";
import { approveClinicAction } from "@/app/(admin)/admin/moderation/actions";

export function ApproveButton({ draftId, disabled }: { draftId: string; disabled?: boolean }) {
  const [pending, start] = useTransition();

  return (
    <button
      onClick={() => {
        start(async () => {
          const res = await approveClinicAction(draftId);
          if (!res.ok) alert(`Approve failed: ${res.error}`);
          else location.reload();
        });
      }}
      disabled={disabled || pending}
      className="rounded-md bg-emerald-600 text-white px-3 py-1 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
      title={disabled ? "Approve доступен только для черновиков в статусе pending" : ""}
    >
      {pending ? "Approving…" : "Approve"}
    </button>
  );
}
