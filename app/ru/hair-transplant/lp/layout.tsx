import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Пересадка волос в Стамбуле от €1800 под ключ | MedTravel",
  description:
    "Пересадка волос FUE/DHI в Стамбуле от €1800 под ключ. Бесплатная консультация, персональный расчет, гарантия результата, сопровождение 24/7.",
  alternates: {
    canonical: "/ru/hair-transplant/lp",
  },
  openGraph: {
    title: "Пересадка волос в Стамбуле от €1800 под ключ | MedTravel",
    description:
      "FUE/DHI, гарантия результата, сопровождение 24/7, расчет стоимости за 15 минут.",
    url: "/ru/hair-transplant/lp",
    locale: "ru_RU",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        {children}
      </body>
    </html>
  );
}
