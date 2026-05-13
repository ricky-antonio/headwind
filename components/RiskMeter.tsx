'use client'

import { useEffect, useRef } from 'react'

interface RiskMeterProps {
  score: number
}

const RADIUS = 54
const CIRCUMFERENCE = Math.PI * RADIUS
const CENTER = 70

function scoreToColor(score: number): string {
  if (score < 33) return '#16a34a'
  if (score < 66) return '#d97706'
  return '#dc2626'
}

export default function RiskMeter({ score }: RiskMeterProps) {
  const arcRef = useRef<SVGPathElement>(null)
  const clampedScore = Math.min(100, Math.max(0, score))

  useEffect(() => {
    const arc = arcRef.current
    if (!arc) return

    const targetDash = (clampedScore / 100) * CIRCUMFERENCE
    arc.style.strokeDashoffset = String(CIRCUMFERENCE)

    const start = performance.now()
    const duration = 600

    function step(now: number) {
      const elapsed = Math.min(now - start, duration)
      const progress = elapsed / duration
      const eased = 1 - Math.pow(1 - progress, 3)
      arc!.style.strokeDashoffset = String(CIRCUMFERENCE - eased * targetDash)
      if (elapsed < duration) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [clampedScore])

  const color = scoreToColor(clampedScore)

  return (
    <svg
      width="140"
      height="80"
      viewBox="0 0 140 80"
      role="meter"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Risk score: ${clampedScore}%`}
    >
      {/* background arc */}
      <path
        d={`M ${CENTER - RADIUS} ${CENTER} A ${RADIUS} ${RADIUS} 0 0 1 ${CENTER + RADIUS} ${CENTER}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        className="text-muted-foreground/20"
        strokeLinecap="round"
      />
      {/* foreground arc */}
      <path
        ref={arcRef}
        d={`M ${CENTER - RADIUS} ${CENTER} A ${RADIUS} ${RADIUS} 0 0 1 ${CENTER + RADIUS} ${CENTER}`}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE}
      />
      {/* score label */}
      <text
        x={CENTER}
        y={CENTER - 8}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-mono text-foreground"
        style={{ fontSize: 22, fontWeight: 700, fill: color }}
      >
        {clampedScore}
      </text>
      <text
        x={CENTER}
        y={CENTER + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
      >
        / 100
      </text>
    </svg>
  )
}
