import type { DelayStats } from './types'

const AERODATABOX_HOST = 'aerodatabox.p.rapidapi.com'
const BASE_URL = `https://${AERODATABOX_HOST}`
const ON_TIME_THRESHOLD_MINUTES = 15

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

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

function matchesAirline(flight: AeroFlight, airlineQuery: string): boolean {
  const q = airlineQuery.toLowerCase().trim()
  const name = (flight.airline?.name ?? '').toLowerCase()
  const iata = (flight.airline?.iata ?? '').toLowerCase()
  const icao = (flight.airline?.icao ?? '').toLowerCase()
  return name.includes(q) || iata === q || icao === q || q.includes(name) || name.includes(q.split(' ')[0])
}

function delayMinutes(flight: AeroFlight): number | null {
  const scheduled = flight.departure?.scheduledTime?.utc
  const revised = flight.departure?.revisedTime?.utc ?? flight.departure?.runwayTime?.utc
  if (!scheduled || !revised) return null
  return (new Date(revised).getTime() - new Date(scheduled).getTime()) / 60000
}

function isCancelled(flight: AeroFlight): boolean {
  return flight.status === 'Canceled' || flight.status === 'CanceledUncertain'
}

// Build 12-hour window pairs for the past N days
function buildWindows(days: number): Array<{ from: string; to: string }> {
  const windows: Array<{ from: string; to: string }> = []
  for (let d = 1; d <= days; d++) {
    const date = new Date()
    date.setDate(date.getDate() - d)
    const ymd = date.toISOString().slice(0, 10)
    windows.push({ from: `${ymd}T00:00`, to: `${ymd}T12:00` })
    windows.push({ from: `${ymd}T12:00`, to: `${ymd}T23:59` })
  }
  return windows
}

async function fetchWindow(
  apiKey: string,
  origin: string,
  from: string,
  to: string,
): Promise<AeroFlight[]> {
  const url = `${BASE_URL}/flights/airports/iata/${origin}/${from}/${to}?direction=Departure&withLeg=true`
  const res = await fetch(url, {
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': AERODATABOX_HOST,
    },
  })
  if (res.status === 429) return [] // rate limited — skip window
  if (!res.ok) return []
  const data = await res.json()
  return (data.departures ?? []) as AeroFlight[]
}

export function computeDelayStats(flights: AeroFlight[]): DelayStats {
  const total = flights.length
  if (total === 0) {
    return {
      totalFlights: 0, onTimePercent: 0, delayedPercent: 0, cancelledPercent: 0,
      avgDelayMinutes: 0, delayReasons: { weather: 0, carrier: 0, nas: 0, security: 0, lateAircraft: 0 },
      worstMonths: [], bestMonths: [], dataRangeStart: '', dataRangeEnd: '',
    }
  }

  const cancelled = flights.filter(isCancelled)
  const departed = flights.filter(f => !isCancelled(f))
  const delays = departed.map(delayMinutes).filter((d): d is number => d !== null)
  const delayed = delays.filter(d => d >= ON_TIME_THRESHOLD_MINUTES)
  const onTime = delays.filter(d => d < ON_TIME_THRESHOLD_MINUTES)
  const avgDelay = delayed.length > 0 ? delayed.reduce((a, b) => a + b, 0) / delayed.length : 0

  // Group by month for best/worst
  const monthDelayMap: Record<string, number[]> = {}
  flights.forEach(f => {
    const utc = f.departure?.scheduledTime?.utc
    if (!utc) return
    const month = new Date(utc).toLocaleString('en-US', { month: 'long' })
    if (!monthDelayMap[month]) monthDelayMap[month] = []
    const d = isCancelled(f) ? 9999 : (delayMinutes(f) ?? 0)
    monthDelayMap[month].push(d)
  })
  const monthAvgs = Object.entries(monthDelayMap).map(([month, ds]) => ({
    month,
    avg: ds.reduce((a, b) => a + b, 0) / ds.length,
  })).sort((a, b) => a.avg - b.avg)

  const dates = flights
    .map(f => f.departure?.scheduledTime?.utc)
    .filter(Boolean)
    .sort() as string[]

  return {
    totalFlights: total,
    onTimePercent: Math.round((onTime.length / (departed.length || 1)) * 100),
    delayedPercent: Math.round((delayed.length / (departed.length || 1)) * 100),
    cancelledPercent: Math.round((cancelled.length / total) * 100),
    avgDelayMinutes: Math.round(avgDelay),
    delayReasons: { weather: 0, carrier: 0, nas: 0, security: 0, lateAircraft: 0 },
    worstMonths: monthAvgs.slice(-2).reverse().map(m => m.month),
    bestMonths: monthAvgs.slice(0, 2).map(m => m.month),
    dataRangeStart: dates[0]?.slice(0, 10) ?? '',
    dataRangeEnd: dates[dates.length - 1]?.slice(0, 10) ?? '',
  }
}

export async function fetchHistoricalFlights(
  origin: string,
  destination: string,
  airline: string,
): Promise<DelayStats> {
  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) throw new Error('RAPIDAPI_KEY is not set')

  const windows = buildWindows(7) // 7 days × 2 windows = 14 calls max
  const matchingFlights: AeroFlight[] = []

  for (let i = 0; i < windows.length; i++) {
    const { from, to } = windows[i]
    const flights = await fetchWindow(apiKey, origin, from, to)
    const matches = flights.filter(
      f =>
        f.arrival?.airport?.iata?.toUpperCase() === destination.toUpperCase() &&
        matchesAirline(f, airline),
    )
    matchingFlights.push(...matches)

    // After the first full day (2 windows), bail early if no matches at all —
    // saves the remaining 12 calls for a route/airline combo with no data.
    if (i === 1 && matchingFlights.length === 0) {
      throw new NotFoundError('No historical data found for this route and airline.')
    }

    // Small pause to respect per-second rate limit
    await new Promise(r => setTimeout(r, 150))
  }

  if (matchingFlights.length < 5) {
    throw new NotFoundError('No historical data found for this route and airline.')
  }

  return computeDelayStats(matchingFlights)
}

// Internal types for AeroDataBox flight records
interface AeroFlight {
  departure?: {
    scheduledTime?: { utc?: string; local?: string }
    revisedTime?: { utc?: string; local?: string }
    runwayTime?: { utc?: string; local?: string }
    quality?: string[]
  }
  arrival?: {
    airport?: { iata?: string; icao?: string; name?: string }
  }
  airline?: { name?: string; iata?: string; icao?: string }
  status?: string
  number?: string
}
