// ────────────────────────────────────────────────────────────────
// 360-mode aggregation: peer and direct-report scores are averaged
// within their category and gated on a minimum respondent count.
// Deliberately separate from scoring.ts's self-vs-manager gap engine,
// which stays untouched. Standard 360 practice, not a stylistic
// choice: showing an individual peer/report score at low N de-
// anonymises the rater and kills honest feedback.
// ────────────────────────────────────────────────────────────────

import { COMPETENCIES } from './framework'
import type { RaterRatings } from './framework/types'

export const MIN_RATERS_FOR_AGGREGATE = 3

export interface AggregateCompetencyScore {
  competencyKey: string
  mean: number | null // null when n is below the minimum
  n: number
  sufficientN: boolean
}

export function aggregateRaterGroup(submitted: RaterRatings[]): AggregateCompetencyScore[] {
  return COMPETENCIES.map((c) => {
    const scores = submitted
      .map((r) => r[c.key]?.score)
      .filter((s): s is number => typeof s === 'number')
    const n = scores.length
    const sufficientN = n >= MIN_RATERS_FOR_AGGREGATE
    const mean = sufficientN ? scores.reduce((a, b) => a + b, 0) / n : null
    return { competencyKey: c.key, mean, n, sufficientN }
  })
}

export function aggregateOverall(rows: AggregateCompetencyScore[]): { mean: number | null; sufficientN: boolean } {
  const usable = rows.filter((r) => r.sufficientN && r.mean !== null)
  if (usable.length === 0) return { mean: null, sufficientN: false }
  const mean = usable.reduce((sum, r) => sum + (r.mean as number), 0) / usable.length
  return { mean, sufficientN: true }
}
