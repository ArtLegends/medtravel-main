// components/category/CategoryGrid.tsx
import CategoryGridClient from "@/components/category/CategoryGridClient";

export default function CategoryGrid({ categorySlug }: { categorySlug: string }) {
  // Вся интерактивная логика и рендер сетки перенесены в клиентский компонент,
  // чтобы сохранить прежний вид (список слева, фильтры справа).
  return <CategoryGridClient categorySlug={categorySlug} />;
}
