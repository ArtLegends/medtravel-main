// app/[category]/page.tsx
import HeroCategory from "@/components/HeroCategory";
import WhyChooseUsCategory from "@/components/WhyChooseUsCategory";
import ClinicList from "@/components/ClinicList";
// import { createServerClient } from "@/lib/supabase/serverClient";
import { createServerClient } from "@/lib/supabase/serverClient";
import type { Clinic } from "@/lib/supabase/requests";

interface Props {
  params: { category: string };
}

export default async function CategoryPage({ params }: Props) {
  const slug = params.category;
  const cat = { name: slug[0].toUpperCase() + slug.slice(1).replace(/-/g, " ") };

  // Тестовые клиники
  const clinicList: Clinic[] = [
    {
      id: "demo-1",
      name: "Demo Clinic 1",
      slug: "demo-clinic-1",
      country: "Turkey",
      province: "Istanbul",
      city: "Istanbul",
      district: "",
      cover_url: null,
      services: ["Service A", "Service B"],
      description: "This is a demo clinic for testing purposes.",
    },
    {
      id: "demo-2",
      name: "Demo Clinic 2",
      slug: "demo-clinic-2",
      country: "Spain",
      province: "Madrid",
      city: "Madrid",
      district: "",
      cover_url: null,
      services: ["Service X", "Service Y"],
      description: "This is another demo clinic for testing purposes.",
    },
  ];

  return (
    <>
      {/* Hero */}
      <HeroCategory
        title={`Best Treatments Clinics in ${cat.name}`}
        buttonLabel="Receive a Personalized Offer on Us"
        buttonHref="#contact-form"
        backgroundUrl="https://your.cdn.example.com/category-bg.jpg"
      />

      {/* Why choose us */}
      <WhyChooseUsCategory />

      {/* Основной контент: описание + список + sidebar */}
      <section className="container mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Левое 3-колоночное */}
        <div className="lg:col-span-3 space-y-6">
          {/* Подзаголовок и текст (как на втором скриншоте) */}
          <h2 className="text-3xl lg:text-4xl font-bold mb-2">
            Best Treatments Clinics in {cat.name}
          </h2>
          <p className="text-gray-600 mb-8 max-w-prose">
            MedTravel.me’s clinic rating is shaped by various factors, such as
            patient demand, review feedback, frequency of updates to treatment
            options and prices, and response times.
          </p>

          {/* Список тестовых клиник */}
          <ClinicList clinics={clinicList} />
        </div>

        {/* Боковая панель (фильтры / поиск) */}
        <aside className="lg:col-span-1 space-y-8">
          {/* Пока можно вставить ваши компоненты SearchSection/SearchBar */}
          <div className="bg-white p-4 rounded-lg shadow">
            <input
              type="text"
              placeholder="Search locations"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
            />
            <h3 className="font-medium mb-2">Popular locations</h3>
            <ul className="space-y-1 text-blue-600">
              {["Germany", "Spain", "Mexico", "Turkey", "Poland"].map((c) => (
                <li key={c} className="hover:underline cursor-pointer">
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <input
              type="text"
              placeholder="Search treatments"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
            />
            <h3 className="font-medium mb-2">Popular treatments</h3>
            <ul className="space-y-1 text-blue-600 text-sm">
              {[
                "test service",
                "Teeth Whitening",
                "Dental Implant",
                "Hair Transplant",
              ].map((t) => (
                <li key={t} className="hover:underline cursor-pointer">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
