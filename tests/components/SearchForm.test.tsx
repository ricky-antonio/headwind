import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchForm from '@/components/SearchForm'

function setup(loading = false) {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  render(<SearchForm onSubmit={onSubmit} loading={loading} />)
  return { onSubmit }
}

async function fillValidForm() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateStr = tomorrow.toISOString().split('T')[0]

  await userEvent.type(screen.getByLabelText('Origin'), 'JFK')
  await userEvent.type(screen.getByLabelText('Destination'), 'LAX')
  await userEvent.type(screen.getByLabelText('Airline'), 'American Airlines')
  await userEvent.type(screen.getByLabelText('Date'), dateStr)
  return dateStr
}

describe('SearchForm', () => {
  it('shows validation error for invalid IATA code', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: /check flight risk/i }))
    expect(screen.getAllByText(/3-letter IATA/i).length).toBeGreaterThan(0)
  })

  it('shows validation error for past date', async () => {
    setup()
    await userEvent.type(screen.getByLabelText('Origin'), 'JFK')
    await userEvent.type(screen.getByLabelText('Destination'), 'LAX')
    await userEvent.type(screen.getByLabelText('Airline'), 'Delta')
    await userEvent.type(screen.getByLabelText('Date'), '2020-01-01')
    await userEvent.click(screen.getByRole('button', { name: /check flight risk/i }))
    expect(screen.getByText(/not be in the past/i)).toBeInTheDocument()
  })

  it('disables submit button while loading', () => {
    setup(true)
    expect(screen.getByRole('button', { name: /checking/i })).toBeDisabled()
  })

  it('calls onSubmit with correct payload on valid input', async () => {
    const { onSubmit } = setup()
    const dateStr = await fillValidForm()
    await userEvent.click(screen.getByRole('button', { name: /check flight risk/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      origin: 'JFK',
      destination: 'LAX',
      airline: 'American Airlines',
      date: dateStr,
    })
  })
})
