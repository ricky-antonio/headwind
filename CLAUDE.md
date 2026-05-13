# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

HeadWind — a flight delay risk prediction web app. Users enter a route, airline, and date and receive an AI-generated risk assessment (LOW / MODERATE / HIGH) backed by historical flight data from AeroDataBox. Results are cached in Supabase so repeated searches return instantly.

## Commands

```bash
npx create-next-app@latest flight-delay --typescript --tailwind --app --no-src-dir
npm install @supabase/supabase-js @anthropic-ai/sdk next-themes
npx shadcn@latest init   # neutral base color, CSS variables yes
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
npm run dev              # development server
npm run type-check       # TypeScript check
npm run test             # Vitest
npm run test:coverage    # coverage report (lib must be >80%)
npm run build            # production build
```

CI pipeline: `npm ci` → `type-check` → `test` → `build`

## Architecture

### Stack
- Next.js 14 app router, TypeScript strict mode
- Tailwind CSS + shadcn/ui (install components as needed: `button`, `badge`, `input`, `skeleton`, `collapsible`)
- Supabase (Postgres) for caching predictions and search history
- AeroDataBox via RapidAPI for historical flight stats
- Anthropic API (`claude-sonnet-4-6`) for risk narratives
- `next-themes` for dark mode
- Vitest + React Testing Library

### Key structure
```
app/
  page.tsx                    # search form + recent searches feed
  results/[id]/page.tsx       # server-rendered shareable result page
  api/predict/route.ts        # POST — main prediction pipeline
  api/searches/route.ts       # GET — last 10 searches feed
components/                   # SearchForm, SummaryCard, DetailView, RiskMeter, RecentSearches, ErrorBanner
lib/
  types.ts                    # all shared TypeScript types
  aerodatabox.ts              # fetchHistoricalFlights, parseDelayStats, risk scoring
  anthropic.ts                # generateRiskNarrative → AIOutput { narrative, tips[] }
  db.ts                       # getCachedResult, saveResult, Supabase client
tests/lib/                    # unit tests for lib modules (mock all external calls)
tests/components/             # component tests
```

### Data flow
`POST /api/predict` → validate inputs → check Supabase cache → on miss: fetch AeroDataBox → parse `DelayStats` → compute `risk_score` + `verdict` → call Anthropic for `narrative` + `tips` → save to `predictions` table → log to `searches` table → return `PredictionResult`.

### Risk scoring (in `lib/aerodatabox.ts`)
```
base = (delayedPercent * 0.5) + (cancelledPercent * 1.5) + (avgDelayMinutes / 3)
risk_score = Math.min(100, Math.round(base))
verdict = risk_score < 33 ? 'low' : risk_score < 66 ? 'moderate' : 'high'
```

### Core types (`lib/types.ts`)
- `PredictionResult` — full cached result returned to client
- `DetailPayload` — `{ stats: DelayStats, tips: string[] }` stored as JSONB
- `DelayStats` — parsed AeroDataBox response with onTime/delayed/cancelled percents, delay reasons, best/worst months
- `AIOutput` — `{ narrative: string, tips: string[] }` from Anthropic (exactly 3 tips, narrative ≤30 words)
- `Verdict` — `'low' | 'moderate' | 'high'`
- `RecentSearch` — lightweight row for the homepage feed

### Database schema
```sql
-- predictions: cache lookup on (origin, destination, airline, date)
create table predictions (
  id uuid primary key default gen_random_uuid(),
  origin text not null, destination text not null, airline text not null, date date not null,
  risk_score integer not null, verdict text not null, narrative text not null, detail jsonb not null,
  created_at timestamptz default now()
);
create unique index predictions_route_idx on predictions (origin, destination, airline, date);

-- searches: append-only log for the recent searches feed
create table searches (
  id uuid primary key default gen_random_uuid(),
  prediction_id uuid references predictions(id),
  searched_at timestamptz default now()
);
```

## Environment variables

```
RAPIDAPI_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`RAPIDAPI_KEY`, `ANTHROPIC_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` must never reach the client. All external API calls go through Next.js route handlers only.

## Key constraints

- All external API calls belong in `lib/` — never called directly from components or pages
- Supabase service role key only used in route handlers
- Components stay under ~120 lines; split if larger
- Anthropic call: system prompt instructs JSON-only response; parse with try/catch; retry once on failure before returning 500
- AeroDataBox returns no data → 404 with message "No historical data found for this route and airline."
- `RiskMeter` uses SVG arc, animated on mount over 600ms, `role="meter"` with aria attributes
- DetailView expand/collapse uses CSS `grid-template-rows` transition (not JS height)
- Verdict colors use CSS variables (not hardcoded hex) so they work in both light/dark themes
- Loading states use skeleton loaders, not spinners
- No user auth, no live flight tracking, no booking links

## Build order (greenfield)

1. `lib/types.ts` → `lib/aerodatabox.ts` (+ tests) → `lib/anthropic.ts` (+ tests) → `lib/db.ts` (+ tests)
2. `app/api/predict/route.ts` — test end-to-end with real API before building UI
3. Components: `RiskMeter` → `SummaryCard` → `DetailView` → `SearchForm` → `RecentSearches`
4. `app/page.tsx` → `app/results/[id]/page.tsx`
