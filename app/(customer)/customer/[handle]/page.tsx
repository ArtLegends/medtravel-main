// app/(customer)/customer/[handle]/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type Params = { handle: string };

export default async function CustomerPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { handle } = await params;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })),
        setAll: () => {},
      },
    }
  );

  const { data } = await supabase.auth.getUser();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Customer panel</h1>
      <p className="text-default-500 mb-4">{data.user?.email ?? ""}</p>
      <div className="rounded border p-3">Stub for /customer/{handle}</div>
    </div>
  );
}
