// app/(auth)/login/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardBody } from "@/components/shared/HeroUIComponents";
import LoginManager from "@/components/auth/LoginManager";

export const metadata: Metadata = {
  title: "Sign In - MedTravel",
  description: "Sign in to your MedTravel account",
  robots: {
    index: false,
    follow: false,
  },
};

function LoginSkeleton() {
  return (
    <Card className="w-full max-w-md animate-pulse">
      <CardBody className="space-y-4 p-6">
        <div className="h-6 w-32 bg-default-200 rounded" />
        <div className="h-4 w-48 bg-default-100 rounded" />
        <div className="h-10 bg-default-100 rounded" />
        <div className="h-10 bg-primary/20 rounded" />
      </CardBody>
    </Card>
  );
}

// ВАЖНО: searchParams теперь Promise
type Props = {
  searchParams: Promise<{ as?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  const as = (params.as || "CUSTOMER").toUpperCase();
  const isAdmin = as === "ADMIN";

  const portalLabel = isAdmin ? "Admin portal" : "Clinic portal";
  const title = isAdmin ? "Sign in to admin panel" : "Sign in";
  const description = isAdmin
    ? "Access the MedTravel admin dashboard."
    : "Access your MedTravel clinic dashboard using Google or email.";

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
            {portalLabel}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-default-500">{description}</p>
        </div>

        <Card className="shadow-lg">
          <CardBody className="pt-6 pb-6">
            <Suspense fallback={<LoginSkeleton />}>
              <LoginManager />
            </Suspense>
          </CardBody>
        </Card>

        <div className="text-center">
          <a
            href="/"
            className="text-xs text-default-500 hover:text-default-700 underline underline-offset-2"
          >
            ← Back to MedTravel home
          </a>
        </div>
      </div>
    </main>
  );
}
