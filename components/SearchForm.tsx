'use client'

import { useState, FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import AirlineInput from './AirlineInput'
import type { PredictInput } from '@/lib/types'

interface SearchFormProps {
  onSubmit: (input: PredictInput) => Promise<void>
  loading: boolean
}

const IATA_RE = /^[A-Z]{3}$/

function today(): string {
  return new Date().toISOString().split('T')[0]
}

export default function SearchForm({ onSubmit, loading }: SearchFormProps) {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [airline, setAirline] = useState('')
  const [date, setDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!IATA_RE.test(origin.toUpperCase())) e.origin = 'Enter a 3-letter IATA code (e.g. JFK)'
    if (!IATA_RE.test(destination.toUpperCase())) e.destination = 'Enter a 3-letter IATA code (e.g. LAX)'
    if (!airline.trim()) e.airline = 'Airline is required'
    if (!date) {
      e.date = 'Date is required'
    } else if (new Date(date) < new Date(today())) {
      e.date = 'Date must not be in the past'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      airline: airline.trim(),
      date,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="origin"
          label="Origin"
          placeholder="JFK"
          value={origin}
          onChange={(v) => setOrigin(v.toUpperCase().slice(0, 3))}
          error={errors.origin}
          className="font-mono uppercase"
        />
        <Field
          id="destination"
          label="Destination"
          placeholder="LAX"
          value={destination}
          onChange={(v) => setDestination(v.toUpperCase().slice(0, 3))}
          error={errors.destination}
          className="font-mono uppercase"
        />
        <div className="space-y-1">
          <label htmlFor="airline" className="text-sm font-medium">Airline</label>
          <AirlineInput value={airline} onChange={setAirline} error={errors.airline} />
        </div>
        <Field
          id="date"
          label="Date"
          type="date"
          value={date}
          onChange={setDate}
          min={today()}
          error={errors.date}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? 'Checking…' : 'Check flight risk'}
      </Button>
    </form>
  )
}

interface FieldProps {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  error?: string
  type?: string
  min?: string
  className?: string
}

function Field({ id, label, placeholder, value, onChange, error, type = 'text', min, className }: FieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={className}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
