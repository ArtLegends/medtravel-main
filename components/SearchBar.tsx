// components/SearchBar.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { clinicPath } from '@/lib/clinic-url';

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

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1584982751601-97dcc0972d8f?q=80&w=800&auto=format&fit=crop';

export default function SearchBar({
  value,
  onChangeAction,
  placeholder = 'Search clinics...',
}: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const debouncedValue = useDebounce(value, 200);

  useEffect(() => {
    const q = debouncedValue?.trim() ?? '';

    if (!q || q.length < 2) {
      setItems([]);
      setOpen(false);
      setLoading(false);
      controllerRef.current?.abort();
      return;
    }

    controllerRef.current?.abort();
    const ctl = new AbortController();
    controllerRef.current = ctl;

    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`, { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SearchItem[]) => {
        const safe = Array.isArray(data) ? data : [];
        setItems(safe);
        setOpen(true);
      })
      .catch((err: any) => {
        if (err?.name === 'AbortError') return;
        setItems([]);
        setOpen(false);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => ctl.abort();
  }, [debouncedValue]);

  const empty = useMemo(
    () => open && !loading && items.length === 0,
    [open, loading, items.length],
  );

  const handleClear = () => {
    onChangeAction('');
    setItems([]);
    setOpen(false);
  };

  const formatLocation = (it: SearchItem) => {
    const parts = [it.city, it.country].filter(Boolean);
    if (parts.length) return parts.join(', ');
    return it.country || it.city || '';
  };

  return (
    <div className="relative">
      {/* input c иконками */}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>

        <input
          type="text"
          inputMode="search"
          className="w-full rounded-lg border border-gray-300 bg-white/90 px-9 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChangeAction(e.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              handleClear();
            }
          }}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-xs text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* dropdown */}
      {open && (
        <div className="absolute left-0 right-0 mt-3 max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-white/95 shadow-xl backdrop-blur-sm z-50">
          {/* header */}
          {(loading || items.length > 0) && (
            <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-gray-500">
              <span>Search results</span>
              {debouncedValue && (
                <span className="max-w-[55%] truncate">
                  for <span className="font-medium">&ldquo;{debouncedValue}&rdquo;</span>
                </span>
              )}
            </div>
          )}

          {/* loading */}
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">Searching…</div>
          )}

          {/* list */}
          {!loading &&
            items.map((it) => {
              const location = formatLocation(it);

              return (
                <Link
                  key={it.id}
                  href={
                    it.href ||
                    clinicPath({
                      slug: it.slug,
                      country: it.country,
                      province: it.province,
                      city: it.city,
                      district: it.district,
                    })
                  }
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {/* thumb */}
                  <div className="flex h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.image_url || FALLBACK_IMG}
                      alt={it.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                      }}
                    />
                  </div>

                  {/* text + badge */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      {/* слева: название + локация в колонку */}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 text-left">
                          {it.name}
                        </p>
                        {location && (
                          <p className="mt-0.5 truncate text-xs text-gray-500 text-left">
                            {location}
                          </p>
                        )}
                      </div>

                      {/* справа: бейдж категории, выровнен по правому краю */}
                      {it.category && (
                        <span className="ml-2 inline-flex flex-shrink-0 items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                          {it.category}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}

          {/* empty state */}
          {empty && (
            <div className="px-4 py-4 text-center text-sm text-gray-500">
              No clinics found. Try another keyword or city.
            </div>
          )}

          {/* footer */}
          {!loading && items.length > 0 && (
            <div className="border-t px-4 py-2 text-xs text-gray-400">
              Showing up to 8 results
            </div>
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
