'use client'

import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

interface SiteHeaderProps {
  transparent?: boolean
}

export default function SiteHeader({ transparent = false }: SiteHeaderProps) {
  return (
    <header className={`w-full z-50 ${transparent ? 'absolute top-0 left-0' : 'border-b bg-background/95 backdrop-blur'}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className={`flex items-center gap-2 font-bold text-lg tracking-tight ${transparent ? 'text-white' : ''}`}>
          <span className="text-2xl">✈</span>
          HeadWind
        </Link>
        <div className="flex items-center gap-3">
          <span className={`text-sm hidden sm:block ${transparent ? 'text-white/70' : 'text-muted-foreground'}`}>
            Flight delay risk predictor
          </span>
          <ThemeToggle transparent={transparent} />
        </div>
      </div>
    </header>
  )
}
