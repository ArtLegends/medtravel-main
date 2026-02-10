"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  y?: number;
  amount?: number;
  margin?: string;
  once?: boolean;
  delay?: number;
};

export default function Reveal({
  children,
  className = "",
  y = 14,
  amount = 0.18,
  margin = "0px 0px -10% 0px",
  once = true,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setInView(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: amount, rootMargin: margin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [amount, margin, once]);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: delay ? `${delay}ms` : undefined,
        transform: inView ? "translateY(0px)" : `translateY(${y}px)`,
      }}
      className={[
        "motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out",
        "motion-reduce:transition-none motion-reduce:transform-none",
        inView ? "opacity-100" : "opacity-0",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}