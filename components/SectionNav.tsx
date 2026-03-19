// components/SectionNav.tsx
'use client';

type Section = { id: string; label: string };

export default function SectionNav({ sections }: { sections: Section[] }) {
  return (
    <nav aria-label="Clinic sections">
      <div className="flex gap-1.5 overflow-x-auto overflow-y-hidden whitespace-nowrap rounded-xl border bg-white px-2 py-2 shadow-sm"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs sm:text-sm hover:bg-gray-100 data-[active=true]:bg-blue-600 data-[active=true]:text-white flex-shrink-0"
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
