# Warehouse Leadership Excellence Assessment (WLEA)

A DC Upside assessment module. Two-rater (self + line manager) leadership
competency assessment: 13 competencies across role levels (Junior PM, PM, DC
Manager, Executive), a reveal/gap analysis, and rule-based development plans on
the 70/20/10 model.

Part of the [Virtual Supply Chain Exec](../CLAUDE.md) suite. Framework and
scoring logic live in `lib/framework/*` and `lib/scoring.ts`; the domain
rationale is in [`docs/METHODOLOGY_LIBRARY.md`](../docs/METHODOLOGY_LIBRARY.md).

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
```

Apply the database schema once, in the Supabase SQL Editor on the shared
project: run `supabase/schema.sql`. The `profiles` table and auth trigger
already exist on the shared project and are intentionally NOT re-created by
this file. After applying, confirm in the Supabase dashboard that RLS shows
**Enabled** on both `wlea_assessments` and `wlea_benchmark_data`.

## Commands

```bash
npm run dev          # Next.js dev server (localhost:3000)
npm run build        # production build
npm run lint         # ESLint via next lint
npm run type-check   # tsc --noEmit
```

## Environment variables

See `.env.local.example` for the full list and per-variable notes. Summary:

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Writes the RLS-locked benchmark seed |
| `RESEND_API_KEY` | server only | Emails the completed report |

## Data model

Two tables (`supabase/schema.sql`):

- **`wlea_assessments`** — Layer 1, user-owned assessment instances. Anonymous
  runs are allowed (`user_id` null). RLS-protected per user.
- **`wlea_benchmark_data`** — Layer 2, anonymised benchmark seed. RLS enabled
  with no policies, so it is reachable only by the server-side service role.
  Never returned to clients.

Persistence is best-effort and never blocks the on-screen reveal
(`app/actions.ts`, called from `components/assessment/AssessmentShell.tsx`).

## Status

Phase 1 (scoring) and Phase 2 (rule-based recommendations + 70/20/10
development plans) are built and verified. Phase 3 (DB-backed framework tables,
multi-rater 360) is deferred. Not yet pilot-validated: the competency framework
and gap interpretation still need sign-off from a credible I/O-psychology or
ops-leadership reviewer before the tool is put in front of real managers.
