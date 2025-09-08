// components/SearchSection.tsx
"use client"

import { useState, useEffect } from "react"
import SearchBar from "./SearchBar"
import { searchClinics } from "@/lib/supabase/requests"
import ClinicCard from "./ClinicCard"
import CategoryCard from "./CategoryCard"
import type { Category } from "@/lib/supabase/requests"
import type { Clinic } from "@/lib/supabase/requests"
import { useDebounce } from '@/hooks/useDebounce'

interface Props {
    categories: Category[]
}

export default function SearchSection({ categories }: Props) {
    const [query, setQuery] = useState<string>("")
    const [results, setResults] = useState<Clinic[]>([])
    const debouncedQuery = useDebounce(query, 300)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!debouncedQuery) {
            setResults([])
            return
        }
        setLoading(true)
        searchClinics(debouncedQuery)
            .then(data => { setResults(data); setError(null) })
            .catch(err => setError(err.message || 'Something went wrong'))
            .finally(() => setLoading(false))
    }, [debouncedQuery])

    return (
        <section className="container mx-auto py-20">
            <SearchBar value={query} onChangeAction={setQuery} />

            {query ? (
                <div className="mt-8">
                    {loading && <p>Loading...</p>}
                    {!loading && results.length === 0 && <p>No clinics found.</p>}
                    {!loading && results.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {results.map(clinic => (
                                <ClinicCard key={clinic.id} clinic={clinic} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {categories.map(cat => (
                        <CategoryCard key={cat.id} category={cat} />
                    ))}
                </div>
            )}
        </section>
    )
}
