// app/ru/hair-transplant/lp/_components/PhoneInput.tsx
'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ─── Country data: code, dial, name, format pattern, max digits ───
type Country = {
  code: string;      // ISO 3166-1 alpha-2
  dial: string;      // e.g. "+7"
  name: string;      // Display name
  flag: string;      // Emoji flag
  format: string;    // e.g. "### ### ## ##" — # = digit placeholder
  maxDigits: number; // max digits AFTER dial code
};

const COUNTRIES: Country[] = [
  { code: 'RU', dial: '+7',   name: 'Россия',        flag: '🇷🇺', format: '### ### ## ##',    maxDigits: 10 },
  { code: 'KZ', dial: '+7',   name: 'Казахстан',     flag: '🇰🇿', format: '### ### ## ##',    maxDigits: 10 },
  { code: 'UA', dial: '+380', name: 'Україна',        flag: '🇺🇦', format: '## ### ## ##',     maxDigits: 9 },
  { code: 'BY', dial: '+375', name: 'Беларусь',       flag: '🇧🇾', format: '## ### ## ##',     maxDigits: 9 },
  { code: 'UZ', dial: '+998', name: 'Ўзбекистон',     flag: '🇺🇿', format: '## ### ## ##',     maxDigits: 9 },
  { code: 'TR', dial: '+90',  name: 'Türkiye',        flag: '🇹🇷', format: '### ### ## ##',    maxDigits: 10 },
  { code: 'DE', dial: '+49',  name: 'Deutschland',    flag: '🇩🇪', format: '### ### ####',     maxDigits: 10 },
  { code: 'GB', dial: '+44',  name: 'United Kingdom', flag: '🇬🇧', format: '#### ### ###',     maxDigits: 10 },
  { code: 'US', dial: '+1',   name: 'United States',  flag: '🇺🇸', format: '### ### ####',     maxDigits: 10 },
  { code: 'PL', dial: '+48',  name: 'Polska',         flag: '🇵🇱', format: '### ### ###',      maxDigits: 9 },
  { code: 'GE', dial: '+995', name: 'საქართველო',    flag: '🇬🇪', format: '### ## ## ##',     maxDigits: 9 },
  { code: 'AZ', dial: '+994', name: 'Azərbaycan',     flag: '🇦🇿', format: '## ### ## ##',     maxDigits: 9 },
  { code: 'AM', dial: '+374', name: 'Հայաստան',       flag: '🇦🇲', format: '## ### ###',       maxDigits: 8 },
  { code: 'KG', dial: '+996', name: 'Кыргызстан',     flag: '🇰🇬', format: '### ### ###',      maxDigits: 9 },
  { code: 'TJ', dial: '+992', name: 'Тоҷикистон',     flag: '🇹🇯', format: '## ### ####',      maxDigits: 9 },
  { code: 'MD', dial: '+373', name: 'Moldova',        flag: '🇲🇩', format: '## ### ###',       maxDigits: 8 },
  { code: 'AE', dial: '+971', name: 'الإمارات',       flag: '🇦🇪', format: '## ### ####',      maxDigits: 9 },
  { code: 'IL', dial: '+972', name: 'ישראל',          flag: '🇮🇱', format: '## ### ####',      maxDigits: 9 },
  { code: 'LT', dial: '+370', name: 'Lietuva',        flag: '🇱🇹', format: '### ## ###',       maxDigits: 8 },
  { code: 'LV', dial: '+371', name: 'Latvija',        flag: '🇱🇻', format: '## ### ###',       maxDigits: 8 },
  { code: 'EE', dial: '+372', name: 'Eesti',          flag: '🇪🇪', format: '#### ####',        maxDigits: 8 },
];

// ─── Formatting helpers ───

/** Strip everything except digits */
function onlyDigits(s: string): string {
  return s.replace(/\D/g, '');
}

/** Apply format pattern to raw digits. '#' = digit slot */
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

/** Build E.164 from country dial + raw digits */
function toE164(dial: string, digits: string): string {
  return dial + digits;
}

// ─── Component ───

type Props = {
  /** E.164 value, e.g. "+79001234567" */
  value: string;
  /** Called with E.164 string on every change */
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
  // Try to detect country from current E.164 value
  const detectCountry = useCallback((e164: string): Country => {
    if (!e164) return COUNTRIES[0]; // default RU
    // Sort by dial length desc to match longest first (+380 before +3)
    const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
    for (const c of sorted) {
      if (e164.startsWith(c.dial)) return c;
    }
    return COUNTRIES[0];
  }, []);

  const [country, setCountry] = useState<Country>(() => detectCountry(value));
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Extract local digits from E.164 value
  const localDigits = useMemo(() => {
    if (!value || !value.startsWith(country.dial)) return '';
    return value.slice(country.dial.length);
  }, [value, country.dial]);

  // Formatted display
  const displayValue = useMemo(
    () => applyFormat(localDigits, country.format),
    [localDigits, country.format]
  );

  // Handle digit input
  const handleInput = (raw: string) => {
    const digits = onlyDigits(raw).slice(0, country.maxDigits);
    onChange(toE164(country.dial, digits));
  };

  // Handle country change
  const selectCountry = (c: Country) => {
    setCountry(c);
    setOpen(false);
    setSearch('');
    // Re-emit with new dial code, keep existing digits (trimmed to new max)
    const digits = localDigits.slice(0, c.maxDigits);
    onChange(toE164(c.dial, digits));
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  // Filtered countries
  const filtered = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.trim().toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  // Handle keydown for better UX
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, arrows
    if (['Backspace', 'Delete', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      return;
    }
    // Block non-digit keys
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <div className="flex h-9 w-full rounded-md border border-input bg-transparent shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring">
        {/* Country selector button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 px-2 border-r border-input text-sm shrink-0 hover:bg-muted/50 rounded-l-md transition-colors"
          aria-label="Выбрать страну"
        >
          <span className="text-base leading-none">{country.flag}</span>
          <span className="text-xs text-muted-foreground font-medium">{country.dial}</span>
          <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Phone number input */}
        <input
          type="tel"
          inputMode="numeric"
          className="flex-1 bg-transparent px-3 py-1 text-base md:text-sm placeholder:text-muted-foreground focus-visible:outline-none"
          placeholder={placeholder}
          value={displayValue}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            // Strip formatting, keep only digits
            handleInput(e.target.value);
          }}
          autoComplete="tel-national"
        />
      </div>

      {/* Country dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border bg-white shadow-lg">
          {/* Search */}
          <div className="sticky top-0 bg-white border-b p-2">
            <input
              ref={searchRef}
              type="text"
              className="w-full rounded-md border px-2.5 py-1.5 text-sm outline-none focus:border-blue-400"
              placeholder="Поиск страны..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              Страна не найдена
            </div>
          ) : (
            filtered.map((c) => {
              const isActive = c.code === country.code && c.dial === country.dial;
              return (
                <button
                  key={`${c.code}-${c.dial}`}
                  type="button"
                  onClick={() => selectCountry(c)}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2 text-sm text-left transition-colors',
                    isActive ? 'bg-blue-50 text-blue-900' : 'hover:bg-muted/50'
                  )}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{c.dial}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}