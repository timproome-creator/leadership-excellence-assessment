import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { scoreAssessment } from '@/lib/scoring'
import { buildRecommendations, toStoredRecommendations } from '@/lib/recommendations/engine'
import type { RaterRatings, RoleLevelKey } from '@/lib/framework/types'

// Backfills result_summary (the persisted IDP) for assessments that were
// completed BEFORE that persistence existed, or that were inserted directly
// via SQL rather than through submitRatings() — which is where the write
// normally happens. Idempotent: only touches rows whose result_summary is
// empty, so it's safe to re-run.
//
// Protected by the service-role key as a bearer token rather than a user
// session: this is a maintenance operation, not something a signed-in
// manager should be able to trigger, and it needs to run across every
// assessment regardless of who owns it.
export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  const expected = `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || auth !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const { data, error } = await db
    .from('wlea_assessments')
    .select('id, subject_name, role_level, self_ratings, manager_ratings, result_summary, status')
    .eq('status', 'complete')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const results: { subject: string; action: string }[] = []

  for (const row of data ?? []) {
    const existing = row.result_summary as Record<string, unknown> | null
    if (existing && Object.keys(existing).length > 0) {
      results.push({ subject: row.subject_name ?? row.id, action: 'skipped (already has IDP)' })
      continue
    }

    const result = scoreAssessment(
      {
        self: (row.self_ratings ?? {}) as RaterRatings,
        line_manager: (row.manager_ratings ?? {}) as RaterRatings,
      },
      row.role_level as RoleLevelKey,
    )
    const stored = toStoredRecommendations(buildRecommendations(result))

    const { error: updateError } = await db
      .from('wlea_assessments')
      .update({ result_summary: stored })
      .eq('id', row.id)
    if (updateError) {
      results.push({ subject: row.subject_name ?? row.id, action: `failed: ${updateError.message}` })
      continue
    }
    results.push({
      subject: row.subject_name ?? row.id,
      action: `backfilled (${stored.developmentPlans.length} development plan(s))`,
    })
  }

  return NextResponse.json({ processed: results.length, results })
}
