// components/CategoryCard.tsx
import Link from 'next/link'

interface Props {
  category: {
    id: number
    name: string
    slug: string
  }
}

export default function CategoryCard({ category }: Props) {
   return (
    <Link
      href={`/${category.slug}`}
      className="block overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
      <div className="p-4">
        <h2 className="text-xl font-semibold">{category.name}</h2>
      </div>
    </Link>
  )
}