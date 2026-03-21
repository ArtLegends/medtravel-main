// components/SectionNav.tsx
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

type Section = { id: string; label: string };

export default function SectionNav({ sections }: { sections: Section[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, sections]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -150 : 150, behavior: 'smooth' });
  };

  return (
    <nav aria-label="Clinic sections" className="relative">
      {/* Left fade + arrow */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 flex items-center pl-1 pr-3 bg-gradient-to-r from-white via-white/90 to-transparent rounded-l-xl"
          aria-label="Scroll left"
        >
          <span className="text-gray-400 text-sm">‹</span>
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto overflow-y-hidden whitespace-nowrap rounded-xl border bg-white px-2 py-2 shadow-sm"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as any}
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

      {/* Right fade + arrow */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 flex items-center pr-1 pl-3 bg-gradient-to-l from-white via-white/90 to-transparent rounded-r-xl"
          aria-label="Scroll right"
        >
          <span className="text-gray-400 text-sm">›</span>
        </button>
      )}
    </nav>
  );
}