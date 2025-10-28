// app/privacy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MedTravel collects, uses and protects your data.",
  alternates: { canonical: "/privacy" },
};

const BG =
  "https://images.unsplash.com/photo-1580281657527-47d8b89cffe0?auto=format&fit=crop&w=1600&q=80";

export default function PrivacyPage() {
  return (
    <main className="relative min-h-[70vh]">
      <div aria-hidden className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url('${BG}')` }} />
      <div className="absolute inset-0 -z-10 bg-black/30 dark:bg-black/50" />
      <section className="container mx-auto px-4 py-16 md:py-20">
        <header className="text-center mb-8 md:mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Privacy Policy</h1>
          <p className="mt-3 text-white/90 text-lg">How we collect, use, and protect your personal data</p>
        </header>

        <article className="mx-auto max-w-3xl rounded-2xl bg-content1 text-foreground shadow-xl ring-1 ring-divider p-6 md:p-8 space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Data we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Contact details you submit in forms (name, email/phone), and messages you send us.</li>
              <li>Technical data (device, browser, IP), cookies and analytics to improve the service.</li>
              <li>Booking or inquiry details necessary to process your request.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. How we use data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To operate the website, respond to requests, and connect you with providers.</li>
              <li>To improve our products, prevent fraud, and comply with legal obligations.</li>
              <li>With your consent — to send service updates or marketing communications.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Sharing & retention</h2>
            <p>
              We may share necessary details with healthcare providers to process your request. We retain data only as
              long as needed for the purposes above or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Your rights</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access, correction, deletion, restriction of processing where applicable.</li>
              <li>Withdraw consent for communications at any time.</li>
              <li>Contact us to exercise your rights via the form on the website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Cookies</h2>
            <p>
              We use cookies and similar technologies for essential functionality and analytics. You can manage cookies
              in your browser settings.
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
