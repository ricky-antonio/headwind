import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockMaybeSingle = vi.fn()
const mockSingle = vi.fn()
const mockInsert = vi.fn()
const mockUpsert = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const mockFrom = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

const chainable = {
  select: mockSelect,
  eq: mockEq,
  maybeSingle: mockMaybeSingle,
  single: mockSingle,
  insert: mockInsert,
  upsert: mockUpsert,
  order: mockOrder,
  limit: mockLimit,
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'

  mockFrom.mockReturnValue(chainable)
  mockSelect.mockReturnValue(chainable)
  mockEq.mockReturnValue(chainable)
  mockInsert.mockReturnValue(chainable)
  mockOrder.mockReturnValue(chainable)
  mockLimit.mockReturnValue(chainable)
})

describe('getCachedResult', () => {
  it('returns null on cache miss', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
    const { getCachedResult } = await import('@/lib/db')
    const result = await getCachedResult('JFK', 'LAX', 'AA')
    expect(result).toBeNull()
  })

  it('returns a full PredictionResult on cache hit', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        id: 'abc-123',
        origin: 'JFK',
        destination: 'LAX',
        airline: 'AA',
        date: '2025-06-01',
        risk_score: 45,
        verdict: 'moderate',
        narrative: 'Moderate delays expected.',
        detail: { stats: {}, tips: [] },
        created_at: '2025-01-01T00:00:00Z',
      },
      error: null,
    })
    const { getCachedResult } = await import('@/lib/db')
    const result = await getCachedResult('JFK', 'LAX', 'AA')
    expect(result).not.toBeNull()
    expect(result!.id).toBe('abc-123')
    expect(result!.riskScore).toBe(45)
    expect(result!.verdict).toBe('moderate')
  })
})

describe('saveResult', () => {
  it('inserts the correct shape into the predictions table', async () => {
    const insertedRow = {
      id: 'new-id',
      origin: 'ORD',
      destination: 'MIA',
      airline: 'UA',
      date: '2025-07-01',
      risk_score: 70,
      verdict: 'high',
      narrative: 'High risk route.',
      detail: { stats: {}, tips: ['tip1', 'tip2', 'tip3'] },
      created_at: '2025-01-01T00:00:00Z',
    }
    mockUpsert.mockReturnValue(chainable)
    mockSingle.mockResolvedValue({ data: insertedRow, error: null })

    const { saveResult } = await import('@/lib/db')
    const result = await saveResult({
      origin: 'ORD',
      destination: 'MIA',
      airline: 'UA',
      date: '2025-07-01',
      riskScore: 70,
      verdict: 'high',
      narrative: 'High risk route.',
      detail: { stats: {} as any, tips: ['tip1', 'tip2', 'tip3'] },
    })

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: 'ORD',
        destination: 'MIA',
        risk_score: 70,
        verdict: 'high',
      }),
      expect.objectContaining({ onConflict: 'origin,destination,airline' }),
    )
    expect(result.id).toBe('new-id')
  })
})
