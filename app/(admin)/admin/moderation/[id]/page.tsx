// app/(admin)/admin/moderation/[id]/page.tsx

// TEMP: disabled for production deploy to avoid build/type errors.
export const dynamic = 'force-static';

export default function Page() {
  return null; // or a tiny stub UI if нужно
}


// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { createAdminClient } from "@/lib/supabase/adminClient";
// import { approveClinic, rejectClinic } from "../actions";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;
// export const dynamicParams = true;

// export default async function ModerationDetail({
//   params,
// }: { params: { id: string } }) {
//   const sb = createAdminClient();

//   const [{ data: clinic, error: cErr }, { data: draft, error: dErr }] =
//     await Promise.all([
//       sb.from("clinics").select("*").eq("id", params.id).single(),
//       sb.from("clinic_profile_drafts").select("*").eq("clinic_id", params.id).maybeSingle(),
//     ]);

//   if (cErr) throw cErr;
//   if (!clinic) return notFound();
//   if (dErr) throw dErr;

//   // распаковка черновика (без падений)
//   const basic = (draft?.basic_info ?? {}) as any;
//   const services = Array.isArray(draft?.services) ? draft!.services as any[] : [];
//   const doctors  = Array.isArray(draft?.doctors)  ? draft!.doctors  as any[] : [];
//   const facilities = (draft?.facilities ?? { premises:[], clinic_services:[], travel_services:[], languages_spoken:[] }) as any;
//   const hours = Array.isArray(draft?.hours) ? draft!.hours as any[] : [];
//   const gallery = Array.isArray(draft?.gallery) ? draft!.gallery as any[] : [];
//   const location = (draft?.location ?? {}) as any;
//   const payments = Array.isArray(draft?.pricing) ? draft!.pricing as any[] : [];

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold">{clinic.name || "(no name)"}</h1>
//         <div className="flex items-center gap-4">
//           {clinic.slug && (
//             <Link
//               href={`/clinics/${clinic.slug}`}
//               className="text-sm text-gray-600 hover:underline"
//               target="_blank"
//             >
//               Open public page →
//             </Link>
//           )}
//           <Link href="/admin/moderation" className="text-sm text-blue-600 hover:underline">
//             ← Back to list
//           </Link>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Card title="Clinic">
//           <KV k="ID" v={clinic.id} />
//           <KV k="Slug" v={clinic.slug} />
//           <KV k="Moderation / Status" v={`${clinic.moderation_status} / ${clinic.status}`} />
//           <KV k="Published" v={String(Boolean(clinic.is_published))} />
//           <KV k="Location" v={[clinic.city, clinic.country].filter(Boolean).join(", ")} />
//           <KV k="Address" v={clinic.address} />
//           <KV k="Map URL" v={clinic.map_embed_url || "(empty)"} />
//           <KV k="Updated" v={clinic.updated_at as any} />
//         </Card>

//         <Card title="Draft meta">
//           <KV k="Draft status" v={(draft?.status as any) || "-"} />
//           <KV k="Updated at" v={(draft?.updated_at as any) || "-"} />
//           {!draft && <div className="text-sm text-gray-500">No draft yet.</div>}
//         </Card>

//         <Card title="Basic (draft)">
//           <KV k="Name" v={basic.name} />
//           <KV k="Slug" v={basic.slug} />
//           <KV k="Specialty" v={basic.specialty} />
//           <KV k="Country" v={basic.country} />
//           <KV k="City" v={basic.city} />
//           <KV k="Province" v={basic.province} />
//           <KV k="District" v={basic.district} />
//           <div className="mt-2 text-sm">
//             <div className="text-gray-500 mb-1">Description</div>
//             <div className="whitespace-pre-wrap">{basic.description || "-"}</div>
//           </div>
//         </Card>

//         <Card title="Location (draft)">
//           <KV k="Google Maps URL" v={location.mapUrl} />
//           <div className="mt-2 text-sm">
//             <div className="text-gray-500 mb-1">Directions</div>
//             <div className="whitespace-pre-wrap">{location.directions || "-"}</div>
//           </div>
//         </Card>

//         <Card title={`Services (${services.length})`}>
//           {!services.length ? (
//             <div className="text-sm text-gray-500">No services.</div>
//           ) : (
//             <ul className="text-sm list-disc pl-5 space-y-1">
//               {services.map((s, i) => (
//                 <li key={i}>
//                   <span className="font-medium">{s?.name || "-"}</span>
//                   {s?.price ? ` — ${s.price} ${s?.currency || ""}` : ""}
//                   {s?.description ? ` • ${s.description}` : ""}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </Card>

