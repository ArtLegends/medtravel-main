// app/(partner)/partner/programs/page.tsx
import Link from "next/link";

type PartnerProgram = {
  id: string;
  slug: string;
  name: string;
  rewardRatePercent: number;
  cookieLifetimeDays: number;
  platforms: string;
};

const PROGRAMS: PartnerProgram[] = [
  {
    id: "dentistry",
    slug: "dentistry",
    name: "Dentistry",
    rewardRatePercent: 5,
    cookieLifetimeDays: 90,
    platforms: "Desktop, Mobile web",
  },
  {
    id: "hair-transplant",
    slug: "hair-transplant",
    name: "Hair Transplant",
    rewardRatePercent: 5,
    cookieLifetimeDays: 90,
    platforms: "Desktop, Mobile web",
  },
];

export default function PartnerProgramsPage() {
  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold">Programs</h1>
        <p className="text-gray-600">
          Manage your affiliate programs and track performance across different
          medical categories.
        </p>
      </div>

      {/* Карточки программ */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PROGRAMS.map((program) => (
          <article
            key={program.id}
            className="flex h-full flex-col overflow-hidden rounded-xl border bg-white"
          >
            {/* Placeholder под картинку */}
            <div className="h-40 w-full bg-gray-200" />

            {/* Контент карточки */}
            <div className="flex flex-1 flex-col p-4 space-y-4">
              <h2 className="text-lg font-semibold">{program.name}</h2>

              <div className="rounded-lg bg-gray-50 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reward Rate</span>
                  <span className="font-semibold">
                    {program.rewardRatePercent}%
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-gray-600">Cookie lifetime</span>
                  <span className="font-semibold">
                    {program.cookieLifetimeDays} days
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-gray-600">Rewarded platforms:</div>
                  <div className="mt-1 font-medium text-gray-800">
                    {program.platforms}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/partner/programs/${program.slug}`}
                  className="inline-flex w-full items-center justify-center rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
                >
                  Details
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
