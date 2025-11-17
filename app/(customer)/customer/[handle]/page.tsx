// app/(customer)/customer/[handle]/page.tsx
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type Params = { handle: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { handle } = await params; // <-- важно: await params (Next 15)
  const h = handle.toLowerCase();

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })),
        setAll: () => {}, // на серверном компоненте ничего не пишем
      },
    }
  );

  // Временный поиск по префиксу email (до появления username/handle в profiles)
  const { data: prof } = await supabase
    .from("profiles")
    .select("id,email,first_name,last_name,role")
    .ilike("email", `${h}@%`)
    .maybeSingle();

  if (!prof) return notFound();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Customer panel</h1>
      <p className="text-default-500 mt-2">{prof.email}</p>

      {/* Заглушка — сюда потом подключим настоящую панель */}
      <div className="mt-6 rounded-lg border p-4">
        <p className="text-sm">Stub for /customer/{h}</p>
      </div>
    </div>
  );
}
