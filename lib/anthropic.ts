import Anthropic from '@anthropic-ai/sdk'
import type { AIOutput, DelayStats } from './types'

const MODEL = 'claude-sonnet-4-20250514'

const SYSTEM_PROMPT = `You are a flight delay risk analyst. Respond with JSON only — no markdown, no preamble, no explanation.
Your response must be a single JSON object with exactly two keys:
- "narrative": one sentence in plain English, maximum 30 words, summarizing the delay risk for this route
- "tips": an array of exactly 3 strings, each a specific and actionable suggestion for the traveler`

function buildUserPrompt(
  origin: string,
  destination: string,
  airline: string,
  stats: DelayStats,
): string {
  return JSON.stringify({
    route: { origin, destination, airline },
    stats,
  })
}

export async function generateRiskNarrative(
  origin: string,
  destination: string,
  airline: string,
  stats: DelayStats,
): Promise<AIOutput> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const attempt = async (): Promise<AIOutput> => {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(origin, destination, airline, stats) }],
    })

    const text = message.content.find((b) => b.type === 'text')?.text ?? ''
    const parsed = JSON.parse(text) as AIOutput

    if (typeof parsed.narrative !== 'string' || !Array.isArray(parsed.tips)) {
      throw new Error('Invalid AI response shape')
    }

    return { narrative: parsed.narrative, tips: parsed.tips.slice(0, 3) }
  }

  try {
    return await attempt()
  } catch {
    return await attempt()
  }
}
