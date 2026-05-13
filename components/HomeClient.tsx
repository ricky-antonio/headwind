'use client'

import { useState, useRef } from 'react'
import SearchForm from './SearchForm'
import SummaryCard from './SummaryCard'
import RecentSearches from './RecentSearches'
import HowItWorks from './HowItWorks'
import ErrorBanner from './ErrorBanner'
import SiteHeader from './SiteHeader'
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
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)

      try {
        const s = await fetch('/api/searches')
        if (s.ok) setSearches(await s.json())
      } catch { /* non-critical */ }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <div className="relative min-h-[600px] flex flex-col">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80"
          alt="Airplane wing above clouds"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />

        <SiteHeader transparent />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-16 pt-8">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-white/20 animate-fade-in-up">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Powered by real flight data + AI
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4 max-w-3xl animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            Know before<br className="hidden sm:block" /> you fly.
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '240ms' }}>
            Check the delay risk for any flight route before you book.
            Historical data meets AI — so you can travel with confidence.
          </p>
        </div>
      </div>

      {/* Search card — overlaps the hero bottom */}
      <div className="relative z-20 -mt-12 px-4 pb-8">
        <div className="max-w-2xl mx-auto bg-card rounded-2xl shadow-2xl border p-6 sm:p-8 animate-scale-in" style={{ animationDelay: '350ms' }}>
          <h2 className="text-lg font-semibold mb-5">Check a flight route</h2>
          <SearchForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>

      {/* Results */}
      {(loading || error || result) && (
        <div className="px-4 pb-8" ref={resultRef}>
          <div className="max-w-2xl mx-auto space-y-4">
            {loading && (
              <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="h-20 w-36 rounded-lg shrink-0" />
                </div>
              </div>
            )}
            {error && <ErrorBanner message={error} />}
            {result && <SummaryCard result={result} />}
          </div>
        </div>
      )}

      {/* How it works — only shown when no active result */}
      {!result && !loading && <HowItWorks />}

      {/* Recent searches */}
      {searches.length > 0 && (
        <div className="px-4 py-12 bg-background">
          <div className="max-w-2xl mx-auto">
            <RecentSearches searches={searches} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t py-8 text-center text-sm text-muted-foreground">
        <p>HeadWind — flight delay predictions powered by historical data &amp; AI.</p>
        <p className="mt-1 text-xs opacity-60">Data is historical and for informational purposes only.</p>
      </footer>
    </div>
  )
}
