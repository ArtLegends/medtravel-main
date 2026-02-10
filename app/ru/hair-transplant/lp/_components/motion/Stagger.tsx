"use client";

import React from "react";
import Reveal from "./Reveal";

type Props = {
  children: React.ReactNode;
  className?: string;
  step?: number;
  start?: number;
  itemClassName?: string;
};

export default function Stagger({
  children,
  className = "",
  step = 90,
  start = 0,
  itemClassName = "h-full",
}: Props) {
  const items = React.Children.toArray(children);

  return (
    <div className={className}>
      {items.map((child, idx) => (
        <Reveal key={idx} delay={start + idx * step} className={itemClassName}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}