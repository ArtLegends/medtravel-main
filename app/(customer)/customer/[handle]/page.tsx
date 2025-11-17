// app/(customer)/customer/[handle]/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import CustomerDashboard from "@/app/(customer)/customer/page";

type Params = { handle: string };

export default async function CustomerHandlePage({
    params,
  }: {
    params: Promise<Params>;
  }) {
    const { handle } = await params;
  
    // (необязательно) получим юзера — пригодится для будущих проверок
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })),
          setAll: () => {},
        },
      }
    );
    await supabase.auth.getUser();
  
    // Рисуем тот же самый дэшборд, что и на /customer
    return <CustomerDashboard />;
  }
