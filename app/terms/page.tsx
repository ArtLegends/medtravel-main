// app/terms/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Rules for using MedTravel website and services.",
  alternates: { canonical: "/terms" },
};

const BG =
  "https://images.unsplash.com/photo-1580281657527-47d8b89cffe0?auto=format&fit=crop&w=1600&q=80";

export default function TermsPage() {
  return (
    <main className="relative min-h-[70vh]">
      <div aria-hidden className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url('${BG}')` }} />
      <div className="absolute inset-0 -z-10 bg-black/30 dark:bg-black/50" />
      <section className="container mx-auto px-4 py-16 md:py-20">
        <header className="text-center mb-8 md:mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Terms of Use</h1>
          <p className="mt-3 text-white/90 text-lg">Rules for using MedTravel website and services</p>
        </header>

        <article className="mx-auto max-w-3xl rounded-2xl bg-content1 text-foreground shadow-xl ring-1 ring-divider p-6 md:p-8 space-y-6 leading-relaxed">
          <p>
            By accessing and using <strong>MEDTRAVEL.ME</strong>, you agree to these Terms of Use. If you do not agree,
            please do not use the website.
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-2">1. Service nature</h2>
            <p>
              MedTravel is an informational platform where healthcare providers may present and promote their services.
              We do not deliver healthcare, and content on the site is provided by third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. User responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate information when submitting forms and requests.</li>
              <li>Use the website in accordance with applicable laws and regulations.</li>
              <li>Perform your own due diligence before engaging with any provider.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Content and intellectual property</h2>
            <p>
              All trademarks, logos, and content on the website are owned by MedTravel or respective rights holders and
              may not be copied, modified, or distributed without permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Limitation of liability</h2>
            <p>
              MedTravel is not responsible for decisions made based on the website’s information, for the quality of
              third-party services, or for any direct/indirect damages arising from the use of the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Changes to the Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the site after changes means you accept the
              updated Terms.
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
