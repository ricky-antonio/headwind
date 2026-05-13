'use client'

import { useState, useRef, useEffect, useId } from 'react'
import { Input } from '@/components/ui/input'
import { filterAirlines } from '@/lib/airlines'

interface AirlineInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export default function AirlineInput({ value, onChange, error }: AirlineInputProps) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const suggestions = filterAirlines(value)

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
      select(suggestions[highlighted].name)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function select(name: string) {
    onChange(name)
    setOpen(false)
    setHighlighted(-1)
    inputRef.current?.blur()
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        id="airline"
        placeholder="American Airlines"
        value={value}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={open ? listId : undefined}
        aria-activedescendant={highlighted >= 0 ? `${listId}-${highlighted}` : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? 'airline-error' : undefined}
        onChange={e => { onChange(e.target.value); setOpen(true); setHighlighted(-1) }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md overflow-hidden"
        >
          {suggestions.map((airline, i) => (
            <li
              key={airline.iata}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === highlighted}
              onMouseDown={e => { e.preventDefault(); select(airline.name) }}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer select-none ${
                i === highlighted ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
              }`}
            >
              <span>{airline.name}</span>
              <span className="font-mono text-xs text-muted-foreground ml-3">{airline.iata}</span>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p id="airline-error" className="text-xs text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
