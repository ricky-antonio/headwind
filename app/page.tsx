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

  return <HomeClient initialSearches={recentSearches} />
}
