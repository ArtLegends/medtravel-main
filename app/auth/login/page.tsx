// app/(auth)/login/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import {
  Card,
  CardBody,
} from "@/components/shared/HeroUIComponents";
import LoginManager from "@/components/auth/LoginManager";
import { getServerTranslations } from "@/lib/i18n-server";

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

export default async function LoginPage() {
  const { t } = await getServerTranslations();

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
            Clinic portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("auth.signIn")}
          </h1>
          <p className="text-sm text-default-500">
            Access your MedTravel clinic dashboard using Google or email.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardBody className="pt-6 pb-6">
            <Suspense fallback={<LoginSkeleton />}>
              <LoginManager />
            </Suspense>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
