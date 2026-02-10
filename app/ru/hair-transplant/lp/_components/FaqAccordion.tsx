"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FaqAccordion({
  items,
}: {
  items: readonly { q: string; a: string }[];
}) {
  return (
    <Accordion type="single" collapsible className="space-y-3">
      {items.map((x, i) => (
        <AccordionItem
          key={x.q}
          value={`item-${i}`}
          className="rounded-2xl border bg-white px-4"
        >
          <AccordionTrigger className="text-left text-sm font-semibold text-slate-900">
            {x.q}
          </AccordionTrigger>
          <AccordionContent className="overflow-hidden whitespace-pre-line text-sm leading-relaxed text-slate-600 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            {x.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
