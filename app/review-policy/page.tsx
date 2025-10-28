// app/review-policy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Policy",
  description: "How reviews are collected, displayed, and moderated on MedTravel.",
  alternates: { canonical: "/review-policy" },
};

const BG =
  "https://images.unsplash.com/photo-1580281657527-47d8b89cffe0?auto=format&fit=crop&w=1600&q=80";

export default function ReviewPolicyPage() {
  return (
    <main className="relative min-h-[70vh]">
      <div aria-hidden className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url('${BG}')` }} />
      <div className="absolute inset-0 -z-10 bg-black/30 dark:bg-black/50" />
      <section className="container mx-auto px-4 py-16 md:py-20">
        <header className="text-center mb-8 md:mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Review Policy</h1>
          <p className="mt-3 text-white/90 text-lg">How reviews are collected, displayed, and moderated</p>
        </header>

        <article className="mx-auto max-w-3xl rounded-2xl bg-content1 text-foreground shadow-xl ring-1 ring-divider p-6 md:p-8 space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Submitting reviews</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Reviews should be based on your personal experience and be accurate, relevant, and respectful.</li>
              <li>We prohibit offensive language, hate speech, personal data disclosure, or promotional content.</li>
              <li>We may require proof of interaction with a provider to validate a review.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Moderation</h2>
            <p>
              Reviews may be checked for compliance with these rules. We reserve the right to edit for clarity (without
              altering meaning), decline, or remove reviews that violate the policy or applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Display & sorting</h2>
            <p>
              Reviews are shown chronologically or by relevance. Star ratings and textual feedback reflect the opinion
              of individual authors and do not represent MedTravel’s endorsement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Conflicts & reporting</h2>
            <p>
              If you believe a review violates this policy, please report it via our contact form. We will investigate
              and take appropriate action.
            </p>
          </section>

          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </article>
      </section>
    </main>
  );
}
