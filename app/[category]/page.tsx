import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/serverClient";
import CategoryHero from "@/components/CategoryHero";
import CategoryWhy from "@/components/CategoryWhy";
import CategoryGrid from "@/components/CategoryGrid";

export const revalidate = 60;

export default async function CategoryPage(
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  const slug = decodeURIComponent(category);

  const supabase = createServerClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!cat) return notFound();

  return (
    <>
      <CategoryHero title={`Best ${cat.name} Clinics in Popular Destinations`} />
      <CategoryWhy />
      <CategoryGrid categorySlug={slug} />
    </>
  );
}
