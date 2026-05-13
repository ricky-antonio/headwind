import { getRecentSearches } from '@/lib/db'
import HomeClient from '@/components/HomeClient'
import type { RecentSearch } from '@/lib/types'

export default async function HomePage() {
  let recentSearches: RecentSearch[] = []
  try {
    recentSearches = await getRecentSearches()
  } catch {
    // DB not configured — show empty list
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Flight Delay Risk</h1>
        <p className="text-muted-foreground text-sm">
          Check historical delay risk for any route before you book.
        </p>
      </div>
      <HomeClient initialSearches={recentSearches} />
    </div>
  )
}
