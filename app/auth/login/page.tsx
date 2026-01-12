// app/auth/login/page.tsx
import AuthLoginClient from "@/components/auth/AuthLoginClient";

export const dynamic = "force-dynamic";

type SP = { [key: string]: string | string[] | undefined };

function pick(sp: SP, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

export default function Page({ searchParams }: { searchParams: SP }) {
  const as = pick(searchParams, "as");     // PATIENT / PARTNER / CUSTOMER
  const next = pick(searchParams, "next"); // куда после логина

  return <AuthLoginClient as={as} next={next} />;
}
