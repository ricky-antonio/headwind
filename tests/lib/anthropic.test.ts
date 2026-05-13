import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateRiskNarrative } from '@/lib/anthropic'

const mockCreate = vi.fn()

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(function () {
    return { messages: { create: mockCreate } }
  }),
}))

const mockStats = {
  totalFlights: 300,
  onTimePercent: 70,
  delayedPercent: 22,
  cancelledPercent: 8,
  avgDelayMinutes: 30,
  delayReasons: { weather: 20, carrier: 40, nas: 20, security: 5, lateAircraft: 15 },
  worstMonths: ['January', 'February'],
  bestMonths: ['June', 'July'],
  dataRangeStart: '2022-01-01',
  dataRangeEnd: '2024-12-31',
}

const validResponse = {
  content: [
    {
      type: 'text',
      text: JSON.stringify({
        narrative: 'This route has frequent weather delays in winter.',
        tips: ['Book morning flights', 'Allow connection buffer', 'Check weather day before'],
      }),
    },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.ANTHROPIC_API_KEY = 'test-key'
})

describe('generateRiskNarrative', () => {
  it('sends correct model in the request', async () => {
    mockCreate.mockResolvedValue(validResponse)
    await generateRiskNarrative('JFK', 'LAX', 'AA', mockStats)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'claude-sonnet-4-6' }),
    )
  })

  it('parses valid JSON response into AIOutput', async () => {
    mockCreate.mockResolvedValue(validResponse)
    const result = await generateRiskNarrative('JFK', 'LAX', 'AA', mockStats)
    expect(result.narrative).toBe('This route has frequent weather delays in winter.')
    expect(result.tips).toHaveLength(3)
    expect(result.tips[0]).toBe('Book morning flights')
  })

  it('retries once on JSON parse failure', async () => {
    mockCreate
      .mockResolvedValueOnce({ content: [{ type: 'text', text: 'not json' }] })
      .mockResolvedValueOnce(validResponse)

    const result = await generateRiskNarrative('JFK', 'LAX', 'AA', mockStats)
    expect(mockCreate).toHaveBeenCalledTimes(2)
    expect(result.narrative).toBeTruthy()
  })

  it('throws after two consecutive failures', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'bad json' }] })
    await expect(generateRiskNarrative('JFK', 'LAX', 'AA', mockStats)).rejects.toThrow()
    expect(mockCreate).toHaveBeenCalledTimes(2)
  })
})
