// app/blog/[slug]/page.tsx
import Image from "next/image";
import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/serverClient";

type Params = { slug: string };
type Category = { id: string; slug: string; name: string };

function readingTime(text: string) {
  const words = (text || "").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function toOneCategory(input: unknown): Category | null {
  if (!input) return null;
  const o = Array.isArray(input) ? (input[0] as any) : (input as any);
  if (!o || !o.id || !o.slug || !o.name) return null;
  return { id: String(o.id), slug: String(o.slug), name: String(o.name) };
}

// ── metadata
export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("blog_posts")
    .select("title,excerpt,cover_url")
    .eq("slug", slug)
    .maybeSingle();

  return {
    title: data?.title || "Article",
    description: data?.excerpt || "Blog article",
    alternates: { canonical: `/blog/${slug}` },
  };
}

// ── page
export default async function BlogPostPage(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params;
  const supabase = await createServerClient();

  // ВАЖНО: просим существующие поля content_html / content_md
  const { data: raw, error } = await supabase
    .from("blog_posts")
    .select(
      [
        "id",
        "slug",
        "title",
        "excerpt",
        "content_html",
        "content_md",
        "cover_url",
        "created_at",
        "published_at",
        "tags",
        "author_name",
        "author_avatar_url",
        "category:category_id ( id, slug, name )",
      ].join(",")
    )
    .eq("slug", slug)
    .maybeSingle();

  // Если запись есть — используем её. Если ошибка/пусто — плейсхолдер.
  const data =
    raw ??
    ({
      id: "placeholder",
      slug,
      title: slug.replace(/-/g, " ").replace(/\b\w/g, (s) => s.toUpperCase()),
      excerpt:
        "This is a placeholder article page. Connect your blog_posts table to show full content.",
      content_html:
        "<p>Welcome</p><p>This is <strong>markdown</strong> example.</p><ul><li>step 1</li><li>step 2</li></ul><p>Thanks for reading!</p>",
      cover_url:
        "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1600&q=60",
      created_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      tags: ["Veneers", "Dental Implants"],
      author_name: "Editorial team",
      author_avatar_url: null,
      category: { id: "cat-1", slug: "dentistry", name: "Dentistry" },
    } as any);

  const category = toOneCategory((data as any).category);
  const cover = (data as any).cover_url ?? null;
  const tags: string[] = Array.isArray((data as any).tags) ? (data as any).tags : [];
  const publishedISO = ((data as any).published_at ?? (data as any).created_at ?? "") as string;

  // Текст для расчёта reading-time: html → md → excerpt → title
  const rtSource =
    (data as any).content_html ||
    (data as any).content_md ||
    (data as any).excerpt ||
    (data as any).title;
  const minutes = readingTime(String(rtSource || ""));

  return (
    <main className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <nav className="mx-auto mb-6 max-w-5xl text-sm text-gray-500">
          <a className="hover:underline" href="/blog">Blog</a>
          {category && (
            <>
              {" / "}
              <a
                className="hover:underline"
                href={`/blog?category=${encodeURIComponent(category.slug)}`}
              >
                {category.name}
              </a>
            </>
          )}
        </nav>

        {/* Заголовок + мета */}
        <header className="mx-auto mb-6 max-w-5xl">
          <h1 className="text-2xl font-bold leading-tight text-gray-900 md:text-4xl">
            {(data as any).title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>{(data as any).author_name ?? "Editorial team"}</span>
            <span>•</span>
            <time dateTime={publishedISO}>
              {publishedISO ? new Date(publishedISO).toLocaleDateString() : ""}
            </time>
            <span>•</span>
            <span>{minutes} min read</span>
          </div>
        </header>

        {/* Обложка — центр, ограничение по высоте */}
        {cover && (
          <div className="mx-auto mb-8 w-full max-w-5xl">
            <div className="relative h-64 rounded-2xl border overflow-hidden md:h-80 lg:h-96">
              <Image
                src={cover}
                alt={(data as any).title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Контент */}
        <div className="mx-auto max-w-5xl">
          {data.excerpt && (
            <p className="mb-6 rounded-xl bg-emerald-50 p-4 text-emerald-800">{data.excerpt}</p>
          )}

          {(data as any).content_html ? (
            <div
              className="
              prose prose-lg max-w-none
              prose-headings:scroll-mt-24 prose-headings:font-semibold
              prose-h2:mt-10 prose-h2:mb-4
              prose-h3:mt-8  prose-h3:mb-3
              prose-p:leading-7
              prose-li:marker:text-emerald-600
              prose-a:text-emerald-700 hover:prose-a:underline
              prose-blockquote:border-l-4 prose-blockquote:border-emerald-300
              prose-img:rounded-xl prose-img:border prose-img:mx-auto
              prose-table:shadow-sm prose-th:font-semibold
              prose-figcaption:text-sm prose-figcaption:text-gray-500
              dark:prose-invert
              "
              dangerouslySetInnerHTML={{ __html: String(data.content_html) }}
            />
          ) : (data as any).content_md ? (
            <div className="prose prose-lg max-w-none dark:prose-invert whitespace-pre-wrap">
              {String((data as any).content_md)}
            </div>
          ) : null}

          {tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {tags.map((t) => (
                <a
                  key={t}
                  href={`/blog?q=${encodeURIComponent(t)}`}
                  className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
                >
                  #{t.replace(/\s+/g, "")}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Отладка (при желании можно временно включать) */}
        {/* {error && <pre className="mt-6 text-xs text-red-600">{error.message}</pre>} */}
      </div>
    </main>
  );
}
