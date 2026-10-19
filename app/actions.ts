'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { scoreAssessment } from '@/lib/scoring'
import { buildRecommendations, toStoredRecommendations } from '@/lib/recommendations/engine'
import { sendInviteEmails, sendRaterInvite, sendConsoleLinkRecovery } from '@/lib/email/invites'
import { sendReportEmail } from '@/lib/email/report'
import { buildReportPayload } from '@/lib/email/reportPayload'
import { baseUrl } from '@/lib/site'
import { aggregateRaterGroup, aggregateOverall } from '@/lib/aggregation'
import type { RaterRatings, RoleLevelKey } from '@/lib/framework/types'
import type { AssessmentMeta } from '@/components/assessment/SetupStep'

// ────────────────────────────────────────────────────────────────
// Tier-1 async, manager-led workflow, extended with an optional 360 layer.
//
// The assessment table is RLS-locked; the browser never queries it. Every
// operation below runs server-side with the service-role client and is gated
// on an unguessable bearer token:
//   • manager_token → owner console: rate as manager + open the reveal
//   • self_token    → employee: rate as self only, never sees the reveal
//   • wlea_raters.token → peer/direct-report: rate only, never sees anything
//
// Independence guard: the manager is NOT shown the employee's self-scores
// until BOTH sides have submitted. See loadAssessment(). Peer/direct-report
// scores are shown to the manager only in category aggregate, gated at
// MIN_RATERS_FOR_AGGREGATE. See lib/aggregation.ts.
// ────────────────────────────────────────────────────────────────

type Role = 'self' | 'manager'
export type RaterKind = 'peer' | 'direct_report'

interface AssessmentRow {
  id: string
  role_level: RoleLevelKey
  subject_name: string | null
  subject_email: string | null
  creator_email: string | null
  industry: string | null
  business_unit: string | null
  site: string | null
  country: string | null
  status: string
  manager_token: string
  self_token: string
  manager_submitted_at: string | null
  self_submitted_at: string | null
  self_consented_at: string | null
  manager_consented_at: string | null
  self_ratings: RaterRatings
  manager_ratings: RaterRatings
}

interface RaterRow {
  id: string
  assessment_id: string
  rater_type: RaterKind
  rater_name: string | null
  rater_email: string
  token: string
  ratings: RaterRatings
  submitted_at: string | null
  consented_at: string | null
}

const ROW_COLUMNS =
  'id, role_level, subject_name, subject_email, creator_email, industry, business_unit, site, country, status, ' +
  'manager_token, self_token, manager_submitted_at, self_submitted_at, ' +
  'self_consented_at, manager_consented_at, self_ratings, manager_ratings'

const RATER_COLUMNS =
  'id, assessment_id, rater_type, rater_name, rater_email, token, ratings, submitted_at, consented_at'

function metaFromRow(row: AssessmentRow): AssessmentMeta {
  return {
    subjectName: row.subject_name ?? '',
    subjectEmail: row.subject_email ?? '',
    creatorEmail: row.creator_email ?? '',
    roleLevel: row.role_level,
    industry: row.industry ?? '',
    businessUnit: row.business_unit ?? '',
    site: row.site ?? '',
    country: row.country ?? '',
  }
}

function isValidToken(token: string): boolean {
  return /^[0-9a-f-]{36}$/i.test(token)
}

async function findByToken(
  token: string,
): Promise<{ row: AssessmentRow; role: Role } | null> {
  if (!isValidToken(token)) return null
  const service = createServiceClient()
  const { data, error } = await service
    .from('wlea_assessments')
    .select(ROW_COLUMNS)
    .or(`manager_token.eq.${token},self_token.eq.${token}`)
    .maybeSingle()

  if (error || !data) return null
  const row = data as unknown as AssessmentRow
  const role: Role = row.manager_token === token ? 'manager' : 'self'
  return { row, role }
}

// Peer/direct-report tokens live in wlea_raters, a separate child table (the
// self/manager path above is untouched). Resolves the parent assessment row
// too, since the rater view needs the subject name and role bar.
async function findRaterByToken(
  token: string,
): Promise<{ raterRow: RaterRow; assessmentRow: AssessmentRow } | null> {
  if (!isValidToken(token)) return null
  const service = createServiceClient()
  const { data: raterData, error: raterError } = await service
    .from('wlea_raters')
    .select(RATER_COLUMNS)
    .eq('token', token)
    .maybeSingle()

  if (raterError || !raterData) return null
  const raterRow = raterData as unknown as RaterRow

  const { data: assessmentData, error: assessmentError } = await service
    .from('wlea_assessments')
    .select(ROW_COLUMNS)
    .eq('id', raterRow.assessment_id)
    .maybeSingle()

  if (assessmentError || !assessmentData) return null
  return { raterRow, assessmentRow: assessmentData as unknown as AssessmentRow }
}

