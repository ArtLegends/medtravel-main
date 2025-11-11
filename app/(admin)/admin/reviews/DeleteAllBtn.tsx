// app/(admin)/admin/reviews/DeleteAllBtn.tsx
'use client';

export function DeleteAllBtn() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm('Delete ALL reviews in the current range?')) e.preventDefault();
      }}
      className="rounded-md bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-600"
    >
      Delete All
    </button>
  );
}
