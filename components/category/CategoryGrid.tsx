import CategoryGridClient from "@/components/category/CategoryGridClient";

export default function CategoryGrid({
  categorySlug,
  categoryName,
  initialPath,
}: {
  categorySlug: string;
  categoryName?: string;
  initialPath?: string[];
}) {
  return (
    <CategoryGridClient
      categorySlug={categorySlug}
      categoryName={categoryName}
      initialPath={initialPath}
    />
  );
}
