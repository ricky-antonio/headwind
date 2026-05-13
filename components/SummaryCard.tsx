'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import RiskMeter from './RiskMeter'
import DetailView from './DetailView'
import type { PredictionResult } from '@/lib/types'

interface SummaryCardProps {
  result: PredictionResult
}

const verdictLabel: Record<string, string> = {
  low: 'LOW RISK',
  moderate: 'MODERATE RISK',
  high: 'HIGH RISK',
}

const verdictClass: Record<string, string> = {
  low: 'verdict-low',
  moderate: 'verdict-moderate',
  high: 'verdict-high',
}

export default function SummaryCard({ result }: SummaryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleShare() {
    const url = `${window.location.origin}/results/${result.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 space-y-1">
          <div className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-semibold ${verdictClass[result.verdict]}`}>
            {verdictLabel[result.verdict]}
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            {result.origin} → {result.destination} · {result.airline} · {result.date}
          </p>
        </div>
        <RiskMeter score={result.riskScore} />
      </div>

      <p className="text-base leading-relaxed">{result.narrative}</p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? 'Hide breakdown' : 'See full breakdown'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          {copied ? 'Copied!' : 'Share'}
        </Button>
      </div>

      <DetailView detail={result.detail} expanded={expanded} />
    </div>
  )
}
