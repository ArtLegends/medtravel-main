// components/SearchBar.tsx
'use client'

interface Props {
  value: string
  onChangeAction: (value: string) => void
  placeholder?: string
}

export default function SearchBar({
  value,
  onChangeAction,
  placeholder = 'Search clinics...'
}: Props) {
  return (
    <input
      type="search"
      className="w-full px-4 py-2 border rounded"
      placeholder={placeholder}
      value={value}
      onChange={e => onChangeAction(e.target.value)}
    />
  )
}