import type { Metadata } from "next";
import Script from "next/script";
import LeadDialog from "./_components/LeadDialog";
import ResultsCarousel from "./_components/ResultsCarousel";
import FaqAccordion from "./_components/FaqAccordion";
import { BadgeCheck, CalendarDays, ShieldCheck, Star, PhoneCall, Plane, Hotel, Stethoscope, Scissors, PackageOpen, MessageCircle } from "lucide-react";
import LeadInlineForm from "./_components/LeadInlineForm";
import LeadModalCta from "./_components/LeadModalCta";
import SectionBadge from "./_components/SectionBadge";
import Reveal from "./_components/motion/Reveal";
import Stagger from "./_components/motion/Stagger";
import SectionCta from "./_components/SectionCta";

const siteUrl = "https://medtravel.me";
const path = "/ru/hair-transplant/lp";
const canonical = `${siteUrl}${path}`;

export const metadata: Metadata = {
  title: "Пересадка волос в Стамбуле FUE/DHI от €1800 — консультация бесплатно | MedTravel",
  description:
    "Пересадка волос FUE/DHI в Стамбуле от €1800 под ключ. Пожизненная гарантия на пересаженные волосы, куратор 24/7, до 6000 графтов за 1 процедуру. Запишитесь на бесплатную консультацию.",
  alternates: { canonical },
  openGraph: {
    type: "website",
    url: canonical,
    title: "Пересадка волос в Стамбуле FUE/DHI — MedTravel",
    description:
      "FUE/DHI от €1800 под ключ. Гарантия результата, сопровождение 24/7. Бесплатная консультация.",
    images: [
      {
        url: `${siteUrl}/og/hair-transplant-lp.jpg`, // если нет — можно позже добавить
        width: 1200,
        height: 630,
        alt: "MedTravel — Пересадка волос в Стамбуле",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Пересадка волос в Стамбуле FUE/DHI — MedTravel",
    description:
      "FUE/DHI от €1800 под ключ. Гарантия результата, сопровождение 24/7. Бесплатная консультация.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const steps = [
  {
    title: "За 15 минут до вылета",
    text: "Пришлите 3 фото головы → Получите расчёт стоимости и количества графтов",
    icon: PhoneCall,
  },
  {
    title: "Прямая связь с клиникой",
    text: "Zoom-консультация с трихологом клиники. Обсуждаете: линию роста волос, зоны пересадки, методику (FUE/DHI), анализы.",
    icon: MessageCircle,
  },
  {
    title: "Вылетаете как на отдых",
    text: "Бронируем даты → За нами все детали вашей поездки",
    icon: Plane,
  },
  {
    title: "Встреча премиум-класса",
    text: "В аэропорту Стамбула вас будет ждать водитель с табличкой. Комфортно доставим вас до отеля",
    icon: CalendarDays,
  },
  {
    title: "Отель в центре Стамбула",
    text: "Комфортабельный отель с заботливым персоналом и удобным расположением. Завтраки включены.",
    icon: Hotel,
  },
  {
    title: "Диагностика мирового уровня",
    text: "День 1: Анализ крови, трихоскопия, замеры зон. Врач покажет, как будет выглядеть результат. Подписываете договор на русском языке",
    icon: Stethoscope,
  },
  {
    title: "Операция без боли",
    text: "День 2: 6-8 часов под местной анестезией (седация по желанию +€150). Метод FUE — без шрамов, без скальпеля. Netflix/музыка во время процедуры",
    icon: Scissors,
  },
  {
    title: "Домашний уход уровня люкс",
    text: "Получаете набор восстановления: премиальные шампуни, аксессуары, препараты и подробные рекомендации.",
    icon: PackageOpen,
  },
  {
    title: "12 месяцев с вами",
    text: "Личный менеджер на связи: контрольные фото, корректировка ухода, онлайн-осмотр врачом при необходимости",
    icon: ShieldCheck,
  },
] as const;

const economyRows = [
  { name: "Предоперационные анализы", value: "8 000 ₽ в РФ" },
  { name: "Трихоскопия", value: "15 000 ₽ в РФ" },
  { name: "Местная анестезия + седация", value: "25 000 ₽ в РФ" },
  { name: "Послеоперационная терапия", value: "18 000 ₽ в РФ" },
  { name: "Набор препаратов восстановления", value: "35 000 ₽ в РФ" },
  { name: "3 контрольных осмотра трихолога в течение года", value: "45 000 ₽ в РФ" },
] as const;

const faq = [
  {
    q: "Это больно?",
    a: `Нет, процедура полностью безболезненна. Работаем под качественной местной анестезией — вы будете чувствовать себя комфортно всё время операции.

Единственный момент дискомфорта — сам укол анестезии, но это буквально пара секунд. Дальше — только спокойствие.`,
  },
  {
    q: "Сколько графтов обычно пересаживают?",
    a: `Всё индивидуально, но в среднем — от 2 500 до 5 000 графтов. Точное количество зависит от зоны облысения, состояния донорской области и желаемой густоты.

На консультации мы рассчитаем именно ваш случай.`,
  },
  {
    q: "Придётся ли бриться наголо?",
    a: `Зависит от метода:
• DHI — бреем только донорскую зону сзади, остальные волосы остаются
• FUE — требуется полное бритьё головы

Обсудим ваши предпочтения и подберём оптимальный вариант.`,
  },
  {
    q: "Сколько это стоит?",
    a: `Мы не работаем по шаблонам — каждый случай уникален. Финальная стоимость формируется после онлайн-консультации с врачом и зависит от метода пересадки и количества графтов. Напишите нам прямо сейчас — и мы рассчитаем цену персонально для вас, без переплат и скрытых доплат.`,
  },
  {
    q: "Вы даёте гарантию?",
    a: `Да, и это не просто слова. Вы получаете официальный гарантийный сертификат, который подтверждает приживаемость графтов и качество результата. Плюс мы остаёмся на связи весь период восстановления — контролируем процесс, отвечаем на вопросы 24/7 и корректируем уход при необходимости.

Ваше спокойствие — наша ответственность.`,
  },
] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((x) => ({
    "@type": "Question",
    name: x.q,
    acceptedAnswer: { "@type": "Answer", text: x.a.replace(/\n/g, "<br/>") },
  })),
};

export default function HairTransplantLP() {
  return (
    <>
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="relative text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1400px_circle_at_12%_8%,rgba(20,184,166,0.16),transparent_55%),radial-gradient(1400px_circle_at_88%_10%,rgba(59,130,246,0.14),transparent_55%),radial-gradient(1200px_circle_at_50%_65%,rgba(99,102,241,0.06),transparent_60%),linear-gradient(to_bottom,rgba(248,250,252,1),rgba(255,255,255,1))]" />
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_20%_10%,rgba(20,184,166,0.18),transparent_50%),radial-gradient(1000px_circle_at_85%_15%,rgba(59,130,246,0.16),transparent_55%),linear-gradient(to_bottom,rgba(248,250,252,1),rgba(255,255,255,1))]" />
          <div className="relative mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:py-16">
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <Reveal>
                  <SectionBadge dot>Пересадка волос в Стамбуле</SectionBadge>
                </Reveal>

                <Reveal delay={80}>
                  <h1 className="mt-4 max-w-2xl text-[26px] font-semibold leading-[1.08] tracking-tight sm:text-5xl sm:leading-[1.05] lg:text-l">
                    Густые волосы как у голливудских звёзд{" "}
                    <span className="whitespace-nowrap">за 4–6 месяцев</span>
                    <br className="hidden sm:block" />
                    <span className="text-slate-900"> с гарантией результата</span>
                  </h1>
                </Reveal>

                <Reveal delay={140}>
                  <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 sm:text-lg">
                    Пересадка волос методом <span className="font-medium text-slate-900">FUE/DHI</span> в Стамбуле от{" "}
                    <span className="font-semibold text-slate-900">€1800</span> под ключ
                  </p>
                </Reveal>

                <Reveal delay={180} className="mt-6 lg:hidden">
                  <LeadInlineForm
                    title="Запишитесь на бесплатную консультацию и расчёт стоимости"
                    primaryCta="Получить консультацию"
                  />
                </Reveal>

                <Stagger className="mt-6 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3" start={180} step={90}>
                  <div className="h-full min-h-[132px] group rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-black/5
transition-all duration-300 ease-out
hover:-translate-y-1 hover:shadow-md hover:shadow-slate-900/10
hover:border-teal-200/70 hover:ring-teal-100">
                    <div className="flex items-start gap-3">
                      <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-teal-700" />
                      <div>
                        <div className="font-semibold">Пожизненная гарантия</div>
                        <div className="mt-1 text-sm leading-relaxed text-slate-600">
                          На пересаженные волосы с официальным контролем результата
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-full min-h-[132px] group rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-black/5
transition-all duration-300 ease-out
hover:-translate-y-1 hover:shadow-md hover:shadow-slate-900/10
hover:border-teal-200/70 hover:ring-teal-100">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="mt-0.5 h-6 w-6 shrink-0 text-teal-700" />
                      <div>
                        <div className="font-semibold">Куратор 24/7 на русском</div>
                        <div className="mt-1 text-sm leading-relaxed text-slate-600">
                          Полная поддержка до, во время и после процедуры
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-full min-h-[132px] group rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-black/5
transition-all duration-300 ease-out
hover:-translate-y-1 hover:shadow-md hover:shadow-slate-900/10
hover:border-teal-200/70 hover:ring-teal-100">
                    <div className="flex items-start gap-3">
                      <Star className="mt-0.5 h-6 w-6 shrink-0 text-teal-700" />
                      <div className="flex-1">
                        <div className="font-semibold">До 6 000 графтов за 1 процедуру</div>
                        <div className="mt-1 text-sm leading-relaxed text-slate-600">
                          Методика FUE или DHI под ваш случай
                        </div>
                      </div>
                    </div>
                  </div>
                </Stagger>

                {/* рейтинг как отдельный акцентный бейдж под карточками */}
                <Reveal delay={480}>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/80 px-4 py-2 text-sm shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)] ring-1 ring-black/5 backdrop-blur">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4" fill="currentColor" />
                      ))}
                    </div>

                    <span className="font-semibold text-slate-900">4,8/5</span>
                    <span className="text-slate-600">по отзывам пациентов</span>
                  </div>
                </Reveal>
              </div>

              {/* right card */}
              <div className="hidden lg:block lg:justify-self-end">
                <Reveal delay={200} className="lg:justify-self-end">
                  <LeadInlineForm
                    title="Запишитесь на бесплатную консультацию и расчёт стоимости"
                    primaryCta="Получить консультацию"
                  />
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* STEPS */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <SectionBadge>9 шагов к результату</SectionBadge>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Ваш путь к новым волосам — от первого касания до идеального результата
              </h2>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-3 text-slate-600">
                Каждый этап продуман до мелочей: от первого звонка до новой прически
              </p>
            </Reveal>
          </div>

          {/* карточки “лестницей” по строкам */}
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" start={180} step={90}>
            {steps.map((x, idx) => {
              const Icon = x.icon;

              // пауза между строками (по 3 карточки в строке на lg)
              const rowPause = Math.floor(idx / 3) * 140;

              return (
                <Reveal key={x.title} delay={180 + idx * 90 + rowPause} className="h-full">
                  <div
                    className="group h-full rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-black/5
            transition-all duration-300 ease-out
            hover:-translate-y-1 hover:shadow-md hover:shadow-slate-900/10
            hover:border-teal-200/70 hover:ring-teal-100"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="rounded-2xl bg-teal-50 p-3 ring-1 ring-teal-100
                transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                      >
                        <Icon className="h-5 w-5 text-teal-700" />
                      </div>

                      <div>
                        <div className="font-semibold text-slate-900">{x.title}</div>
                        <div className="mt-1 text-sm leading-relaxed text-slate-600">{x.text}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </Stagger>

          {/* CTA внутри секции (через одну) */}
          <Reveal delay={240} className="mt-8 flex justify-center">
            <SectionCta
              title="Хотите узнать точную стоимость под ваш случай?"
              subtitle="Оставьте контакты — консультация бесплатно."
              buttonText="Получить бесплатную консультацию"
            />
          </Reveal>
        </section>

        {/* RESULTS */}
        <section className="relative overflow-hidden bg-slate-50/60">
          {/* мягкая подсветка фона как в других секциях */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(20,184,166,0.12),transparent_55%),radial-gradient(900px_circle_at_85%_30%,rgba(59,130,246,0.10),transparent_55%)]" />

          <div className="mx-auto max-w-7xl px-4 py-12 sm:py-14">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <SectionBadge>Реальные результаты</SectionBadge>
              </Reveal>

              <Reveal delay={80}>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Посмотрите, чего достигли наши пациенты
                </h2>
              </Reveal>

              <Reveal delay={140}>
                <p className="mt-3 text-slate-600">
                  До/после — реальные фото пациентов. Результаты индивидуальны и зависят от исходных данных.
                </p>
              </Reveal>
            </div>

            <Reveal delay={200} className="mt-8">
              {/* “дорогой” контейнер под карусель */}
              <div className="group relative overflow-hidden rounded-3xl border bg-white/70 p-3 shadow-[0_22px_70px_-45px_rgba(15,23,42,0.55)] ring-1 ring-black/5 backdrop-blur">
                {/* внутренняя подсветка */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 bg-[radial-gradient(700px_circle_at_30%_20%,rgba(20,184,166,0.14),transparent_55%),radial-gradient(700px_circle_at_85%_35%,rgba(59,130,246,0.12),transparent_55%)]" />

                <div className="relative">
                  <ResultsCarousel
                    images={[
                      "/lp/hair-transplant/results/01.jpg",
                      "/lp/hair-transplant/results/02.jpg",
                      "/lp/hair-transplant/results/03.jpg",
                      "/lp/hair-transplant/results/04.jpg",
                      "/lp/hair-transplant/results/05.jpg",
                      "/lp/hair-transplant/results/07.jpg",
                      "/lp/hair-transplant/results/08.jpg",
                    ]}
                  />
                </div>
              </div>
            </Reveal>

            {/* маленький нейтральный дисклеймер под каруселью */}
            <Reveal delay={260}>
              <div className="mx-auto mt-4 max-w-3xl text-center text-xs text-slate-500">
                *Фото предоставлены пациентами. Использование материалов без согласия запрещено.
              </div>
            </Reveal>
          </div>
        </section>

        {/* ECONOMY */}
        <section className="relative mx-auto max-w-7xl px-4 py-12 sm:py-14">

          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <SectionBadge>Выгодное предложение</SectionBadge>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Экономия 180 000₽ vs пересадка в Москве
              </h2>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-3 text-slate-600">
                Всё включено в пакет — не надо искать и оплачивать отдельно:
              </p>
            </Reveal>
          </div>

          <Reveal delay={200} className="mt-8">
            <div className="overflow-hidden rounded-3xl border bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] ring-1 ring-black/5">
              <div className="p-5 sm:p-8">
                {/* “таблица” */}
                <div className="rounded-2xl border bg-slate-50/60 p-3 sm:p-4">
                  <div className="grid gap-2">
                    {economyRows.map((r, idx) => (
                      <Reveal key={r.name} delay={240 + idx * 90}>
                        <div
                          className="group flex flex-col items-start gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5
                          sm:flex-row sm:items-center sm:justify-between sm:gap-4
                          transition-all duration-300 ease-out
                          hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/10
                          hover:border-teal-200/70 hover:ring-teal-100"
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-2.5 w-2.5 rounded-full bg-teal-500 shadow-[0_0_0_4px_rgba(20,184,166,0.10)]" />
                            <div className="text-sm font-medium text-slate-800">{r.name}</div>
                          </div>

                          <div className="shrink-0 self-end whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-black/5 sm:self-auto sm:text-sm">
                            {r.value}
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>

                {/* итог — заметный акцент */}
                <Reveal delay={240 + economyRows.length * 90 + 80}>
                  <div className="mt-7">
                    <div className="relative overflow-hidden rounded-3xl border border-emerald-200/70 bg-white/70 p-6 shadow-[0_26px_80px_-60px_rgba(16,185,129,0.55)] ring-1 ring-emerald-100 backdrop-blur sm:p-8">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(16,185,129,0.18),transparent_55%),radial-gradient(900px_circle_at_90%_20%,rgba(20,184,166,0.14),transparent_55%)]" />

                      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-800/90">
                            Итоговая экономия
                          </div>

                          <div className="mt-2 text-base font-semibold leading-tight text-slate-900 sm:text-lg">
                            Вы экономите минимум{" "}
                            <span className="inline-flex items-center rounded-2xl bg-emerald-600 px-3 py-1 text-white shadow-[0_16px_40px_-25px_rgba(16,185,129,0.75)]">
                              180 000₽
                            </span>{" "}
                            делая всё это под ключ в Турции
                          </div>

                          <div className="mt-2 text-sm text-slate-600">
                            Анализы, диагностика, препараты и наблюдение — включены.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </Reveal>

          {/* CTA внутри секции (через одну) — “дороже” */}
          <Reveal delay={240 + economyRows.length * 90 + 220} className="mt-8 flex justify-center">
            <SectionCta
              title="Рассчитать цену и количество графтов"
              subtitle="Пришлите 3 фото — расчёт обычно занимает до 15 минут."
              buttonText="Получить расчёт бесплатно"
              buttonVariant="default"
            />
          </Reveal>
        </section>

        {/* OFFICIAL */}
        <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_15%_20%,rgba(20,184,166,0.10),transparent_55%),radial-gradient(900px_circle_at_90%_15%,rgba(59,130,246,0.10),transparent_55%)]" />
          <div className="mx-auto max-w-7xl px-4 py-12 sm:py-14">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <SectionBadge>Официальная работа</SectionBadge>
              </Reveal>

              <Reveal delay={80}>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Работаем открыто и официально
                </h2>
              </Reveal>

              <Reveal delay={140}>
                <p className="mt-3 text-slate-600">Почему это важно для вас?</p>
              </Reveal>
            </div>

            <Stagger className="mt-8 grid gap-4 lg:grid-cols-3" start={200} step={90}>
              {/* card 1 */}
              <Reveal delay={200} className="h-full">
                <div
                  className="group h-full rounded-3xl border bg-white p-6 shadow-sm ring-1 ring-black/5
          transition-all duration-300 ease-out
          hover:-translate-y-1 hover:shadow-md hover:shadow-slate-900/10
          hover:border-teal-200/70 hover:ring-teal-100"
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 ring-1 ring-teal-100">
                    Medtravel.me
                  </div>

                  <div className="mt-4 text-sm font-semibold text-slate-900">
                    Medtravel.me — это платформа медицинского туризма
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Medtravel.me — это платформа медицинского туризма с проверенной сетью партнёров по всему миру.
                    По услуге пересадки волос в Турции мы работаем с ведущей клиникой-партнером, которая специализируется
                    на трансплантации волос и имеет все необходимые лицензии и сертификаты.
                  </p>
                </div>
              </Reveal>

              {/* card 2 */}
              <Reveal delay={290} className="h-full">
                <div
                  className="group h-full rounded-3xl border bg-white p-6 shadow-sm ring-1 ring-black/5
          transition-all duration-300 ease-out
          hover:-translate-y-1 hover:shadow-md hover:shadow-slate-900/10
          hover:border-teal-200/70 hover:ring-teal-100"
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    Процесс
                  </div>

                  <div className="mt-4 text-sm font-semibold text-slate-900">Как это работает?</div>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Вы обращаетесь к нам — мы организуем вашу поездку и передаём вас в руки нашего проверенного партнёра
                    с безупречной репутацией. Лечение проходит в их клинике, а мы обеспечиваем полное сопровождение,
                    трансфер, размещение и поддержку на каждом этапе.
                  </p>
                </div>
              </Reveal>

              {/* card 3 */}
              <Reveal delay={380} className="h-full">
                <div
                  className="group h-full rounded-3xl border bg-white p-6 shadow-sm ring-1 ring-black/5
          transition-all duration-300 ease-out
          hover:-translate-y-1 hover:shadow-md hover:shadow-slate-900/10
          hover:border-teal-200/70 hover:ring-teal-100"
                >
                  <div className="flex items-center gap-2">
                    <div className="rounded-2xl bg-teal-50 p-3 ring-1 ring-teal-100">
                      <ShieldCheck className="h-5 w-5 text-teal-700" />
                    </div>
                    <div className="text-sm font-semibold text-slate-900">Ваши гарантии безопасности</div>
                  </div>

                  <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    {[
                      {
                        t: "Лицензированные клиники",
                        d: "наши партнёры работают легально, имеют официальный сертификат на медицинский туризм",
                      },
                      {
                        t: "Прозрачное сотрудничество",
                        d: "мы тщательно отбираем медицинские учреждения по критериям качества",
                      },
                      {
                        t: "Официальные документы",
                        d: "вы получаете полный пакет медицинской документации и гарантийный сертификат",
                      },
                      {
                        t: "Наша ответственность",
                        d: "мы координируем весь процесс от первой консультации до завершения восстановления",
                      },
                    ].map((x) => (
                      <li key={x.t} className="flex gap-3">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-600 shadow-[0_0_0_4px_rgba(20,184,166,0.10)]" />
                        <span>
                          <b className="text-slate-800">{x.t}</b> — {x.d}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </Stagger>

            {/* CTA внутри секции (через одну) */}
            <Reveal delay={520} className="mt-8 flex justify-center">
              <SectionCta
                title="Хотите убедиться в документах и гарантиях перед поездкой?"
                subtitle="Подскажем по этапам, договору и подготовке — консультация бесплатная."
                buttonText="Задать вопрос менеджеру"
              />
            </Reveal>
          </div>
        </section>

        {/* CERTS */}
        <section className="relative mx-auto max-w-7xl px-4 py-12 sm:py-14">

          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <SectionBadge>Наши лицензии</SectionBadge>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Официальные сертификаты и лицензии
              </h2>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-3 text-slate-600">Полная прозрачность и соответствие стандартам</p>
            </Reveal>
          </div>

          <Reveal delay={220} className="mt-8 flex justify-center">
            <div className="group relative w-full max-w-4xl overflow-hidden rounded-3xl border bg-white/70 p-3 shadow-[0_22px_70px_-45px_rgba(15,23,42,0.55)] ring-1 ring-black/5 backdrop-blur">

              <div className="relative overflow-hidden rounded-2xl border bg-white ring-1 ring-black/5">
                <div className="aspect-[16/9] bg-slate-100">
                  <img
                    src="https://esteinturkey.com/ru/wp-content/uploads/2025/09/WhatsApp-Image-2025-09-30-at-13.11.22.jpeg"
                    alt="Международный сертификат медицинского туризма"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-col items-center gap-2 border-t bg-white px-4 py-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Международный сертификат медицинского туризма</div>
                  </div>

                  <div className="inline-flex w-fit items-center justify-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    Проверенный партнёр
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* CTA внутри секции (через одну) */}
          <Reveal delay={340} className="mt-8 flex justify-center">
            <SectionCta
              title="Хотите пройти всё официально и безопасно?"
              subtitle="Подскажем по документам, этапам и подготовке — консультация бесплатная."
              buttonText="Записаться на консультацию"
            />
          </Reveal>
        </section>

        {/* WHY TURKEY */}
        <section className="relative overflow-hidden bg-slate-50/60">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(20,184,166,0.10),transparent_55%),radial-gradient(900px_circle_at_85%_30%,rgba(59,130,246,0.08),transparent_55%)]" />

          <div className="mx-auto max-w-7xl px-4 py-12 sm:py-14">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <SectionBadge>Мировой лидер</SectionBadge>
              </Reveal>

              <Reveal delay={80}>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Почему наши пациенты выбирают Турцию
                </h2>
              </Reveal>

              <Reveal delay={140}>
                <p className="mt-3 text-slate-600">Европейское качество по доступной цене</p>
              </Reveal>
            </div>

            <Stagger className="mt-8 grid gap-4 lg:grid-cols-3" start={200} step={90}>
              {[
                {
                  title: "300 000+ операций ежегодно",
                  desc: "Стамбул лидирует в мире по пересадке волос",
                  icon: BadgeCheck,
                },
                {
                  title: "Международные стандарты качества",
                  desc: "Аккредитация JCI, ISO 9001, лицензии Минздрава Турции",
                  icon: ShieldCheck,
                },
                {
                  title: "Передовые технологии",
                  desc: "Методы FUE/DHI, микромоторы для безшовной экстракции",
                  icon: Scissors,
                },
              ].map((x, i) => {
                const Icon = x.icon;

                return (
                  <Reveal key={x.title} delay={200 + i * 90} className="h-full">
                    <div
                      className="group h-full rounded-3xl border bg-white p-6 shadow-sm ring-1 ring-black/5
              transition-all duration-300 ease-out
              hover:-translate-y-1 hover:shadow-md hover:shadow-slate-900/10
              hover:border-teal-200/70 hover:ring-teal-100"
                    >
                      <div className="inline-flex rounded-2xl bg-teal-50 p-3 ring-1 ring-teal-100 transition-transform duration-300 ease-out group-hover:scale-[1.03]">
                        <Icon className="h-5 w-5 text-teal-700" />
                      </div>

                      <div className="mt-4 font-semibold text-slate-900">{x.title}</div>
                      <div className="mt-2 text-sm leading-relaxed text-slate-600">{x.desc}</div>
                    </div>
                  </Reveal>
                );
              })}
            </Stagger>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative mx-auto max-w-7xl px-4 py-12 sm:py-14">

          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <SectionBadge>Частые вопросы</SectionBadge>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Вопросы, которые вы хотели задать
              </h2>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-3 text-slate-600">
                Честные ответы без воды — всё, что важно знать перед процедурой
              </p>
            </Reveal>
          </div>

          <Reveal delay={220} className="mx-auto mt-8 max-w-3xl">
            <div className="overflow-hidden rounded-3xl border bg-white/70 p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.50)] ring-1 ring-black/5 backdrop-blur">
              <div className="rounded-2xl border bg-white p-3 sm:p-4">
                <FaqAccordion items={faq} />
              </div>

              <div className="px-3 pb-2 pt-3 text-center text-xs text-slate-500 sm:px-4">
                Если останутся вопросы — просто напишите, всё объясним по шагам.
              </div>
            </div>
          </Reveal>
        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_20%_10%,rgba(20,184,166,0.16),transparent_50%),radial-gradient(1000px_circle_at_85%_25%,rgba(59,130,246,0.14),transparent_55%),linear-gradient(to_bottom,rgba(255,255,255,1),rgba(248,250,252,1))]" />

          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-14">
            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <Reveal>
                  <SectionBadge>Начните сегодня</SectionBadge>
                </Reveal>

                <Reveal delay={80}>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Начните путь к густым волосам прямо сейчас
                  </h2>
                </Reveal>

                <Reveal delay={140}>
                  <p className="mt-3 max-w-2xl text-slate-600">
                    Пришлите 3 фото (спереди, сверху, сбоку) — получите расчёт стоимости и план операции за 15 минут
                  </p>
                </Reveal>
              </div>

              <div className="lg:justify-self-end">
                <Reveal delay={220}>
                  <LeadInlineForm
                    title="Запишитесь на бесплатную консультацию и расчёт стоимости"
                    primaryCta="Получить консультацию"
                  />
                </Reveal>
              </div>
            </div>

            <Reveal delay={320}>
              <div className="mt-10 border-t pt-6 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} MedTravel. Информация на странице носит ознакомительный характер.
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
