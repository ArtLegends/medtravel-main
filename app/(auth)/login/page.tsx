import { Metadata } from "next";
import { Suspense } from "react";

import {
  Card,
  CardBody,
  CardHeader,
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
      <CardHeader className="pb-6">
        <div className="h-8 w-32 bg-default-200 rounded" />
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="h-10 bg-default-100 rounded" />
        <div className="h-10 bg-default-100 rounded" />
        <div className="h-10 bg-primary/20 rounded" />
      </CardBody>
    </Card>
  );
}

export default async function LoginPage() {
  const { t } = await getServerTranslations();

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="pb-6 pt-8">
        <div className="w-full text-center">
          <h1 className="text-2xl font-bold text-foreground">
            {t("auth.signIn")}
          </h1>
          <p className="text-sm text-default-500 mt-2">
            {t("auth.signInDescription")}
          </p>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <Suspense fallback={<LoginSkeleton />}>
          <LoginManager />
        </Suspense>
      </CardBody>
    </Card>
  );
}
