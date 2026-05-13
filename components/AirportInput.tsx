'use client'

import { useState, useRef, useEffect, useId } from 'react'
import { Input } from '@/components/ui/input'
import { filterAirports } from '@/lib/airports'

interface AirportInputProps {
  id: string
  placeholder?: string
  value: string
  onChange: (iata: string) => void
  error?: string
}

export default function AirportInput({ id, placeholder, value, onChange, error }: AirportInputProps) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const suggestions = filterAirports(query)

  // Keep query in sync if value is set externally (e.g. cleared)
  useEffect(() => { if (!value) setQuery('') }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown') { setOpen(true); setHighlighted(0) }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault()
      select(suggestions[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function select(airport: { iata: string; city: string }) {
    setQuery(airport.iata)
    onChange(airport.iata)
    setOpen(false)
    setHighlighted(-1)
  }

  function handleChange(v: string) {
    const upper = v.toUpperCase().slice(0, 3)
    setQuery(upper)
    onChange(upper)
    setOpen(true)
    setHighlighted(-1)
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        placeholder={placeholder}
        value={query}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={open ? listId : undefined}
        aria-activedescendant={highlighted >= 0 ? `${listId}-${highlighted}` : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="font-mono uppercase"
        onChange={e => handleChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 w-72 rounded-md border bg-popover shadow-md overflow-hidden"
        >
          {suggestions.map((airport, i) => (
            <li
              key={airport.iata}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === highlighted}
              onMouseDown={e => { e.preventDefault(); select(airport) }}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex items-center gap-3 px-3 py-2 text-sm cursor-pointer select-none ${
                i === highlighted ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
              }`}
            >
              <span className="font-mono font-semibold w-8 shrink-0">{airport.iata}</span>
              <span className="truncate text-muted-foreground">
                {airport.city}
                <span className="ml-1 text-xs opacity-70">— {airport.name}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
