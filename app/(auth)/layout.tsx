// app/(auth)/layout.tsx

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// import { Suspense } from "react";
// import { redirect } from "next/navigation";

// import { getCurrentUser } from "@/lib/supabase/server";
// import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
// import { ThemeSwitch } from "@/components/shared/ThemeSwitch";

// function AuthLoading() {
//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="animate-pulse">
//         <div className="h-8 w-48 bg-default-200 rounded mb-4" />
//         <div className="h-4 w-32 bg-default-100 rounded" />
//       </div>
//     </div>
//   );
// }

// export default async function AuthLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const user = await getCurrentUser();

//   if (user) {
//     redirect("/");
//   }

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-default-50">
//       <main className="flex-1 flex items-center justify-center p-4">
//         <Suspense fallback={<AuthLoading />}>{children}</Suspense>
//       </main>
//     </div>
//   );
// }
