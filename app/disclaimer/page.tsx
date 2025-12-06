// app/disclaimer/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Important information about using our services',
  alternates: { canonical: '/disclaimer' },
};

export default function DisclaimerPage() {
  const BG =
    'https://images.unsplash.com/photo-1580281657527-47d8b89cffe0?auto=format&fit=crop&w=1600&q=80';

  return (
    <main className="relative min-h-[70vh]">
      {/* фон */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url('${BG}')` }}
      />
      <div className="absolute inset-0 -z-10 bg-black/30 dark:bg-black/50" />

      <section className="container mx-auto px-4 py-16 md:py-20">
        {/* header */}
        <header className="mb-8 text-center md:mb-10">
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            Disclaimer
          </h1>
          <p className="mt-3 text-lg text-white/90">
            Important information about using our services
          </p>
        </header>

        {/* текст */}
        <article className="mx-auto max-w-3xl space-y-6 rounded-2xl bg-content1 p-6 leading-relaxed text-foreground shadow-xl ring-1 ring-divider md:p-8">
          <section>
            <h2 className="mb-2 text-base font-semibold">
              No medical advice or treatment
            </h2>
            <p className="text-sm md:text-[15px]">
              MEDTRAVEL.ME does not provide healthcare services, medical advice,
              diagnosis, or treatment. The information available on our website
              is for informational purposes only and should not be considered a
              substitute for professional medical advice. Always consult with a
              qualified healthcare provider regarding any medical questions or
              decisions.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">
              Third-party healthcare providers
            </h2>
            <p className="text-sm md:text-[15px]">
              The website serves as a platform where healthcare providers can
              offer their services for purchase, but we do not screen, verify,
              or endorse any content shared by these providers. If you choose to
              engage with a healthcare provider through the website, you do so
              at your own risk. We strongly recommend that you conduct your own
              research and consult your personal doctor or healthcare provider
              before making any decisions.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold">
              Rankings, prices and availability
            </h2>
            <p className="text-sm md:text-[15px]">
              Search results on the website should not be viewed as endorsements
              or rankings of any specific healthcare provider. The prices
              displayed on the website are for general reference only and should
              not be considered final. Always check with your treatment provider
              for an accurate estimate of costs and up-to-date information about
              services.
            </p>
          </section>
        </article>
      </section>
    </main>
  );
}
