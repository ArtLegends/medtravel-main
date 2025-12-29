// components/category/CategoryGrid.tsx
import CategoryGridClient from "@/components/category/CategoryGridClient";

export default function CategoryGrid({
  categorySlug,
  categoryName,
  initialCity,
  initialServices,
}: {
  categorySlug: string;
  categoryName?: string;
  initialCity?: string;
  initialServices?: string[];
}) {
  return (
    <CategoryGridClient
      categorySlug={categorySlug}
      categoryName={categoryName}
      initialCity={initialCity}
      initialServices={initialServices}
    />
  );
}
