// app/blog/page.tsx
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/serverClient";
import ContactFormSection from "@/components/ContactFormSection";
import type { SupabaseClient } from "@supabase/supabase-js";

// ── meta
export const metadata: Metadata = {
  title: "Blog",
  description:
    "Research-based articles about treatment abroad: costs, clinics, outcomes, and practical checklists for patients.",
  alternates: { canonical: "/blog" },
};

// ── types
type Category = { id: string; slug: string; name: string };
type PostCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  created_at: string | null;
  published_at: string | null;
  tags: string[];
  category: Category | null;
};

// ── helpers
function toOneCategory(input: unknown): Category | null {
  if (!input) return null;
  // supabase может вернуть объект или массив объектов; аккуратно нормализуем
  const obj = Array.isArray(input) ? (input[0] as any) : (input as any);
  if (!obj || typeof obj !== "object") return null;
  const id = obj.id ?? obj?.category_id ?? null;
  const slug = obj.slug ?? null;
  const name = obj.name ?? null;
  if (!id || !slug || !name) return null;
  return { id: String(id), slug: String(slug), name: String(name) };
}

function mapPostRow(row: any): PostCard {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: row.excerpt ?? null,
    cover_url: row.cover_url ?? null,
    created_at: row.created_at ?? null,
    published_at: row.published_at ?? null,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    category: toOneCategory(row.category),
  };
}

// ── data
async function fetchData(opts: {
  supabase: SupabaseClient;
  category?: string;
  q?: string;
  page: number;
  pageSize: number;
}) {
  const { supabase, category, q, page, pageSize } = opts;

  // Категории
  const { data: cats } = await supabase
    .from("blog_categories")
    .select("id, slug, name")
    .order("name", { ascending: true });

  // Посты
  let sel = supabase
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, cover_url, created_at, published_at, tags, category:category_id ( id, slug, name )"
    )
    .order("published_at", { ascending: false, nullsFirst: false });

  if (category) sel = sel.eq("category_slug", category);

  if (q && q.trim()) {
    // простой поиск по заголовку/описанию
    const s = q.trim();
    sel = sel.or(`title.ilike.%${s}%,excerpt.ilike.%${s}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: posts } = await sel.range(from, to);

  return {
    categories: (cats ?? []) as Category[],
    posts: (posts ?? []).map(mapPostRow) as PostCard[],
  };
}

// ── page
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const category = sp?.category?.trim() || undefined;
  const q = sp?.q?.trim() || undefined;
  const page = Math.max(1, Number(sp?.page || "1"));
  const PAGE_SIZE = 12;

   const supabase = await createServerClient();
  const { categories, posts } = await fetchData({
    supabase,
    category,
    q,
    page,
    pageSize: PAGE_SIZE,
  });

  const tabs = [{ slug: undefined, name: "All" }, ...categories];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Категории */}
      <section className="container mx-auto px-4 pt-8">
        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm md:text-base">
          {tabs.map((c) => {
            const active = (!category && !c?.slug) || category === c?.slug;
            const href = c?.slug ? `/blog?category=${encodeURIComponent(c.slug)}` : "/blog";
            return (
              <Link
                key={c?.slug ?? "all"}
                href={href}
                className={`transition-colors hover:text-emerald-600 ${
                  active ? "text-gray-900 font-semibold" : "text-gray-500"
                }`}
              >
                {c?.name ?? "All"}
              </Link>
            );
          })}
        </nav>
      </section>

      <section className="container mx-auto grid grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[1fr_320px]">
        {/* Лента */}
        <div>
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
              Nothing found
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <article
                  key={p.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <Link href={`/blog/${p.slug}`} className="block">
                    {p.cover_url && (
                      <div className="relative aspect-[16/10] w-full bg-gray-100">
                        <Image
                          src={p.cover_url}
                          alt={p.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      {p.category && (
                        <span className="inline-block rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                          {p.category.name}
                        </span>
                      )}
                      <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-gray-900">
                        {p.title}
                      </h3>
                      {p.excerpt && (
                        <p className="mt-2 line-clamp-3 text-sm text-gray-600">{p.excerpt}</p>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Сайдбар */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <form action="/blog" className="flex items-center gap-2">
              <input
                name="q"
                defaultValue={q}
                className="w-full rounded-xl border px-3 py-2"
                placeholder="Search articles…"
              />
              <button className="rounded-xl border px-4 py-2">Search</button>
            </form>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-2 text-sm font-semibold">About the blog</div>
            <p className="text-sm text-gray-600">
              Research-based articles about treatment abroad: costs, clinics, outcomes, and
              practical checklists for patients.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-2 text-sm font-semibold">Popular tags</div>
            <div className="flex flex-wrap gap-2">
              {["Dental Implants", "Veneers", "Rhinoplasty", "Hair Transplant"].map((t) => (
                <a
                  key={t}
                  href={`/blog?q=${encodeURIComponent(t)}`}
                  className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
                >
                  #{t.replace(/\s+/g, "")}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>

      {/* Форма — во всю ширину внизу, как просил */}
      <section className="pb-16">
        <ContactFormSection />
      </section>
    </main>
  );
}
