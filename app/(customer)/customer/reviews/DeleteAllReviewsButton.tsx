"use client";

import { useTransition } from "react";
import { deleteAllReviewsAction } from "./actions";

export function DeleteAllReviewsButton() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm("Delete ALL reviews for this clinic? This action cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      await deleteAllReviewsAction();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-md px-3 py-2 text-sm bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-60"
    >
      {isPending ? "Deleting..." : "Delete All"}
    </button>
  );
}
