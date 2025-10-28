// app/blog/page.tsx
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

import { createServerClient } from "@/lib/supabase/serverClient";
import ContactFormSection from "@/components/ContactFormSection";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights about dentistry, hair transplant, plastic surgery and more.",
  alternates: { canonical: "/blog" },
};

type Category = { id: string; slug: string; name: string };
type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  cover_url?: string | null;
  category?: { id: string; slug: string; name: string } | null;
  created_at?: string | null;
};

const FALLBACK_CATEGORIES: Category[] = [
  { id: "cat-1", slug: "dentistry", name: "Dentistry" },
  { id: "cat-2", slug: "hair-transplant", name: "Hair transplant" },
  { id: "cat-3", slug: "plastic-surgery", name: "Plastic surgery" },
  { id: "cat-4", slug: "crowns", name: "Crowns" },
  { id: "cat-5", slug: "veneers", name: "Veneers" },
  { id: "cat-6", slug: "dental-implants", name: "Dental Implants" },
];

const FALLBACK_POSTS: Post[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `p-${i + 1}`,
  slug: `post-${i + 1}`,
  title: "We are medical tourism professionals",
  excerpt:
    "Short digest about planning treatment abroad: clinic selection, doctors, costs and logistics.",
  cover_url:
    "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=60",
  category: FALLBACK_CATEGORIES[i % 4],
}));

async function getData(activeCat?: string) {
  try {
    const supabase = await createServerClient();

    // --- категории
    let { data: cats, error: catsErr } = await supabase
      .from("blog_categories")
      .select("id,slug,name")
      .order("name", { ascending: true });

    if (catsErr || !cats?.length) {
      const alt = await supabase
        .from("categories")
        .select("id,slug,name,type")
        .eq("type", "blog")
        .order("name", { ascending: true });

      cats = (alt.data || []).map((c: any) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
      }));
    }

    // --- посты
    let query = supabase
      .from("blog_posts")
      .select(
        "id,slug,title,excerpt,cover_url,created_at, category:category_id ( id,slug,name )"
      )
      .order("created_at", { ascending: false })
      .limit(24);

    if (activeCat) {
      // если есть материализованный слаг категории — используем его
      query = query.eq("category_slug", activeCat);
      // иначе можно держать альтернативный RPC/VIEW со связью category.slug
    }

    let { data: posts, error: postsErr } = await query;

    if (postsErr || !posts?.length) {
      return {
        categories: cats && cats.length ? (cats as Category[]) : FALLBACK_CATEGORIES,
        posts: FALLBACK_POSTS,
      };
    }

    return {
      categories: (cats && cats.length ? (cats as Category[]) : FALLBACK_CATEGORIES) as Category[],
      posts: (posts as any[]).map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        cover_url: p.cover_url,
        created_at: p.created_at,
        category: p.category,
      })) as Post[],
    };
  } catch {
    return { categories: FALLBACK_CATEGORIES, posts: FALLBACK_POSTS };
  }
}

export default async function BlogPage(
  { searchParams }: { searchParams: Promise<{ category?: string }> }
) {
  const sp = await searchParams;
  const active = sp?.category?.trim() || undefined;

  const { categories, posts } = await getData(active);

  return (
    <main className="min-h-screen bg-background">
      {/* Полоса категорий */}
      <section className="container mx-auto px-4 pt-8 md:pt-10">
        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm md:text-base">
          <Link
            href="/blog"
            className={`transition-colors hover:text-primary ${
              !active ? "text-foreground font-semibold" : "text-default-500"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/blog?category=${encodeURIComponent(c.slug)}`}
              className={`transition-colors hover:text-primary ${
                active === c.slug
                  ? "text-foreground font-semibold"
                  : "text-default-500"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </section>

      {/* Сетка карточек */}
      <section className="container mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {posts.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl bg-content1 ring-1 ring-divider shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <Link href={`/blog/${p.slug}`} className="block">
                <div className="relative aspect-square w-full bg-default-100">
                  {p.cover_url ? (
                    <Image
                      src={p.cover_url}
                      alt={p.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : null}
                </div>
                <div className="p-4 md:p-5">
                  {p.category?.name ? (
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-secondary/30 text-secondary-700 dark:text-secondary-300">
                      {p.category.name}
                    </span>
                  ) : null}
                  <h3 className="mt-2 text-lg md:text-xl font-semibold text-foreground line-clamp-2">
                    {p.title}
                  </h3>
                  {p.excerpt ? (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {p.excerpt}
                    </p>
                  ) : null}
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Форма из главной */}
      <section className="container mx-auto px-4 pb-16 md:pb-20">
        <Suspense fallback={null}>
          <ContactFormSection />
        </Suspense>
      </section>
    </main>
  );
}
