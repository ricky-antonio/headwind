import { NextResponse } from 'next/server'
import { getRecentSearches } from '@/lib/db'

export async function GET() {
  try {
    const searches = await getRecentSearches()
    return NextResponse.json(searches)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch recent searches' }, { status: 500 })
  }
}
