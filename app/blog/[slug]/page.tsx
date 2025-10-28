// app/blog/[slug]/page.tsx
import { createServerClient } from "@/lib/supabase/serverClient";
import type { Metadata } from "next";

type Params = { slug: string };

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
    title: data?.title || "Blog post",
    description: data?.excerpt || "Article",
  };
}

export default async function BlogPostPage(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("blog_posts")
    .select("title,content,cover_url,created_at")
    .eq("slug", slug)
    .maybeSingle();

  return (
    <main className="container mx-auto px-4 py-12">
      <article className="prose prose-neutral dark:prose-invert max-w-3xl mx-auto">
        <h1>{data?.title ?? "We are medical tourism professionals"}</h1>

        {data?.content ? (
          // если храните markdown/html — подключите реальный рендер
          <p>{data.content}</p>
        ) : (
          <p>
            This is a placeholder article page. Connect your <code>blog_posts</code> table to show full
            content.
          </p>
        )}
      </article>
    </main>
  );
}
