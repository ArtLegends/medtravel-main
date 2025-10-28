'use client';

export function DeleteAllBtn({ action }: { action: () => void }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('Delete ALL reviews matching the current filter?')) e.preventDefault();
      }}
    >
      <button type="submit" className="rounded bg-rose-600 text-white px-3 py-2">
        Delete All
      </button>
    </form>
  );
}
