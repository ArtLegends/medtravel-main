// components/Breadcrumbs.tsx
"use client";

import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string; // у последнего обычно href нет
};

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (!items?.length) return null;
  const lastIdx = items.length - 1;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-gray-500">
        {items.map((item, idx) => {
          const isLast = idx === lastIdx;

          const content =
            item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-emerald-700 hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-gray-800" : ""}>
                {item.label}
              </span>
            );

          return (
            <li key={`${item.label}-${idx}`} className="flex items-center gap-1">
              {idx > 0 && <span className="text-gray-300">/</span>}
              {content}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