//         <Card title={`Doctors (${doctors.length})`}>
//           {!doctors.length ? (
//             <div className="text-sm text-gray-500">No doctors.</div>
//           ) : (
//             <ul className="text-sm list-disc pl-5 space-y-1">
//               {doctors.map((d, i) => (
//                 <li key={i}>
//                   <span className="font-medium">{d?.fullName || d?.name || "-"}</span>
//                   {d?.title ? ` — ${d.title}` : ""}
//                   {d?.specialty ? ` • ${d.specialty}` : ""}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </Card>

//         <Card title="Facilities & Languages">
//           <TagRow label="Premises" values={facilities.premises} />
//           <TagRow label="Clinic services" values={facilities.clinic_services} />
//           <TagRow label="Travel services" values={facilities.travel_services} />
//           <TagRow label="Languages" values={facilities.languages_spoken} />
//         </Card>

//         <Card title={`Hours (${hours.length})`}>
//           {!hours.length ? (
//             <div className="text-sm text-gray-500">No working hours.</div>
//           ) : (
//             <table className="w-full text-sm">
//               <tbody>
//                 {hours.map((h, i) => (
//                   <tr key={i} className="border-t">
//                     <td className="py-1 pr-3">{h.day}</td>
//                     <td className="py-1 pr-3">{h.status}</td>
//                     <td className="py-1">{[h.start, h.end].filter(Boolean).join(" - ")}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </Card>

//         <Card title={`Payments (${payments.length})`}>
//           {!payments.length ? (
//             <div className="text-sm text-gray-500">No payment methods.</div>
//           ) : (
//             <div className="flex flex-wrap gap-2">
//               {payments.map((p, i) => (
//                 <span key={i} className="rounded-full bg-gray-100 px-2 py-1 text-sm">{String(p)}</span>
//               ))}
//             </div>
//           )}
//         </Card>

//         <Card title={`Gallery (${gallery.length})`}>
//           {!gallery.length ? (
//             <div className="text-sm text-gray-500">No images.</div>
//           ) : (
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//               {gallery.map((g, i) => (
//                 <div key={i} className="rounded-lg border overflow-hidden">
//                   <div className="aspect-[4/3] bg-gray-100">
//                     {g?.url && <img src={g.url} alt={g?.title || "Image"} className="w-full h-full object-cover" />}
//                   </div>
//                   {g?.title && <div className="px-2 py-1 text-xs text-gray-600 truncate">{g.title}</div>}
//                 </div>
//               ))}
//             </div>
//           )}
//         </Card>
//       </div>

//       <div className="flex items-center gap-3">
//         <form action={approveClinic}>
//           <input type="hidden" name="clinicId" value={clinic.id} />
//           <button className="rounded-md bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700">
//             Approve & Publish
//           </button>
//         </form>

//         <form action={rejectClinic} className="flex items-center gap-2">
//           <input type="hidden" name="clinicId" value={clinic.id} />
//           <input name="reason" placeholder="Reason" className="rounded-md border px-2 py-2 text-sm" />
//           <button className="rounded-md border px-3 py-2 hover:bg-gray-50">Reject</button>
//         </form>
//       </div>
//     </div>
//   );
// }

// function Card({ title, children }: { title: string; children: React.ReactNode }) {
//   return (
//     <div className="rounded-xl border bg-white p-4">
//       <div className="text-sm text-gray-500 mb-2">{title}</div>
//       {children}
//     </div>
//   );
// }

// function KV({ k, v }: { k: string; v?: string | null }) {
//   return (
//     <div className="flex gap-2 text-sm">
//       <div className="w-40 text-gray-500">{k}</div>
//       <div className="flex-1 break-words">{v || "-"}</div>
//     </div>
//   );
// }

// function TagRow({ label, values }: { label: string; values?: string[] }) {
//   const arr = Array.isArray(values) ? values : [];
//   return (
//     <div className="mb-2">
//       <div className="text-xs text-gray-500 mb-1">{label}</div>
//       {!arr.length ? (
//         <div className="text-sm text-gray-500">—</div>
//       ) : (
//         <div className="flex flex-wrap gap-2">
//           {arr.map((x, i) => (
//             <span key={i} className="rounded-full bg-gray-100 px-2 py-1 text-sm">{x}</span>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
