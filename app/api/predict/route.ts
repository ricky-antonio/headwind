import { NextRequest, NextResponse } from 'next/server'
import { fetchHistoricalFlights, computeRiskScore, computeVerdict, NotFoundError } from '@/lib/aerodatabox'
import { generateRiskNarrative } from '@/lib/anthropic'
import { getCachedResult, saveResult, logSearch } from '@/lib/db'
import type { PredictInput } from '@/lib/types'

const IATA_RE = /^[A-Z]{3}$/

function validate(body: unknown): PredictInput | null {
  if (!body || typeof body !== 'object') return null
  const { origin, destination, airline, date } = body as Record<string, unknown>
  if (
    typeof origin !== 'string' || !IATA_RE.test(origin) ||
    typeof destination !== 'string' || !IATA_RE.test(destination) ||
    typeof airline !== 'string' || airline.trim().length === 0 ||
    typeof date !== 'string' || isNaN(Date.parse(date))
  ) return null
  if (new Date(date) < new Date(new Date().toDateString())) return null
  return { origin, destination, airline: airline.trim(), date }
}

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const input = validate(body)
  if (!input) {
    return NextResponse.json({ error: 'Invalid input. Origin and destination must be 3-letter IATA codes, date must not be in the past.' }, { status: 400 })
  }

  try {
    const cached = await getCachedResult(input.origin, input.destination, input.airline)
    if (cached) {
      await logSearch(cached.id)
      return NextResponse.json(cached)
    }

    const stats = await fetchHistoricalFlights(input.origin, input.destination, input.airline)
    const riskScore = computeRiskScore(stats)
    const verdict = computeVerdict(riskScore)
    const aiOutput = await generateRiskNarrative(input.origin, input.destination, input.airline, stats)

    const saved = await saveResult({
      origin: input.origin,
      destination: input.destination,
      airline: input.airline,
      date: input.date,
      riskScore,
      verdict,
      narrative: aiOutput.narrative,
      detail: { stats, tips: aiOutput.tips },
    })

    await logSearch(saved.id)
    return NextResponse.json(saved)
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 })
    }
    console.error('[predict] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
