'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

interface ThemeToggleProps {
  transparent?: boolean
}

export default function ThemeToggle({ transparent = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-9 h-9" />

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Toggle dark mode"
      className={transparent ? 'text-white hover:text-white hover:bg-white/20' : ''}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </Button>
  )
}
