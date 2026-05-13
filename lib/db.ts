import { createClient } from '@supabase/supabase-js'
import type { DetailPayload, PredictionResult, RecentSearch, Verdict } from './types'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

// Cache key is (origin, destination, airline) — date is not included because
// historical delay stats for a route don't change based on travel date.
export async function getCachedResult(
  origin: string,
  destination: string,
  airline: string,
): Promise<PredictionResult | null> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('origin', origin)
    .eq('destination', destination)
    .eq('airline', airline)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return rowToPrediction(data)
}

export async function saveResult(result: Omit<PredictionResult, 'id' | 'createdAt'>): Promise<PredictionResult> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('predictions')
    .upsert(
      {
        origin: result.origin,
        destination: result.destination,
        airline: result.airline,
        date: result.date,
        risk_score: result.riskScore,
        verdict: result.verdict,
        narrative: result.narrative,
        detail: result.detail,
      },
      { onConflict: 'origin,destination,airline' },
    )
    .select()
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Failed to save prediction')
  return rowToPrediction(data)
}

export async function logSearch(predictionId: string): Promise<void> {
  const supabase = getClient()
  await supabase.from('searches').insert({ prediction_id: predictionId })
}

export async function getRecentSearches(): Promise<RecentSearch[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('searches')
    .select('id, searched_at, predictions(id, origin, destination, airline, date, verdict)')
    .order('searched_at', { ascending: false })
    .limit(10)

  if (error || !data) return []

  return data
    .map((row: any) => {
      const p = row.predictions
      if (!p) return null
      return {
        id: row.id as string,
        predictionId: p.id as string,
        origin: p.origin as string,
        destination: p.destination as string,
        airline: p.airline as string,
        date: p.date as string,
        verdict: p.verdict as Verdict,
        searchedAt: row.searched_at as string,
      } satisfies RecentSearch
    })
    .filter(Boolean) as RecentSearch[]
}

export async function getPredictionById(id: string): Promise<PredictionResult | null> {
  const supabase = getClient()
  const { data, error } = await supabase.from('predictions').select('*').eq('id', id).maybeSingle()
  if (error || !data) return null
  return rowToPrediction(data)
}

function rowToPrediction(row: any): PredictionResult {
  return {
    id: row.id,
    origin: row.origin,
    destination: row.destination,
    airline: row.airline,
    date: row.date,
    riskScore: row.risk_score,
    verdict: row.verdict as Verdict,
    narrative: row.narrative,
    detail: row.detail as DetailPayload,
    createdAt: row.created_at,
  }
}
