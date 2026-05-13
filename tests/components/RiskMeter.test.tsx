import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RiskMeter from '@/components/RiskMeter'

describe('RiskMeter', () => {
  it('renders with correct aria-valuenow', () => {
    render(<RiskMeter score={45} />)
    const meter = screen.getByRole('meter')
    expect(meter).toHaveAttribute('aria-valuenow', '45')
    expect(meter).toHaveAttribute('aria-valuemin', '0')
    expect(meter).toHaveAttribute('aria-valuemax', '100')
  })

  it('renders numeric score in the SVG', () => {
    render(<RiskMeter score={72} />)
    expect(screen.getByText('72')).toBeInTheDocument()
  })

  it('clamps score above 100', () => {
    render(<RiskMeter score={150} />)
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100')
  })

  it('clamps score below 0', () => {
    render(<RiskMeter score={-10} />)
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0')
  })
})