// ── Create (manager) ─────────────────────────────────────────────
export async function createAssessment(
  meta: AssessmentMeta,
): Promise<{ managerToken?: string; error?: string }> {
  if (!meta.subjectName?.trim() || !meta.roleLevel) {
    return { error: 'A leader name and role are required.' }
  }
  if (!meta.subjectEmail?.trim() || !meta.creatorEmail?.trim()) {
    return { error: 'Both email addresses are required.' }
  }
  // If a manager is signed in, attach the assessment to their account so it
  // shows up in their roster (/console). Resolved server-side from the
  // session cookie, never from a client-supplied id, so it can't be forged.
  const authClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  const service = createServiceClient()
  const { data, error } = await service
    .from('wlea_assessments')
    .insert({
      user_id: user?.id ?? null,
      schema_version: 1,
      module_key: 'wlea',
      module_version: '1.0.0',
      subject_name: meta.subjectName.trim(),
      subject_email: meta.subjectEmail.trim(),
      creator_email: meta.creatorEmail.trim(),
      role_level: meta.roleLevel,
      industry: meta.industry || null,
      business_unit: meta.businessUnit || null,
      site: meta.site || null,
      country: meta.country || null,
      status: 'open',
    })
    .select('manager_token, self_token')
    .single()

  if (error || !data) return { error: error?.message ?? 'Could not create the assessment.' }

  // Invite emails are best-effort: a failure here must not lose the manager's
  // work. They also get their own console link back on-screen after create.
  await sendInviteEmails({
    subjectName: meta.subjectName.trim(),
    subjectEmail: meta.subjectEmail.trim(),
    creatorEmail: meta.creatorEmail.trim(),
    roleLevelKey: meta.roleLevel,
    selfToken: data.self_token as string,
    managerToken: data.manager_token as string,
  })

  return { managerToken: data.manager_token as string }
}

// ── Recover a lost manager console link ───────────────────────────
// The manager console link is only ever handed out at creation (on-screen
// and by email); there is no login. If that moment is lost — email never
// arrived, tab closed before bookmarking — this is the only way back in.
// Always resolves the same way regardless of match, so the response never
// confirms which email addresses have assessments (creator_email is
// self-attested at creation anyway, so this doesn't weaken that trust model).
export async function recoverConsoleLinks(email: string): Promise<{ success: true }> {
  const trimmed = email.trim()
  if (EMAIL_RE.test(trimmed)) {
    const service = createServiceClient()
    const { data } = await service
      .from('wlea_assessments')
      .select('subject_name, manager_token')
      .ilike('creator_email', trimmed)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data && data.length > 0) {
      await sendConsoleLinkRecovery({
        toEmail: trimmed,
        assessments: data.map((r) => ({
          subjectName: (r.subject_name as string) || 'this leader',
          managerToken: r.manager_token as string,
        })),
      })
    }
  }
  return { success: true }
}

// ── Load for the /a/[token] page ─────────────────────────────────
// The shape is discriminated by role. The self view never carries manager data;
// the manager view only carries the employee's self-ratings once both are in,
// plus (if any) the 360 rater roster and category aggregates.
export interface RaterSummary {
  id: string
  raterType: RaterKind
  raterName: string
  submitted: boolean
  token: string
}

export interface AggregateGroup {
  n: number
  sufficientN: boolean
  overallMean: number | null
  byCompetency: { competencyKey: string; mean: number | null }[]
}

export type LoadResult =
  | { kind: 'not_found' }
  | {
      kind: 'self'
      meta: AssessmentMeta
      consented: boolean
      alreadySubmitted: boolean
      myRatings: RaterRatings
    }
  | {
      kind: 'manager'
      meta: AssessmentMeta
      consented: boolean
      selfToken: string
      selfSubmitted: boolean
      managerSubmitted: boolean
      myRatings: RaterRatings
      reveal: { selfRatings: RaterRatings; managerRatings: RaterRatings } | null
      raters: RaterSummary[]
      peerAggregate: AggregateGroup
      directReportAggregate: AggregateGroup
    }
  | {
      // Split into two literal-kind members (not a unioned kind on one
      // member) so downstream `data.kind === 'peer' | ...` checks narrow
      // the discriminated union cleanly.
      kind: 'peer'
      meta: AssessmentMeta
      raterName: string
      consented: boolean
      alreadySubmitted: boolean
      myRatings: RaterRatings
    }
  | {
      kind: 'direct_report'
      meta: AssessmentMeta
      raterName: string
      consented: boolean
      alreadySubmitted: boolean
      myRatings: RaterRatings
    }

