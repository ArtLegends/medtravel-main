// app/disclaimer/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Important information about using our services",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  const BG =
    "https://images.unsplash.com/photo-1580281657527-47d8b89cffe0?auto=format&fit=crop&w=1600&q=80";

  return (
    <main className="relative min-h-[70vh]">
      {/* фон-изображение + лёгкий затемняющий слой */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url('${BG}')` }}
      />
      <div className="absolute inset-0 -z-10 bg-black/30 dark:bg-black/50" />

      <section className="container mx-auto px-4 py-16 md:py-20">
        {/* header */}
        <header className="text-center mb-8 md:mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Disclaimer
          </h1>
          <p className="mt-3 text-white/90 text-lg">
            Important information about using our services
          </p>
        </header>

        {/* карточка с текстом */}
        <article className="mx-auto max-w-3xl rounded-2xl bg-content1 text-foreground shadow-xl ring-1 ring-divider p-6 md:p-8 leading-relaxed space-y-6">
          <p>
            MEDTRAVEL.ME does not provide healthcare services, medical advice,
            diagnosis, or treatment. The information available on our website is
            for informational purposes only and should not be considered as a
            substitute for professional medical advice. The website serves as a
            platform where healthcare providers can offer their services for
            purchase, but we do not screen, verify, or endorse any content
            shared by these providers.
          </p>

          <p>
            Should you choose to engage with a healthcare provider through the
            website, you do so at your own risk. We strongly recommend that you
            conduct thorough research into any healthcare provider listed here
            and consult with your personal doctor or healthcare provider before
            making any decisions. Please note that search results on the website
            should not be viewed as endorsements or rankings of any specific
            healthcare provider.
          </p>

          <p>
            The prices displayed on the website are for general reference only
            and should not be considered final. Always check with your treatment
            provider for an accurate estimate of costs.
          </p>
        </article>
      </section>
    </main>
  );
}
