// app/ru/hair-transplant/lp/_components/PhoneInput.tsx
'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ─── Country data ───
type Country = {
  code: string;
  dial: string;
  name: string;
  format: string;
  maxDigits: number;
};

const COUNTRIES: Country[] = [
  { code: 'ru', dial: '+7',   name: 'Россия',        format: '### ### ## ##',  maxDigits: 10 },
  { code: 'kz', dial: '+7',   name: 'Казахстан',     format: '### ### ## ##',  maxDigits: 10 },
  { code: 'ua', dial: '+380', name: 'Україна',        format: '## ### ## ##',   maxDigits: 9 },
  { code: 'by', dial: '+375', name: 'Беларусь',       format: '## ### ## ##',   maxDigits: 9 },
  { code: 'uz', dial: '+998', name: 'Узбекистан',     format: '## ### ## ##',   maxDigits: 9 },
  { code: 'tr', dial: '+90',  name: 'Türkiye',        format: '### ### ## ##',  maxDigits: 10 },
  { code: 'de', dial: '+49',  name: 'Deutschland',    format: '### ### ####',   maxDigits: 10 },
  { code: 'gb', dial: '+44',  name: 'United Kingdom', format: '#### ### ###',   maxDigits: 10 },
  { code: 'us', dial: '+1',   name: 'United States',  format: '### ### ####',   maxDigits: 10 },
  { code: 'pl', dial: '+48',  name: 'Polska',         format: '### ### ###',    maxDigits: 9 },
  { code: 'ge', dial: '+995', name: 'Georgia',        format: '### ## ## ##',   maxDigits: 9 },
  { code: 'az', dial: '+994', name: 'Azərbaycan',     format: '## ### ## ##',   maxDigits: 9 },
  { code: 'am', dial: '+374', name: 'Armenia',        format: '## ### ###',     maxDigits: 8 },
  { code: 'kg', dial: '+996', name: 'Кыргызстан',     format: '### ### ###',    maxDigits: 9 },
  { code: 'tj', dial: '+992', name: 'Таджикистан',    format: '## ### ####',    maxDigits: 9 },
  { code: 'md', dial: '+373', name: 'Moldova',        format: '## ### ###',     maxDigits: 8 },
  { code: 'ae', dial: '+971', name: 'UAE',             format: '## ### ####',    maxDigits: 9 },
  { code: 'il', dial: '+972', name: 'Israel',          format: '## ### ####',    maxDigits: 9 },
  { code: 'lt', dial: '+370', name: 'Lietuva',        format: '### ## ###',     maxDigits: 8 },
  { code: 'lv', dial: '+371', name: 'Latvija',        format: '## ### ###',     maxDigits: 8 },
  { code: 'ee', dial: '+372', name: 'Eesti',          format: '#### ####',      maxDigits: 8 },
];

// ─── Flag via flagcdn.com ───
function Flag({ code, size = 20 }: { code: string; size?: number }) {
  const h = Math.round(size * 0.75);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      alt={code.toUpperCase()}
      width={size}
      height={h}
      className="inline-block rounded-[3px] object-cover"
      style={{ minWidth: size, minHeight: h }}
      loading="lazy"
    />
  );
}

// ─── Helpers ───
function onlyDigits(s: string): string {
  return s.replace(/\D/g, '');
}

function applyFormat(digits: string, pattern: string): string {
  let result = '';
  let di = 0;
  for (const ch of pattern) {
    if (di >= digits.length) break;
    if (ch === '#') {
      result += digits[di++];
    } else {
      result += ch;
    }
  }
  return result;
}

function toE164(dial: string, digits: string): string {
  return dial + digits;
}

// ─── Component ───
type Props = {
  value: string;
  onChange: (e164: string) => void;
  placeholder?: string;
  className?: string;
};

export default function PhoneInput({
  value,
  onChange,
  placeholder = 'Номер телефона',
  className,
}: Props) {
  const detectCountry = useCallback((e164: string): Country => {
    if (!e164) return COUNTRIES[0];
    const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
    for (const c of sorted) {
      if (e164.startsWith(c.dial)) return c;
    }
    return COUNTRIES[0];
  }, []);

  const [country, setCountry] = useState<Country>(() => detectCountry(value));
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const localDigits = useMemo(() => {
    if (!value || !value.startsWith(country.dial)) return '';
    return value.slice(country.dial.length);
  }, [value, country.dial]);

  const displayValue = useMemo(
    () => applyFormat(localDigits, country.format),
    [localDigits, country.format]
  );

  const handleInput = (raw: string) => {
    const digits = onlyDigits(raw).slice(0, country.maxDigits);
    onChange(toE164(country.dial, digits));
  };

  const selectCountry = (c: Country) => {
    setCountry(c);
    setOpen(false);
    setSearch('');
    const digits = localDigits.slice(0, c.maxDigits);
    onChange(toE164(c.dial, digits));
  };

  // Calculate fixed position for dropdown
  const updatePosition = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed' as const,
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 999999,
    });
  }, []);

  // Update position when open
  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (wrapperRef.current?.contains(target)) return;
      // Check if clicking inside the dropdown itself
      if (target.closest('[data-phone-dropdown]')) return;
      setOpen(false);
      setSearch('');
    };
    // Use capture phase to beat Dialog's handler
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [open]);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.trim().toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.includes(q)
    );
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Backspace', 'Delete', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  return (
    <div className={cn('relative', className)} ref={wrapperRef}>
      <div className="flex h-10 w-full rounded-md border border-input bg-white shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring">
        {/* Country selector */}
        <button
          type="button"
          onClick={() => { updatePosition(); setOpen((v) => !v); }}
          className="flex items-center gap-1.5 pl-2.5 pr-2 border-r border-input shrink-0 hover:bg-slate-50 rounded-l-md transition-colors"
          aria-label="Выбрать страну"
        >
          <Flag code={country.code} size={20} />
          <span className="text-sm text-slate-700 font-medium">{country.dial}</span>
          <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Phone input */}
        <input
          type="tel"
          inputMode="numeric"
          className="flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none"
          placeholder={placeholder}
          value={displayValue}
          onKeyDown={handleKeyDown}
          onChange={(e) => handleInput(e.target.value)}
          autoComplete="tel-national"
        />
      </div>

      {/* Dropdown — fixed position, renders inside the component tree (not a portal) */}
      {open && (
        <div
          data-phone-dropdown
          style={dropdownStyle}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-h-56 overflow-auto rounded-xl border bg-white shadow-xl ring-1 ring-black/5">
            {/* Search */}
            <div className="sticky top-0 bg-white border-b p-2">
              <input
                ref={searchRef}
                type="text"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30"
                placeholder="Поиск страны..."
                value={search}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-slate-400">
                Страна не найдена
              </div>
            ) : (
              filtered.map((c) => {
                const isActive = c.code === country.code && c.dial === country.dial;
                return (
                  <button
                    key={`${c.code}-${c.dial}`}
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectCountry(c);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors',
                      isActive ? 'bg-teal-50 text-teal-900' : 'hover:bg-slate-50 text-slate-700'
                    )}
                  >
                    <Flag code={c.code} size={22} />
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-slate-400 font-mono tabular-nums">{c.dial}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}