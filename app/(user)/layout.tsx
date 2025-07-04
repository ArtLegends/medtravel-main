import { Suspense } from "react";

import { requireAuth } from "@/lib/supabase/server";
import { PageTransition } from "@/components/shared/PageTransition";

// Загрузочный компонент для пользовательских страниц
function UserLayoutSkeleton() {
  return (
    <div className="flex-1 p-6">
      <div className="container mx-auto space-y-6">
        <div className="h-8 w-64 bg-default-200 rounded animate-pulse" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-default-100 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SSR Guard: требуется аутентификация для доступа к пользовательским страницам
  await requireAuth();

  return (
    <Suspense fallback={<UserLayoutSkeleton />}>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  );
}
