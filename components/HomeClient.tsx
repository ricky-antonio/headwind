'use client'

import { useState, useRef } from 'react'
import SearchForm from './SearchForm'
import SummaryCard from './SummaryCard'
import RecentSearches from './RecentSearches'
import ErrorBanner from './ErrorBanner'
import { Skeleton } from '@/components/ui/skeleton'
import type { PredictInput, PredictionResult, RecentSearch } from '@/lib/types'

interface HomeClientProps {
  initialSearches: RecentSearch[]
}

export default function HomeClient({ initialSearches }: HomeClientProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searches, setSearches] = useState<RecentSearch[]>(initialSearches)
  const resultRef = useRef<HTMLDivElement>(null)

  async function handleSubmit(input: PredictInput) {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      setResult(data)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)

      // Refresh recent searches
      try {
        const s = await fetch('/api/searches')
        if (s.ok) setSearches(await s.json())
      } catch {
        // non-critical
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <SearchForm onSubmit={handleSubmit} loading={loading} />

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {result && (
        <div ref={resultRef}>
          <SummaryCard result={result} />
        </div>
      )}

      <RecentSearches searches={searches} />
    </div>
  )
}
