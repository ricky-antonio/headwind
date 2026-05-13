export type Verdict = 'low' | 'moderate' | 'high'

export interface DelayStats {
  totalFlights: number
  onTimePercent: number
  delayedPercent: number
  cancelledPercent: number
  avgDelayMinutes: number
  delayReasons: {
    weather: number
    carrier: number
    nas: number
    security: number
    lateAircraft: number
  }
  worstMonths: string[]
  bestMonths: string[]
  dataRangeStart: string
  dataRangeEnd: string
}

export interface AIOutput {
  narrative: string
  tips: string[]
}

export interface DetailPayload {
  stats: DelayStats
  tips: string[]
}

export interface PredictionResult {
  id: string
  origin: string
  destination: string
  airline: string
  date: string
  riskScore: number
  verdict: Verdict
  narrative: string
  detail: DetailPayload
  createdAt: string
}

export interface RecentSearch {
  id: string
  predictionId: string
  origin: string
  destination: string
  airline: string
  date: string
  verdict: Verdict
  searchedAt: string
}

export interface PredictInput {
  origin: string
  destination: string
  airline: string
  date: string
}
