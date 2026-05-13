import type { DelayStats } from './types'

const AERODATABOX_HOST = 'aerodatabox.p.rapidapi.com'
const BASE_URL = `https://${AERODATABOX_HOST}`

export function computeRiskScore(stats: DelayStats): number {
  const base =
    stats.delayedPercent * 0.5 +
    stats.cancelledPercent * 1.5 +
    stats.avgDelayMinutes / 3
  return Math.min(100, Math.round(base))
}

export function computeVerdict(riskScore: number): 'low' | 'moderate' | 'high' {
  if (riskScore < 33) return 'low'
  if (riskScore < 66) return 'moderate'
  return 'high'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDelayStats(data: any): DelayStats {
  const stats = data?.statistics ?? data ?? {}
  const onTime = Number(stats.onTimePercent ?? stats.on_time_percent ?? 0)
  const delayed = Number(stats.delayedPercent ?? stats.delayed_percent ?? 0)
  const cancelled = Number(stats.cancelledPercent ?? stats.cancelled_percent ?? 0)
  const avgDelay = Number(stats.avgDelayMinutes ?? stats.avg_delay_minutes ?? 0)

  const reasons = stats.delayReasons ?? stats.delay_reasons ?? {}

  const monthStats: Array<{ month: string; score: number }> = (
    stats.monthlyStats ?? stats.monthly_stats ?? []
  ).map((m: any) => ({
    month: String(m.month ?? ''),
    score: Number(m.delayScore ?? m.delay_score ?? m.delayedPercent ?? m.delayed_percent ?? 0),
  }))

  const sorted = [...monthStats].sort((a, b) => a.score - b.score)
  const bestMonths = sorted.slice(0, 2).map((m) => m.month).filter(Boolean)
  const worstMonths = sorted.slice(-2).reverse().map((m) => m.month).filter(Boolean)

  return {
    totalFlights: Number(stats.totalFlights ?? stats.total_flights ?? 0),
    onTimePercent: onTime,
    delayedPercent: delayed,
    cancelledPercent: cancelled,
    avgDelayMinutes: avgDelay,
    delayReasons: {
      weather: Number(reasons.weather ?? 0),
      carrier: Number(reasons.carrier ?? 0),
      nas: Number(reasons.nas ?? reasons.nationalAviationSystem ?? 0),
      security: Number(reasons.security ?? 0),
      lateAircraft: Number(reasons.lateAircraft ?? reasons.late_aircraft ?? 0),
    },
    worstMonths,
    bestMonths,
    dataRangeStart: String(stats.dataRangeStart ?? stats.data_range_start ?? ''),
    dataRangeEnd: String(stats.dataRangeEnd ?? stats.data_range_end ?? ''),
  }
}

export async function fetchHistoricalFlights(
  origin: string,
  destination: string,
  airline: string,
): Promise<DelayStats> {
  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) throw new Error('RAPIDAPI_KEY is not set')

  const url = `${BASE_URL}/flights/stats/route/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}?airline=${encodeURIComponent(airline)}`

  const res = await fetch(url, {
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': AERODATABOX_HOST,
    },
  })

  if (res.status === 404 || res.status === 204) {
    throw new NotFoundError('No historical data found for this route and airline.')
  }

  if (!res.ok) {
    throw new Error(`AeroDataBox error: ${res.status}`)
  }

  const data = await res.json()

  if (!data || (Array.isArray(data) && data.length === 0)) {
    throw new NotFoundError('No historical data found for this route and airline.')
  }

  return parseDelayStats(Array.isArray(data) ? data[0] : data)
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}
