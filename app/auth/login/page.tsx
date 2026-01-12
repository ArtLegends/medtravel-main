// app/auth/login/page.tsx
import AuthLoginClient from "@/components/auth/AuthLoginClient";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;
type Props = {
  searchParams: Promise<SP>;
};

function pick(sp: SP, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;

  const as = pick(sp, "as");       // PATIENT / PARTNER / CUSTOMER
  const next = pick(sp, "next");   // куда после логина

  return <AuthLoginClient as={as} next={next} />;
}
