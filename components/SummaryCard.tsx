'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import RiskMeter from './RiskMeter'
import DetailView from './DetailView'
import type { PredictionResult } from '@/lib/types'

interface SummaryCardProps {
  result: PredictionResult
}

const verdictConfig: Record<string, { label: string; className: string; bg: string }> = {
  low: {
    label: 'LOW RISK',
    className: 'verdict-low',
    bg: 'bg-green-50 dark:bg-green-950/30',
  },
  moderate: {
    label: 'MODERATE RISK',
    className: 'verdict-moderate',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  high: {
    label: 'HIGH RISK',
    className: 'verdict-high',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
}

export default function SummaryCard({ result }: SummaryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const config = verdictConfig[result.verdict]

  function handleShare() {
    const url = `${window.location.origin}/results/${result.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      {/* Verdict header band */}
      <div className={`${config.bg} px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 border-b`}>
        <div className="flex-1 space-y-1.5">
          <span className={`inline-flex items-center rounded-lg px-3 py-1 text-sm font-bold tracking-wide ${config.className}`}>
            {config.label}
          </span>
          <p className="text-sm text-muted-foreground font-mono">
            {result.origin} → {result.destination}
            <span className="mx-1.5 opacity-40">·</span>
            {result.airline}
            <span className="mx-1.5 opacity-40">·</span>
            {result.date}
          </p>
        </div>
        <RiskMeter score={result.riskScore} />
      </div>

      {/* Narrative */}
      <div className="px-6 py-5">
        <p className="text-base leading-relaxed">{result.narrative}</p>
      </div>

      {/* Actions */}
      <div className="px-6 pb-5 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? 'Hide breakdown' : 'See full breakdown'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          {copied ? '✓ Copied!' : 'Share'}
        </Button>
      </div>

      {/* Detail expand */}
      <div className="px-6 pb-6">
        <DetailView detail={result.detail} expanded={expanded} />
      </div>
    </div>
  )
}
