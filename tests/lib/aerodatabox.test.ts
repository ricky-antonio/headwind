import { describe, it, expect } from 'vitest'
import { parseDelayStats, computeRiskScore, computeVerdict } from '@/lib/aerodatabox'

const validApiResponse = {
  statistics: {
    totalFlights: 500,
    onTimePercent: 72,
    delayedPercent: 20,
    cancelledPercent: 8,
    avgDelayMinutes: 25,
    delayReasons: {
      weather: 30,
      carrier: 40,
      nas: 15,
      security: 5,
      lateAircraft: 10,
    },
    monthly_stats: [
      { month: 'January', delayed_percent: 35 },
      { month: 'February', delayed_percent: 20 },
      { month: 'March', delayed_percent: 10 },
      { month: 'April', delayed_percent: 5 },
    ],
    dataRangeStart: '2022-01-01',
    dataRangeEnd: '2024-12-31',
  },
}

describe('parseDelayStats', () => {
  it('parses a valid API response into correct DelayStats shape', () => {
    const stats = parseDelayStats(validApiResponse)
    expect(stats.totalFlights).toBe(500)
    expect(stats.onTimePercent).toBe(72)
    expect(stats.delayedPercent).toBe(20)
    expect(stats.cancelledPercent).toBe(8)
    expect(stats.avgDelayMinutes).toBe(25)
    expect(stats.delayReasons.weather).toBe(30)
    expect(stats.delayReasons.carrier).toBe(40)
    expect(stats.delayReasons.nas).toBe(15)
    expect(stats.delayReasons.security).toBe(5)
    expect(stats.delayReasons.lateAircraft).toBe(10)
    expect(stats.dataRangeStart).toBe('2022-01-01')
    expect(stats.dataRangeEnd).toBe('2024-12-31')
  })

  it('derives best and worst months from monthly stats', () => {
    const stats = parseDelayStats(validApiResponse)
    expect(stats.bestMonths).toContain('April')
    expect(stats.worstMonths).toContain('January')
  })

  it('handles empty/missing fields without throwing', () => {
    expect(() => parseDelayStats({})).not.toThrow()
    expect(() => parseDelayStats(null)).not.toThrow()
    expect(() => parseDelayStats({ statistics: {} })).not.toThrow()
  })

  it('returns zeros for missing numeric fields', () => {
    const stats = parseDelayStats({})
    expect(stats.totalFlights).toBe(0)
    expect(stats.avgDelayMinutes).toBe(0)
    expect(stats.delayReasons.weather).toBe(0)
  })
})

describe('computeRiskScore', () => {
  it('produces correct values at boundaries', () => {
    const makeStats = (delayed: number, cancelled: number, avgDelay: number) =>
      ({ delayedPercent: delayed, cancelledPercent: cancelled, avgDelayMinutes: avgDelay } as any)

    expect(computeRiskScore(makeStats(0, 0, 0))).toBe(0)
    expect(computeRiskScore(makeStats(20, 8, 25))).toBe(
      Math.min(100, Math.round(20 * 0.5 + 8 * 1.5 + 25 / 3)),
    )
    expect(computeRiskScore(makeStats(100, 100, 300))).toBe(100)
  })

  it('caps score at 100', () => {
    expect(computeRiskScore({ delayedPercent: 100, cancelledPercent: 100, avgDelayMinutes: 999 } as any)).toBe(100)
  })
})

describe('computeVerdict', () => {
  it('maps correctly for low/moderate/high scores', () => {
    expect(computeVerdict(0)).toBe('low')
    expect(computeVerdict(32)).toBe('low')
    expect(computeVerdict(33)).toBe('moderate')
    expect(computeVerdict(65)).toBe('moderate')
    expect(computeVerdict(66)).toBe('high')
    expect(computeVerdict(100)).toBe('high')
  })
})
