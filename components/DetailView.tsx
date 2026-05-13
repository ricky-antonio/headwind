import type { DetailPayload } from '@/lib/types'

interface DetailViewProps {
  detail: DetailPayload
  expanded: boolean
}

const REASON_LABELS: Record<string, string> = {
  weather: 'Weather',
  carrier: 'Carrier',
  nas: 'NAS',
  security: 'Security',
  lateAircraft: 'Late Aircraft',
}

export default function DetailView({ detail, expanded }: DetailViewProps) {
  const { stats, tips } = detail

  return (
    <div
      className="overflow-hidden transition-all duration-300"
      style={{
        display: 'grid',
        gridTemplateRows: expanded ? '1fr' : '0fr',
      }}
    >
      <div className="min-h-0">
        <div className="space-y-5 pt-4 border-t">
          {/* On-time performance */}
          <div>
            <h3 className="text-sm font-semibold mb-2">On-Time Performance</h3>
            <div className="space-y-1.5 text-sm">
              <BarRow label="On time" value={stats.onTimePercent} color="bg-green-500" />
              <BarRow label="Delayed" value={stats.delayedPercent} color="bg-amber-400" />
              <BarRow label="Cancelled" value={stats.cancelledPercent} color="bg-red-500" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground font-mono">
              Avg delay: {stats.avgDelayMinutes} min
            </p>
          </div>

          {/* Delay reasons */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Delay Reasons</h3>
            <div className="space-y-1.5 text-sm">
              {Object.entries(stats.delayReasons).map(([key, val]) => (
                <BarRow
                  key={key}
                  label={REASON_LABELS[key] ?? key}
                  value={val}
                  color="bg-blue-400"
                />
              ))}
            </div>
          </div>

          {/* Best / worst months */}
          {(stats.bestMonths.length > 0 || stats.worstMonths.length > 0) && (
            <div className="flex gap-6 text-sm">
              {stats.bestMonths.length > 0 && (
                <div>
                  <span className="font-semibold text-green-600 dark:text-green-400">Best months: </span>
                  <span className="font-mono">{stats.bestMonths.join(', ')}</span>
                </div>
              )}
              {stats.worstMonths.length > 0 && (
                <div>
                  <span className="font-semibold text-red-600 dark:text-red-400">Worst months: </span>
                  <span className="font-mono">{stats.worstMonths.join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {/* AI tips */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Tips</h3>
            <ul className="space-y-1.5">
              {tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Raw stats */}
          <div className="text-xs text-muted-foreground font-mono">
            {stats.totalFlights} flights sampled
            {stats.dataRangeStart && stats.dataRangeEnd && (
              <> · {stats.dataRangeStart} – {stats.dataRangeEnd}</>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BarRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 text-right text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-mono shrink-0">{value}%</span>
    </div>
  )
}
