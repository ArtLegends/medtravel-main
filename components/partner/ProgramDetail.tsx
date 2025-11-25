// components/partner/ProgramDetail.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export type ProgramDetailConfig = {
  name: string;
  rewardRate: string;
  cookieLifetime: string;
  platforms: string;
  programDetails: string;
  payoutProcess: string;
  languages: string;
  targetCountries: string;
  allowedChannels: string;
  programTerms: string;
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-white p-4 md:p-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-gray-700">
        {children}
      </div>
    </section>
  );
}

export default function ProgramDetail({ config }: { config: ProgramDetailConfig }) {
  return (
    <div className="space-y-6">
      {/* Верх: back + заголовок + кнопка */}
      <div className="space-y-3">
        <Link
          href="/partner/programs"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>

        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <h1 className="text-2xl font-bold">{config.name}</h1>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Connect to program
          </button>
        </div>
      </div>

      {/* Overview */}
      <section className="rounded-xl border bg-white p-4 md:p-5">
        <h2 className="text-base font-semibold text-gray-900">Overview</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-700 md:grid-cols-3">
          <div>
            <dt className="text-gray-500">Reward rate</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900">
              {config.rewardRate}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Cookie lifetime</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900">
              {config.cookieLifetime}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Rewarded platforms</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900">
              {config.platforms}
            </dd>
          </div>
        </dl>
      </section>

      {/* Program details */}
      <SectionCard title="Program details">
        <p>{config.programDetails}</p>
      </SectionCard>

      {/* Payout process */}
      <SectionCard title="Payout process">
        <p>{config.payoutProcess}</p>
      </SectionCard>

      {/* Reward rate повторно (как на шаблоне) */}
      <SectionCard title="Reward rate">
        <p className="text-base font-semibold text-gray-900">
          {config.rewardRate}
        </p>
      </SectionCard>

      {/* Languages */}
      <SectionCard title="Languages">
        <p>{config.languages}</p>
      </SectionCard>

      {/* Target countries */}
      <SectionCard title="Target countries">
        <p>{config.targetCountries}</p>
      </SectionCard>

      {/* Allowed brand promotion methods & channels */}
      <SectionCard title="Allowed brand promotion methods & channels">
        <p>{config.allowedChannels}</p>
      </SectionCard>

      {/* Program terms */}
      <SectionCard title="Program terms">
        <p>{config.programTerms}</p>
      </SectionCard>
    </div>
  );
}
