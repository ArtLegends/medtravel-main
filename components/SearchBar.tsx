'use client'
// import { useState } from 'react'
// import { searchClinics } from '@/lib/supabase/requests'
// import ClinicCard from '@/components/ClinicCard'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <input
      type="search"
      className="w-full px-4 py-2 border rounded"
      placeholder="Search clinics..."
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  )
}