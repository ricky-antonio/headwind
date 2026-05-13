import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPredictionById } from '@/lib/db'
import SummaryCard from '@/components/SummaryCard'
import SiteHeader from '@/components/SiteHeader'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  let title = 'Flight Delay Risk — HeadWind'
  let description = 'View flight delay risk prediction.'

  try {
    const result = await getPredictionById(id)
    if (result) {
      title = `${result.origin}→${result.destination} ${result.verdict.toUpperCase()} risk — HeadWind`
      description = result.narrative
    }
  } catch { /* fall through */ }

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: 'summary', title, description },
  }
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params

  let result = null
  try {
    result = await getPredictionById(id)
  } catch { /* DB not available */ }

  if (!result) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 space-y-6">
        <Link href="/" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1">
          ← Back to search
        </Link>
        <SummaryCard result={result} />
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        HeadWind — flight delay predictions powered by historical data &amp; AI.
      </footer>
    </div>
  )
}
