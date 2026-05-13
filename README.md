# HeadWind ✈️

**Know before you fly.** HeadWind gives you an AI-powered delay risk prediction for any flight route — backed by real historical departure data, not vibes.

## What it does

Enter an origin, destination, airline, and travel date. HeadWind pulls historical flight records for that route, computes a risk score, and returns a **LOW / MODERATE / HIGH** verdict alongside an AI-generated narrative and practical travel tips.

Results are cached by route so repeated searches are instant.

## Tech stack

- **Next.js 14** (App Router, TypeScript strict mode)
- **Tailwind CSS v4** + shadcn/ui
- **Supabase** (Postgres) — prediction cache + search history
- **AeroDataBox via RapidAPI** — historical departure flight records
- **Anthropic Claude** (`claude-sonnet-4-6`) — risk narrative and tips
- **Vitest** + React Testing Library

## Running locally

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy the environment variables and fill them in:

```bash
cp .env.example .env.local
```

```
RAPIDAPI_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

3. Run the Supabase migrations (one-time setup):

```sql
create table predictions (
  id uuid primary key default gen_random_uuid(),
  origin text not null, destination text not null, airline text not null, date date not null,
  risk_score integer not null, verdict text not null, narrative text not null, detail jsonb not null,
  created_at timestamptz default now()
);
create unique index predictions_route_idx on predictions (origin, destination, airline);

create table searches (
  id uuid primary key default gen_random_uuid(),
  prediction_id uuid references predictions(id),
  searched_at timestamptz default now()
);
```

4. Start the dev server:

```bash
npm run dev
```

## Commands

```bash
npm run dev          # development server
npm run build        # production build
npm run type-check   # TypeScript check
npm run test         # Vitest unit tests
npm run test:coverage
```

## How risk scoring works

```
base = (delayedPercent × 0.5) + (cancelledPercent × 1.5) + (avgDelayMinutes ÷ 3)
riskScore = Math.min(100, Math.round(base))

< 33  → LOW
< 66  → MODERATE
≥ 66  → HIGH
```

Historical data is pulled from the past 24 hours of departures for the route. Cache key is `(origin, destination, airline)` — date is excluded because historical delay stats don't change based on travel date.