function buildAggregate(raterRows: RaterRow[], kind: RaterKind): AggregateGroup {
  const submitted = raterRows.filter((r) => r.rater_type === kind && r.submitted_at)
  const rows = aggregateRaterGroup(submitted.map((r) => r.ratings ?? {}))
  const { mean, sufficientN } = aggregateOverall(rows)
  return {
    n: submitted.length,
    sufficientN,
    overallMean: mean,
    byCompetency: rows.map((r) => ({ competencyKey: r.competencyKey, mean: r.mean })),
  }
}

export async function loadAssessment(token: string): Promise<LoadResult> {
  const found = await findByToken(token)

  if (found) {
    const { row, role } = found
    const meta = metaFromRow(row)
    const selfSubmitted = !!row.self_submitted_at
    const managerSubmitted = !!row.manager_submitted_at

    if (role === 'self') {
      return {
        kind: 'self',
        meta,
        consented: !!row.self_consented_at,
        alreadySubmitted: selfSubmitted,
        myRatings: row.self_ratings ?? {},
      }
    }

    const bothDone = selfSubmitted && managerSubmitted
    const service = createServiceClient()
    const { data: raterData } = await service
      .from('wlea_raters')
      .select(RATER_COLUMNS)
      .eq('assessment_id', row.id)
    const raterRows = (raterData ?? []) as unknown as RaterRow[]

    return {
      kind: 'manager',
      meta,
      consented: !!row.manager_consented_at,
      selfToken: row.self_token,
      selfSubmitted,
      managerSubmitted,
      myRatings: row.manager_ratings ?? {},
      // Independence guard: withhold self-scores from the manager until both submit.
      reveal: bothDone
        ? { selfRatings: row.self_ratings ?? {}, managerRatings: row.manager_ratings ?? {} }
        : null,
      raters: raterRows.map((r) => ({
        id: r.id,
        raterType: r.rater_type,
        raterName: r.rater_name || r.rater_email,
        submitted: !!r.submitted_at,
        token: r.token,
      })),
      peerAggregate: buildAggregate(raterRows, 'peer'),
      directReportAggregate: buildAggregate(raterRows, 'direct_report'),
    }
  }

  // Not a self/manager token, try the 360 rater path.
  const raterFound = await findRaterByToken(token)
  if (!raterFound) return { kind: 'not_found' }
  const { raterRow, assessmentRow } = raterFound

  return {
    kind: raterRow.rater_type,
    meta: metaFromRow(assessmentRow),
    raterName: raterRow.rater_name || '',
    consented: !!raterRow.consented_at,
    alreadySubmitted: !!raterRow.submitted_at,
    myRatings: raterRow.ratings ?? {},
  }
}

// ── Consent: gates rating entry for whichever role the token maps to ─
export async function recordConsent(token: string): Promise<{ success?: boolean; error?: string }> {
  const found = await findByToken(token)
  const service = createServiceClient()
  const now = new Date().toISOString()

  if (found) {
    const { row, role } = found
    const column = role === 'self' ? 'self_consented_at' : 'manager_consented_at'
    const { error } = await service
      .from('wlea_assessments')
      .update({ [column]: now })
      .eq('id', row.id)
    if (error) return { error: error.message }
    return { success: true }
  }

  const raterFound = await findRaterByToken(token)
  if (!raterFound) return { error: 'This assessment link is not valid.' }
  const { error } = await service
    .from('wlea_raters')
    .update({ consented_at: now })
    .eq('id', raterFound.raterRow.id)
  if (error) return { error: error.message }
  return { success: true }
}

// ── Submit ratings for a 360 peer/direct-report rater ────────────
// No scoring, no benchmark write: peer/report ratings only ever feed the
// category aggregate (see buildAggregate in loadAssessment), gated at
// MIN_RATERS_FOR_AGGREGATE, and never enter the self-vs-manager gap engine.
export async function submitRaterRatings(
  token: string,
  ratings: RaterRatings,
): Promise<{ success?: boolean; error?: string }> {
  const raterFound = await findRaterByToken(token)
  if (!raterFound) return { error: 'This assessment link is not valid.' }

  const service = createServiceClient()
  const { error } = await service
    .from('wlea_raters')
    .update({ ratings, submitted_at: new Date().toISOString() })
    .eq('id', raterFound.raterRow.id)

  if (error) return { error: error.message }
  return { success: true }
}

