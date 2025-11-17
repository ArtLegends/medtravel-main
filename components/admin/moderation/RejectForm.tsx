"use client";
import { useTransition, useState } from "react";
import { rejectClinicAction } from "@/app/(admin)/admin/moderation/actions";

export function RejectForm({ draftId }: { draftId: string }) {
  const [pending, start] = useTransition();
  const [reason, setReason] = useState("");

  return (
    <div className="flex items-center gap-2">
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason"
        className="rounded-md border px-2 py-1 text-sm"
      />
      <button
        onClick={() => {
          start(async () => {
            const res = await rejectClinicAction(draftId, reason);
            if (!res.ok) alert(`Reject failed: ${res.error}`);
            else location.reload();
          });
        }}
        className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
        disabled={pending}
      >
        {pending ? "Rejecting…" : "Reject"}
      </button>
    </div>
  );
}
