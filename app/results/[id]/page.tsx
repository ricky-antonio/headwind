import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPredictionById } from '@/lib/db'
import SummaryCard from '@/components/SummaryCard'
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
  } catch {
    // fall through to defaults
  }

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
  } catch {
    // DB not available
  }

  if (!result) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Back to search
      </Link>
      <SummaryCard result={result} />
    </div>
  )
}
