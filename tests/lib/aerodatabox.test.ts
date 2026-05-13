import { describe, it, expect } from 'vitest'
import { computeDelayStats, computeRiskScore, computeVerdict } from '@/lib/aerodatabox'

function makeFlights(overrides: Array<Partial<{
  scheduledUtc: string
  revisedUtc: string
  status: string
  destIata: string
  airlineIata: string
  airlineName: string
}>>) {
  return overrides.map(o => ({
    departure: {
      scheduledTime: { utc: o.scheduledUtc ?? '2026-04-01 10:00Z' },
      revisedTime: o.revisedUtc ? { utc: o.revisedUtc } : undefined,
    },
    arrival: { airport: { iata: o.destIata ?? 'LAX' } },
    airline: { iata: o.airlineIata ?? 'AA', name: o.airlineName ?? 'American Airlines' },
    status: o.status ?? 'Departed',
  }))
}

describe('computeDelayStats', () => {
  it('returns zeros for empty flight list', () => {
    const stats = computeDelayStats([])
    expect(stats.totalFlights).toBe(0)
    expect(stats.onTimePercent).toBe(0)
  })

  it('counts on-time flights (delay < 15 min)', () => {
    const flights = makeFlights([
      { revisedUtc: '2026-04-01 10:05Z' }, // 5 min — on time
      { revisedUtc: '2026-04-01 10:05Z' }, // 5 min — on time
      { revisedUtc: '2026-04-01 10:20Z' }, // 20 min — delayed
    ])
    const stats = computeDelayStats(flights)
    expect(stats.totalFlights).toBe(3)
    expect(stats.onTimePercent).toBe(67)
    expect(stats.delayedPercent).toBe(33)
    expect(stats.cancelledPercent).toBe(0)
  })

  it('counts cancelled flights correctly', () => {
    const flights = makeFlights([
      { status: 'Canceled' },
      { status: 'CanceledUncertain' },
      { revisedUtc: '2026-04-01 10:05Z' },
    ])
    const stats = computeDelayStats(flights)
    expect(stats.cancelledPercent).toBe(67)
    expect(stats.totalFlights).toBe(3)
  })

  it('computes average delay from delayed flights only', () => {
    const flights = makeFlights([
      { revisedUtc: '2026-04-01 10:30Z' }, // 30 min delay
      { revisedUtc: '2026-04-01 10:50Z' }, // 50 min delay
    ])
    const stats = computeDelayStats(flights)
    expect(stats.avgDelayMinutes).toBe(40)
  })

  it('handles missing revisedTime gracefully', () => {
    const flights = makeFlights([{}, {}, {}]) // no revisedTime
    expect(() => computeDelayStats(flights)).not.toThrow()
  })
})

describe('computeRiskScore', () => {
  it('produces correct values using the formula', () => {
    const stats = { delayedPercent: 20, cancelledPercent: 8, avgDelayMinutes: 30 } as any
    const expected = Math.min(100, Math.round(20 * 0.5 + 8 * 1.5 + 30 / 3))
    expect(computeRiskScore(stats)).toBe(expected)
  })

  it('caps score at 100', () => {
    expect(computeRiskScore({ delayedPercent: 100, cancelledPercent: 100, avgDelayMinutes: 999 } as any)).toBe(100)
  })

  it('returns 0 for perfect stats', () => {
    expect(computeRiskScore({ delayedPercent: 0, cancelledPercent: 0, avgDelayMinutes: 0 } as any)).toBe(0)
  })
})

describe('computeVerdict', () => {
  it('maps correctly for low/moderate/high boundaries', () => {
    expect(computeVerdict(0)).toBe('low')
    expect(computeVerdict(32)).toBe('low')
    expect(computeVerdict(33)).toBe('moderate')
    expect(computeVerdict(65)).toBe('moderate')
    expect(computeVerdict(66)).toBe('high')
    expect(computeVerdict(100)).toBe('high')
  })
})
