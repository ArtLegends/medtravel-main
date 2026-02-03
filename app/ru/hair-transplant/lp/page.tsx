import type { Metadata } from "next";
import Script from "next/script";
import LeadDialog from "./_components/LeadDialog";
import ResultsCarousel from "./_components/ResultsCarousel";
import FaqAccordion from "./_components/FaqAccordion";
import { BadgeCheck, CalendarDays, ShieldCheck, Star, PhoneCall, Plane, Hotel, Stethoscope, Scissors, PackageOpen, MessageCircle } from "lucide-react";
import LeadInlineForm from "./_components/LeadInlineForm";
import LeadModalCta from "./_components/LeadModalCta";

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
    text: "Личный менеджер на связи в Telegram: контрольные фото, корректировка ухода, онлайн-осмотр врачом при необходимости",
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

      <main className="bg-white text-slate-900">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_20%_10%,rgba(20,184,166,0.18),transparent_50%),radial-gradient(1000px_circle_at_85%_15%,rgba(59,130,246,0.16),transparent_55%),linear-gradient(to_bottom,rgba(248,250,252,1),rgba(255,255,255,1))]" />
          <div className="relative mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:py-16">
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs text-slate-700 shadow-sm backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-teal-500" />
                  Пересадка волос в Стамбуле
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  Густые волосы как у голливудских звёзд за 4-6 месяцев{" "}
                    с гарантией результата
                </h1>

                <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
                  Пересадка волос методом FUE/DHI в Стамбуле от{" "}
                  <span className="font-semibold text-slate-900">€1800</span> под ключ
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur">
                    <div className="flex items-start gap-3">
                      <BadgeCheck className="mt-0.5 h-5 w-5 text-teal-600" />
                      <div>
                        <div className="font-medium">Пожизненная гарантия</div>
                        <div className="text-sm text-slate-600">
                          На пересаженные волосы — официальный подход и контроль результата
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="mt-0.5 h-5 w-5 text-teal-600" />
                      <div>
                        <div className="font-medium">Куратор 24/7 на русском</div>
                        <div className="text-sm text-slate-600">
                          Поддержка по всем вопросам — до, во время и после поездки
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur sm:col-span-2">
                    <div className="flex items-start gap-3">
                      <Star className="mt-0.5 h-5 w-5 text-teal-600" />
                      <div className="flex-1">
                        <div className="font-medium">До 6 000 графтов за 1 процедуру</div>
                        <div className="text-sm text-slate-600">
                          Подбираем методику под ваш кейс — FUE или DHI
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                        <span className="font-semibold text-slate-900">4,8/5</span>
                        <span className="text-slate-600">по отзывам пациентов</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm sm:hidden">
                      <span className="font-semibold text-slate-900">4,8/5</span>
                      <span className="text-slate-600">по отзывам пациентов</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* right card */}
              <div className="lg:justify-self-end">
                <LeadInlineForm
                  title="Запишитесь на бесплатную консультацию и расчёт стоимости"
                  primaryCta="Получить консультацию"
                />
              </div>
            </div>
          </div>
        </section>

        {/* STEPS */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex rounded-full border bg-slate-50 px-3 py-1 text-xs text-slate-700">
              9 шагов к результату
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Ваш путь к новым волосам — от первого касания до идеального результата
            </h2>
            <p className="mt-3 text-slate-600">
              Каждый этап продуман до мелочей: от первого звонка до новой прически
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((x) => {
              const Icon = x.icon;
              return (
                <div
                  key={x.title}
                  className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-teal-50 p-3 ring-1 ring-teal-100">
                      <Icon className="h-5 w-5 text-teal-700" />
                    </div>
                    <div>
                      <div className="font-semibold">{x.title}</div>
                      <div className="mt-1 text-sm leading-relaxed text-slate-600">{x.text}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA внутри секции (через одну) */}
          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-3xl rounded-3xl border bg-slate-50 p-5 text-center shadow-sm sm:p-6">
              <div className="text-sm font-semibold text-slate-900 sm:text-base">
                Хотите узнать точную стоимость под ваш случай?
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Оставьте контакты — консультация бесплатно.
              </div>

              <div className="mt-4 flex justify-center">
                <LeadModalCta
                  buttonText="Получить бесплатную консультацию"
                  className="w-full sm:w-auto"
                />
              </div>
            </div>
          </div>

        </section>

        {/* RESULTS */}
        <section className="bg-slate-50/60">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:py-14">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex rounded-full border bg-white px-3 py-1 text-xs text-slate-700">
                Реальные результаты
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Посмотрите, чего достигли наши пациенты
              </h2>
              <p className="mt-3 text-slate-600">
                Сотни пациентов уже вернули себе здоровье
              </p>
            </div>

            <div className="mt-8">
              <ResultsCarousel
                images={[
                  "https://esteinturkey.com/wp-content/uploads/2023/09/hair-transplant-before-after.jpg",
                  "https://esteinturkey.com/wp-content/uploads/2023/09/hair-transplant-before-after-2.jpg",
                  "https://esteinturkey.com/wp-content/uploads/2023/04/3-5.jpg",
                  "https://esteinturkey.com/wp-content/uploads/2023/04/4-3.jpg",
                  "https://esteinturkey.com/wp-content/uploads/2023/04/28.jpg",
                  "https://esteinturkey.com/wp-content/uploads/2023/09/hair-transplant-before-after-1.jpg",
                  "https://esteinturkey.com/wp-content/uploads/2023/04/77.jpg",
                  "https://esteinturkey.com/wp-content/uploads/2023/04/78.jpg",
                ]}
              />
            </div>
          </div>
        </section>

        {/* ECONOMY */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex rounded-full border bg-slate-50 px-3 py-1 text-xs text-slate-700">
              Выгодное предложение
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Экономия 180 000₽ vs пересадка в Москве
            </h2>
            <p className="mt-3 text-slate-600">
              Всё включено в пакет — не надо искать и оплачивать отдельно:
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border bg-white shadow-sm">
            <div className="p-6 sm:p-8">
              <div className="grid gap-3">
                {economyRows.map((r) => (
                  <div key={r.name} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="text-sm font-medium text-slate-800">{r.name}</div>
                    <div className="text-sm font-semibold text-slate-700">{r.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-emerald-50 px-5 py-4 ring-1 ring-emerald-100">
                <div className="text-sm font-semibold text-emerald-900">
                  ИТОГО: вы экономите минимум <span className="text-emerald-700">180 000₽</span>, делая всё это под ключ в Турции
                </div>
              </div>
            </div>
          </div>

          {/* CTA внутри секции (через одну) */}
          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-3xl rounded-3xl border bg-white p-5 text-center shadow-sm sm:p-6">
              <div className="text-sm font-semibold text-slate-900 sm:text-base">
                Рассчитать цену и количество графтов
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Пришлите 3 фото — расчёт обычно занимает до 15 минут.
              </div>

              <div className="mt-4 flex justify-center">
                <LeadModalCta
                  buttonText="Получить расчёт бесплатно"
                  className="w-full sm:w-auto"
                  buttonVariant="default"
                />
              </div>
            </div>
          </div>

        </section>

        {/* OFFICIAL */}
        <section className="bg-[radial-gradient(900px_circle_at_15%_20%,rgba(20,184,166,0.10),transparent_45%),radial-gradient(900px_circle_at_90%_15%,rgba(59,130,246,0.10),transparent_45%)]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:py-14">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex rounded-full border bg-white px-3 py-1 text-xs text-slate-700">
                Официальная работа
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Работаем открыто и официально
              </h2>
              <p className="mt-3 text-slate-600">Почему это важно для вас?</p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Medtravel.me — это платформа медицинского туризма</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Medtravel.me — это платформа медицинского туризма с проверенной сетью партнёров по всему миру.
                  По услуге пересадки волос в Турции мы работаем с ведущей клиникой-партнером, которая специализируется
                  на трансплантации волос и имеет все необходимые лицензии и сертификаты.
                </p>
              </div>

              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Как это работает?</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Вы обращаетесь к нам — мы организуем вашу поездку и передаём вас в руки нашего проверенного партнёра
                  с безупречной репутацией. Лечение проходит в их клинике, а мы обеспечиваем полное сопровождение,
                  трансфер, размещение и поддержку на каждом этапе.
                </p>
              </div>

              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-teal-700" />
                  <div className="text-sm font-semibold text-slate-900">Ваши гарантии безопасности</div>
                </div>
                <ul className="mt-3 space-y-3 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-600" />
                    <span>
                      <b className="text-slate-800">Лицензированные клиники</b> — наши партнёры работают легально, имеют официальный сертификат на медицинский туризм
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-600" />
                    <span>
                      <b className="text-slate-800">Прозрачное сотрудничество</b> — мы тщательно отбираем медицинские учреждения по критериям качества
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-600" />
                    <span>
                      <b className="text-slate-800">Официальные документы</b> — вы получаете полный пакет медицинской документации и гарантийный сертификат
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-600" />
                    <span>
                      <b className="text-slate-800">Наша ответственность</b> — мы координируем весь процесс от первой консультации до завершения восстановления
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CERTS */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex rounded-full border bg-slate-50 px-3 py-1 text-xs text-slate-700">
              Наши лицензии
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Официальные сертификаты и лицензии
            </h2>
            <p className="mt-3 text-slate-600">Полная прозрачность и соответствие стандартам</p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
              <div className="aspect-[16/9] bg-slate-100">
                <img
                  src="https://esteinturkey.com/ru/wp-content/uploads/2025/09/WhatsApp-Image-2025-09-30-at-13.11.22.jpeg"
                  alt="Международный сертификат медицинского туризма"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4 text-center text-sm text-slate-600">
                Международный сертификат медицинского туризма
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
              <div className="aspect-[16/9] bg-slate-100">
                <img
                  src="https://esteinturkey.com/ru/wp-content/uploads/2025/09/Golden-Elegant-Certificate-of-Appreciation.png"
                  alt="Сертификат гарантии результата"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4 text-center text-sm text-slate-600">
                Сертификат гарантии результата
              </div>
            </div>
          </div>

          {/* CTA внутри секции (через одну) */}
          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-3xl rounded-3xl border bg-slate-50 p-5 text-center shadow-sm sm:p-6">
              <div className="text-sm font-semibold text-slate-900 sm:text-base">
                Хотите пройти всё официально и безопасно?
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Мы подскажем по документам, этапам и подготовке.
              </div>

              <div className="mt-4 flex justify-center">
                <LeadModalCta
                  buttonText="Записаться на консультацию"
                  className="w-full sm:w-auto"
                />
              </div>
            </div>
          </div>

        </section>

        {/* WHY TURKEY */}
        <section className="bg-slate-50/60">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:py-14">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex rounded-full border bg-white px-3 py-1 text-xs text-slate-700">
                Мировой лидер
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Почему наши пациенты выбирают Турцию
              </h2>
              <p className="mt-3 text-slate-600">Европейское качество по доступной цене</p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="rounded-2xl bg-teal-50 p-3 ring-1 ring-teal-100 inline-flex">
                  <BadgeCheck className="h-5 w-5 text-teal-700" />
                </div>
                <div className="mt-4 font-semibold">300 000+ операций ежегодно</div>
                <div className="mt-2 text-sm text-slate-600">
                  Стамбул лидирует в мире по пересадке волос
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="rounded-2xl bg-teal-50 p-3 ring-1 ring-teal-100 inline-flex">
                  <ShieldCheck className="h-5 w-5 text-teal-700" />
                </div>
                <div className="mt-4 font-semibold">Международные стандарты качества</div>
                <div className="mt-2 text-sm text-slate-600">
                  Аккредитация JCI, ISO 9001, лицензии Минздрава Турции
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="rounded-2xl bg-teal-50 p-3 ring-1 ring-teal-100 inline-flex">
                  <Scissors className="h-5 w-5 text-teal-700" />
                </div>
                <div className="mt-4 font-semibold">Передовые технологии</div>
                <div className="mt-2 text-sm text-slate-600">
                  Методы FUE/DHI, микромоторы для безшовной экстракции
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex rounded-full border bg-slate-50 px-3 py-1 text-xs text-slate-700">
              Частые вопросы
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Вопросы, которые вы хотели задать
            </h2>
            <p className="mt-3 text-slate-600">
              Честные ответы без воды — всё, что важно знать перед процедурой
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <FaqAccordion items={faq} />
          </div>

          {/* CTA внутри секции (через одну) */}
          <div className="mx-auto mt-8 flex max-w-3xl justify-center">
            <div className="w-full rounded-3xl border bg-slate-50 p-5 text-center shadow-sm sm:p-6">
              <div className="text-sm font-semibold text-slate-900 sm:text-base">
                Остались вопросы? Ответим лично
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Оставьте заявку — и мы подберём оптимальный метод FUE/DHI под ваш случай.
              </div>

              <div className="mt-4 flex justify-center">
                <LeadModalCta
                  buttonText="Получить консультацию"
                  className="w-full sm:w-auto"
                />
              </div>
            </div>
          </div>

        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_20%_10%,rgba(20,184,166,0.16),transparent_50%),radial-gradient(1000px_circle_at_85%_25%,rgba(59,130,246,0.14),transparent_55%),linear-gradient(to_bottom,rgba(255,255,255,1),rgba(248,250,252,1))]" />
          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-14">
            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="inline-flex rounded-full border bg-white px-3 py-1 text-xs text-slate-700">
                  Начните сегодня
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Начните путь к густым волосам прямо сейчас
                </h2>
                <p className="mt-3 max-w-2xl text-slate-600">
                  Пришлите 3 фото (спереди, сверху, сбоку) — получите расчёт стоимости и план операции в Telegram за 15 минут
                </p>
              </div>

              <div className="lg:justify-self-end">
                <LeadDialog
                  variant="final"
                  title="Запишитесь на бесплатную консультацию и расчёт стоимости"
                  primaryCta="Получить консультацию"
                  secondaryCta="Получить расчёт в Telegram"
                />
              </div>
            </div>

            <div className="mt-10 border-t pt-6 text-center text-xs text-slate-500">
              © {new Date().getFullYear()} MedTravel. Информация на странице носит ознакомительный характер.
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
