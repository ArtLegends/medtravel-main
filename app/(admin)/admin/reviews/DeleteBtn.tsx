'use client';

export function DeleteBtn({
  id,
  action,
}: {
  id: string;
  action: (formData: FormData) => void; // server action
}) {
  return (
    <form
      action={action}
      className="inline-block"
      onSubmit={(e) => {
        if (!confirm('Delete this review?')) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="rounded border px-3 py-1 hover:bg-gray-50">
        Delete
      </button>
    </form>
  );
}
