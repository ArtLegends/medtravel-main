// app/(auth)/layout.tsx
import { ReactNode, Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-default-200 rounded mb-4" />
        <div className="h-4 w-32 bg-default-100 rounded" />
      </div>
    </div>
  );
}

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          cookieStore.getAll().map((c: any) => ({ name: c.name, value: c.value })),
        setAll: () => {},
      },
    }
  );

  const { data } = await supabase.auth.getUser();

  // если уже авторизован — на главную (или next из query обработает middleware)
  if (data.user) redirect("/");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-default-50">
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<AuthLoading />}>{children}</Suspense>
      </main>
    </div>
  );
}
