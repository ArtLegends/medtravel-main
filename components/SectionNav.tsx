'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

type Item = { id: string; label: string };
type Props = { sections?: Item[] };

export default function SectionNav({ sections = [] }: Props) {
  const items = sections;
  const [active, setActive] = useState<string>(items[0]?.id ?? '');
  const observers = useRef<IntersectionObserver | null>(null);
  if (!items.length) return null;

  const ids = useMemo(() => items.map((i) => i.id), [items]);

  useEffect(() => {
    observers.current?.disconnect();
    if (!ids.length) return;

    observers.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('id')!;
          if (entry.isIntersecting) setActive(id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observers.current?.observe(el);
    });

    return () => observers.current?.disconnect();
  }, [ids]);

  return (
    <nav className="mb-2">
      <ul className="flex flex-wrap gap-2 overflow-x-auto">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={`px-3 py-2 rounded-md text-sm ${
                active === it.id ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
