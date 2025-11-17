import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function Page({ params }: { params: { handle: string } }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
        setAll: () => {},
      },
    }
  );

  // подстрахуемся: ищем профиль по username, затем по локалу email
  const h = params.handle.toLowerCase();
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
      {/* тут дальше подключишь реальную панель */}
    </div>
  );
}
