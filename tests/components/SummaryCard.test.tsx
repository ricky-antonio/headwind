import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SummaryCard from '@/components/SummaryCard'
import type { PredictionResult } from '@/lib/types'

const mockResult: PredictionResult = {
  id: 'test-id',
  origin: 'JFK',
  destination: 'LAX',
  airline: 'American Airlines',
  date: '2025-09-01',
  riskScore: 45,
  verdict: 'moderate',
  narrative: 'This route has moderate delay risk due to carrier issues.',
  detail: {
    stats: {
      totalFlights: 300,
      onTimePercent: 70,
      delayedPercent: 22,
      cancelledPercent: 8,
      avgDelayMinutes: 30,
      delayReasons: { weather: 20, carrier: 40, nas: 20, security: 5, lateAircraft: 15 },
      worstMonths: ['January'],
      bestMonths: ['June'],
      dataRangeStart: '2022-01-01',
      dataRangeEnd: '2024-12-31',
    },
    tips: ['Book morning flights', 'Allow buffer time', 'Check weather'],
  },
  createdAt: '2025-01-01T00:00:00Z',
}

describe('SummaryCard', () => {
  it('renders verdict badge with correct text', () => {
    render(<SummaryCard result={mockResult} />)
    expect(screen.getByText('MODERATE RISK')).toBeInTheDocument()
  })

  it('renders the AI narrative', () => {
    render(<SummaryCard result={mockResult} />)
    expect(screen.getByText(mockResult.narrative)).toBeInTheDocument()
  })

  it('"See full breakdown" button expands the detail view', async () => {
    render(<SummaryCard result={mockResult} />)
    const btn = screen.getByRole('button', { name: /see full breakdown/i })
    await userEvent.click(btn)
    expect(screen.getByRole('button', { name: /hide breakdown/i })).toBeInTheDocument()
  })

  it('"Share" button calls clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(<SummaryCard result={mockResult} />)
    await userEvent.click(screen.getByRole('button', { name: /share/i }))
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('test-id'))
  })
})
