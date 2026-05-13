'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { RecentSearch } from '@/lib/types'

interface RecentSearchesProps {
  searches: RecentSearch[]
}

const verdictClass: Record<string, string> = {
  low: 'verdict-low',
  moderate: 'verdict-moderate',
  high: 'verdict-high',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function RecentSearches({ searches }: RecentSearchesProps) {
  if (searches.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent searches</h2>
      <ul className="divide-y divide-border rounded-lg border bg-card overflow-hidden">
        {searches.map((s) => (
          <li key={s.id}>
            <Link
              href={`/results/${s.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0">
                <span className="font-mono text-sm font-medium">
                  {s.origin} → {s.destination}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">{s.airline}</span>
                <span className="ml-2 text-xs text-muted-foreground font-mono">{s.date}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${verdictClass[s.verdict]}`}>
                  {s.verdict.toUpperCase()}
                </span>
                <span className="text-xs text-muted-foreground">{timeAgo(s.searchedAt)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
