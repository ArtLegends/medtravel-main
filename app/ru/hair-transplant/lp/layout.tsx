import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Пересадка волос в Стамбуле от €1800 под ключ | MedTravel",
  description:
    "Пересадка волос FUE/DHI в Стамбуле от €1800 под ключ. Бесплатная консультация, персональный расчет, гарантия результата, сопровождение 24/7.",
  alternates: { canonical: "/ru/hair-transplant/lp" },
  openGraph: {
    title: "Пересадка волос в Стамбуле от €1800 под ключ | MedTravel",
    description:
      "FUE/DHI, гарантия результата, сопровождение 24/7, расчет стоимости за 15 минут.",
    url: "/ru/hair-transplant/lp",
    locale: "ru_RU",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {/* Yandex.Metrika counter */}
        <Script
          id="yandex-metrika"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j=0; j<document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
  k=e.createElement(t), a=e.getElementsByTagName(t)[0], k.async=1, k.src=r, a.parentNode.insertBefore(k,a);
})(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=106694543', 'ym');

ym(106694543, 'init', {
  ssr:true,
  webvisor:true,
  clickmap:true,
  ecommerce:"dataLayer",
  referrer: document.referrer,
  url: location.href,
  accurateTrackBounce:true,
  trackLinks:true
});
            `,
          }}
        />
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/106694543"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
        {/* /Yandex.Metrika counter */}

        {children}
      </body>
    </html>
  );
}