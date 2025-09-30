// app/(admin)/admin/contacts/page.tsx
import { getContacts } from "@/lib/mock/db";

export const metadata = { title: "Contacts • Admin" };
// чтобы данные не кэшировались
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContactsPage() {
  const rows = await getContacts();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Contacts</h1>

      <div className="rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="p-3 text-gray-500" colSpan={4}>
                  No contacts yet
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{`${r.firstName} ${r.lastName}`}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{r.phone || "—"}</td>
                  <td className="p-3">{r.createdAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
