// components/SearchBar.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { clinicPath } from '@/lib/clinic-url'

type SearchItem = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  image_url: string | null;
  href: string;
  country: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
};

interface Props {
  value: string;
  onChangeAction: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeAction, placeholder = "Search clinics..." }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SearchItem[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

  // простая защита от спама: 200 мс
  const debouncedValue = useDebounce(value, 200);

  useEffect(() => {
    if (!debouncedValue || debouncedValue.trim().length < 2) {
      setItems([]);
      setOpen(false);
      controllerRef.current?.abort();
      return;
    }

    controllerRef.current?.abort();
    const ctl = new AbortController();
    controllerRef.current = ctl;

    fetch(`/api/search?q=${encodeURIComponent(debouncedValue)}&limit=8`, { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SearchItem[]) => {
        setItems(Array.isArray(data) ? data : []);
        setOpen(true);
      })
      .catch(() => {
        // ignore aborted / network errors
      });

    return () => ctl.abort();
  }, [debouncedValue]);

  const empty = useMemo(() => open && items.length === 0, [open, items.length]);

  return (
    <div className="relative">
      <input
        type="search"
        className="w-full px-4 py-2 rounded border outline-none focus:ring-2 focus:ring-primary"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChangeAction(e.target.value)}
        onFocus={() => items.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)} // чтобы клик по пункту успел сработать
      />

      {/* dropdown */}
      {open && (
        <div className="absolute left-0 right-0 mt-2 rounded-lg border bg-content1 shadow-lg overflow-hidden z-50">
          {items.map((it) => (
            <Link
              key={it.id}
              href={
                it.href ||
                clinicPath({
                  slug: it.slug,               // убедись, что это поле есть в айтеме
                  country: it.country,
                  province: it.province,
                  city: it.city,
                  district: it.district,
                })
              }
              className="flex items-center gap-3 p-3 hover:bg-content2 transition-colors"
              onClick={() => setOpen(false)}
            >
              {/* thumb */}
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.image_url || ""}
                  alt={it.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1584982751601-97dcc0972d8f?q=80&w=1200&auto=format&fit=crop";
                  }}
                />
              </div>

              {/* text */}
              <div className="min-w-0">
                <div className="truncate font-medium text-foreground">{it.name}</div>
                {it.category && <div className="text-sm text-muted-foreground">{it.category}</div>}
              </div>
            </Link>
          ))}

          {empty && (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center select-none">No results</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ───────────────── helpers ───────────────── */
function useDebounce<T>(value: T, ms = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}
