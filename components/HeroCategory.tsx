// components/HeroCategory.tsx
"use client";

import React from "react";

interface Props {
  title: string;
  buttonLabel: string;
  buttonHref: string;
  backgroundUrl: string;
}

export default function HeroCategory({
  title,
  buttonLabel,
  buttonHref,
  backgroundUrl,
}: Props) {
  return (
    <section
      className="bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <div className="container mx-auto px-6 py-20 lg:py-32">
        <h1 className="text-4xl lg:text-5xl font-bold text-black max-w-3xl leading-tight mb-6">
          {title}
        </h1>
        <a
          href={buttonHref}
          className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-md transition"
        >
          {buttonLabel}
        </a>
      </div>
    </section>
  );
}
