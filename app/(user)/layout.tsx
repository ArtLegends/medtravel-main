// app/(user)/layout.tsx
'use client'

import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function UserLayout({ children }: Props) {
  // просто пробрасываем внутрь вложенные страницы
  return <>{children}</>
}