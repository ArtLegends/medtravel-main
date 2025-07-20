// app/[category]/page.tsx
import HeroCategory from "@/components/HeroCategory";
import WhyChooseUsCategory from "@/components/WhyChooseUsCategory";
import ClinicList from "@/components/ClinicList";
// import { createServerClient } from "@/lib/supabase/serverClient";
import { createServerClient } from "@/lib/supabase/serverClient";
import type { Clinic } from "@/lib/supabase/requests";
import CategoryContent from "@/components/CategoryContent";

interface Props {
  params: { category: string };
}

export default async function CategoryPage({ params }: Props) {
  // 1️⃣ Достаем slug из URL
  const { category: slug } = params;

  // 2️⃣ Отдаем имя категории (для Hero и заголовка)
  const supabase = createServerClient();
  const { data: cat, error: catErr } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (catErr || !cat) {
    return (
      <p className="container mx-auto py-20 text-center">
        Category not found
      </p>
    );
  }

  // 3️⃣ Запрос всех клиник, привязанных к этой категории
  const { data: rows, error: rowsErr } = await supabase
    .from("clinic_categories")
    .select(`
      clinic:clinic_id (
        id,
        name,
        slug,
        about,
        address,
        country,
        city,
        province,
        district
      )
    `)
    .eq("category_id", cat.id);

  if (rowsErr) {
    console.error(rowsErr);
    return (
      <p className="container mx-auto py-20 text-center">
        Error loading clinics
      </p>
    );
  }

  // 4️⃣ Приводим к нашему типу Clinic и ставим пустые услуги
  function isClinic(obj: any): obj is Clinic {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.slug === "string" &&
    typeof obj.country === "string" &&
    typeof obj.province === "string" &&
    typeof obj.city === "string" &&
    typeof obj.district === "string"
  );
}

const clinicList: Clinic[] = Array.isArray(rows)
  ? rows
      .map((r) => r.clinic as Partial<Clinic>)
      .filter((c) => c && !Array.isArray(c) && isClinic(c))
      .map((c) => ({
        id: c.id ?? "",
        name: c.name ?? "",
        slug: c.slug ?? "",
        about: c.about ?? "",
        // address: c.address ?? "",
        country: c.country ?? "",
        city: c.city ?? "",
        province: c.province ?? "",
        district: c.district ?? "",
        services: [],
      }))
  : [];

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

      {/* Контент + Сайдбар */}
      <section className="container mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold mb-2">
            Best Treatments Clinics in {cat.name}
          </h2>
          <p className="text-gray-600 mb-8 max-w-prose">
            MedTravel.me’s clinic rating is shaped by various factors, such as
            patient demand, review feedback, frequency of updates to treatment
            options and prices, and response times.
          </p>

          <CategoryContent categoryId={cat.id} />
        </div>

        <aside className="lg:col-span-1 space-y-8">
          {/* здесь ваш SearchSection и прочее */}
          {/* … */}
        </aside>
      </section>
    </>
  );
}