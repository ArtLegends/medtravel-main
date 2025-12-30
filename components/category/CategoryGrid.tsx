// components/category/CategoryGrid.tsx
import CategoryGridClient from "@/components/category/CategoryGridClient";

export default function CategoryGrid({
  categorySlug,
  categoryName,
}: {
  categorySlug: string;
  categoryName?: string;
}) {
  return <CategoryGridClient categorySlug={categorySlug} categoryName={categoryName} />;
}
