// app/(admin)/admin/ping/page.tsx
export const dynamic = 'force-dynamic';

export default function AdminPing() {
  return (
    <div style={{ padding: 20 }}>
      <h2>/admin/ping OK</h2>
      <p>Если вы видите этот текст — роут работает и редиректов нет.</p>
    </div>
  );
}
