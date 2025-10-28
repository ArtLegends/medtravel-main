'use client';

export function StatusForm({
  id,
  initial,
  action,
}: {
  id: string;
  initial: 'new' | 'published' | 'rejected';
  action: (formData: FormData) => void; // server action
}) {
  return (
    <form action={action} className="inline-flex">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={initial}
        className="rounded border px-2 py-1"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        <option value="new">New</option>
        <option value="published">Published</option>
        <option value="rejected">Rejected</option>
      </select>
    </form>
  );
}