// ── Submit ratings for the rater the token maps to ───────────────
export async function submitRatings(
  token: string,
  ratings: RaterRatings,
): Promise<{ success?: boolean; bothComplete?: boolean; error?: string }> {
  const found = await findByToken(token)
  if (!found) return { error: 'This assessment link is not valid.' }
  const { row, role } = found

  const service = createServiceClient()
  const now = new Date().toISOString()
  const wasComplete = row.status === 'complete' || row.status === 'revealed'

  const patch =
    role === 'self'
      ? { self_ratings: ratings, self_submitted_at: now }
      : { manager_ratings: ratings, manager_submitted_at: now }

  const selfDone = role === 'self' ? true : !!row.self_submitted_at
  const managerDone = role === 'manager' ? true : !!row.manager_submitted_at
  const bothComplete = selfDone && managerDone

  const update: Record<string, unknown> = { ...patch }

  if (bothComplete) {
    const selfRatings = role === 'self' ? ratings : row.self_ratings ?? {}
    const managerRatings = role === 'manager' ? ratings : row.manager_ratings ?? {}
    const result = scoreAssessment(
      { self: selfRatings, line_manager: managerRatings },
      row.role_level,
    )
    update.overall_self = result.overallSelf
    update.overall_manager = result.overallManager
    update.maturity_label = result.maturityLabel
    update.status = 'complete'
    update.completed_at = now
    // Persist the IDP rather than generating it on the fly and discarding it
    // (previously only ever built transiently for the email/PDF). This is
    // the "effort" record the succession thesis needs — captures what
    // development was recommended at THIS point in time, so it can be
    // compared against what actually happened by the next assessment cycle.
    update.result_summary = toStoredRecommendations(buildRecommendations(result))
  }

  const { error } = await service
    .from('wlea_assessments')
    .update(update)
    .eq('id', row.id)

  if (error) return { error: error.message }

  // Benchmark seed: write once, only on the transition into "complete".
  if (bothComplete && !wasComplete) {
    const managerRatings = role === 'manager' ? ratings : row.manager_ratings ?? {}
    const result = scoreAssessment(
      { self: role === 'self' ? ratings : row.self_ratings ?? {}, line_manager: managerRatings },
      row.role_level,
    )
    const scores: Record<string, number> = {}
    for (const [key, r] of Object.entries(managerRatings)) {
      if (typeof r?.score === 'number') scores[key] = r.score
    }
    await service.from('wlea_benchmark_data').insert({
      schema_version: 1,
      module_version: '1.0.0',
      role_level: row.role_level,
      industry: row.industry,
      country: row.country,
      competency_scores: scores,
      overall_manager: result.overallManager,
      maturity_label: result.maturityLabel,
    })

    // Auto-send the finished report to the manager the instant both sides
    // complete, rather than relying on them to notice and click "email me a
    // copy" on the reveal. Best-effort: sendReportEmail never throws.
    if (row.creator_email) {
      const context = [row.site, row.business_unit, row.industry, row.country]
        .filter(Boolean)
        .join(' · ')
      // A manager can add 360 raters from their console at any time, including
      // before both self/manager finish, so some may already have responded by
      // the moment this auto-send fires — fetch real state rather than assuming
      // the 360 layer is always empty here.
      const { data: raterData } = await service
        .from('wlea_raters')
        .select(RATER_COLUMNS)
        .eq('assessment_id', row.id)
      const raterRows = (raterData ?? []) as unknown as RaterRow[]
      const payload = buildReportPayload(
        result,
        row.subject_name ?? 'this leader',
        context,
        `${baseUrl()}/a/${row.manager_token}`,
        buildRecommendations(result),
        buildAggregate(raterRows, 'peer'),
        buildAggregate(raterRows, 'direct_report'),
      )
      await sendReportEmail({ to: row.creator_email, payload })
    }
  }

  return { success: true, bothComplete }
}

// ── Add a 360 rater (manager only) ────────────────────────────────
// Only the manager_token can add raters, since the manager owns the console.
// Flips assessment_mode to '360' on first addition; safe to call repeatedly.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function addRater(
  managerToken: string,
  kind: RaterKind,
  name: string,
  email: string,
): Promise<{ success?: boolean; error?: string; token?: string }> {
  const found = await findByToken(managerToken)
  if (!found || found.role !== 'manager') return { error: 'This console link is not valid.' }
  if (!EMAIL_RE.test(email.trim())) return { error: 'Enter a valid email address.' }
  const { row } = found

  const service = createServiceClient()
  const { data, error } = await service
    .from('wlea_raters')
    .insert({
      assessment_id: row.id,
      rater_type: kind,
      rater_name: name.trim() || null,
      rater_email: email.trim(),
    })
    .select('token')
    .single()

  if (error || !data) return { error: error?.message ?? 'Could not add this rater.' }

  await service
    .from('wlea_assessments')
    .update({ assessment_mode: '360' })
    .eq('id', row.id)
    .eq('assessment_mode', 'two_way')

  // Best-effort, same pattern as the create-time invites.
  await sendRaterInvite({
    subjectName: row.subject_name ?? 'this leader',
    raterEmail: email.trim(),
    raterKind: kind,
    roleLevelKey: row.role_level,
    raterToken: data.token as string,
  })

  return { success: true, token: data.token as string }
}
