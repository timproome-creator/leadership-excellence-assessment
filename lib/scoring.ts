// ────────────────────────────────────────────────────────────────
// WLEA scoring engine — pure functions over ratings.
// Produces competency / cluster / overall scores, the two-way gap
// classification, traffic lights, critical-failure flags, strengths,
// development priorities and business risks.
// ────────────────────────────────────────────────────────────────

import { WLEA, maturityLabel } from './framework'
import { roleLevel } from './framework/scale'
import type {
  AllRatings,
  AssessmentResult,
  BusinessRisk,
  Cluster,
  ClusterResult,
  Competency,
  CompetencyResult,
  GapClass,
  RoleLevelKey,
  TrafficLight,
} from './framework/types'

function num(v: number | null | undefined): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

function weightedMean(
  rows: { score: number | null; weight: number }[],
): number | null {
  let sum = 0
  let wsum = 0
  for (const r of rows) {
    if (r.score === null) continue
    sum += r.score * r.weight
    wsum += r.weight
  }
  return wsum > 0 ? sum / wsum : null
}

function trafficLight(score: number | null, target: number): TrafficLight | null {
  if (score === null) return null
  if (score < target) return 'red'
  if (score === target) return 'amber'
  return 'green'
}

function classifyGap(
  self: number | null,
  manager: number | null,
  target: number,
): GapClass | null {
  if (manager === null) return null
  const belowBar = manager < target
  const strong = manager >= target + 1

  if (belowBar) {
    // Person thinks they meet the bar but the manager disagrees → blind spot.
    if (self !== null && self >= target) return 'blind_spot'
    return 'development_priority'
  }
  if (strong) {
    // Manager sees strength the person undervalues → hidden strength.
    if (self !== null && self <= target) return 'hidden_strength'
    if (self !== null && self >= target + 1) return 'aligned_strength'
    return 'aligned_strength'
  }
  return 'on_track'
}

export function scoreAssessment(
  ratings: AllRatings,
  roleLevelKey: RoleLevelKey,
): AssessmentResult {
  const level = roleLevel(roleLevelKey)

  const competencies: CompetencyResult[] = WLEA.competencies.map((c: Competency) => {
    const self = num(ratings.self?.[c.key]?.score)
    const manager = num(ratings.line_manager?.[c.key]?.score)
    const target = c.anchors[roleLevelKey].target

    const gapToBar = manager === null ? null : target - manager
    const selfManagerGap = self === null || manager === null ? null : manager - self
    const criticalFailure = c.isCritical && manager !== null && manager <= 2

    return {
      competency: c,
      selfScore: self,
      managerScore: manager,
      target,
      gapToBar,
      selfManagerGap,
      trafficLight: trafficLight(manager, target),
      gapClass: classifyGap(self, manager, target),
      criticalFailure,
    }
  })

  // ── Cluster rollups ──────────────────────────────────────────
  const clusters: ClusterResult[] = WLEA.clusters
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((cl: Cluster) => {
      const members = competencies.filter((r) => r.competency.clusterKey === cl.key)
      return {
        cluster: cl,
        selfScore: weightedMean(
          members.map((m) => ({ score: m.selfScore, weight: m.competency.weight })),
        ),
        managerScore: weightedMean(
          members.map((m) => ({ score: m.managerScore, weight: m.competency.weight })),
        ),
        competencies: members,
      }
    })

  // ── Overall ──────────────────────────────────────────────────
  const overallSelf = weightedMean(
    competencies.map((m) => ({ score: m.selfScore, weight: m.competency.weight })),
  )
  const overallManager = weightedMean(
    competencies.map((m) => ({ score: m.managerScore, weight: m.competency.weight })),
  )

  // ── Derived lists (manager view is authoritative) ────────────
  const strengths = competencies
    .filter((r) => r.managerScore !== null && r.managerScore >= r.target + 1)
    .sort((a, b) => (b.managerScore ?? 0) - (a.managerScore ?? 0))

  const developmentPriorities = competencies
    .filter((r) => r.managerScore !== null && r.managerScore < r.target)
    .sort(
      (a, b) =>
        (b.gapToBar ?? 0) * b.competency.weight - (a.gapToBar ?? 0) * a.competency.weight,
    )

  const biggestPerceptionGaps = competencies
    .filter((r) => r.selfManagerGap !== null && Math.abs(r.selfManagerGap) >= 1)
    .sort((a, b) => Math.abs(b.selfManagerGap ?? 0) - Math.abs(a.selfManagerGap ?? 0))
    .slice(0, 3)

  const criticalFailures = competencies.filter((r) => r.criticalFailure)

  const businessRisks: BusinessRisk[] = developmentPriorities.map((r) => ({
    competencyName: r.competency.name,
    risk: r.competency.businessRisk,
  }))

  return {
    roleLevel: level,
    overallSelf,
    overallManager,
    maturityLabel: maturityLabel(overallManager ?? overallSelf),
    clusters,
    competencies,
    strengths,
    developmentPriorities,
    biggestPerceptionGaps,
    businessRisks,
    criticalFailures,
  }
}

export const GAP_CLASS_META: Record<
  GapClass,
  { label: string; tone: 'good' | 'warn' | 'bad' | 'neutral'; description: string }
> = {
  aligned_strength: {
    label: 'Aligned strength',
    tone: 'good',
    description: 'Both rate this above the bar: a confirmed strength.',
  },
  hidden_strength: {
    label: 'Hidden strength',
    tone: 'neutral',
    description: 'The manager rates this higher than the person does, suggesting under-confidence.',
  },
  on_track: {
    label: 'On track',
    tone: 'neutral',
    description: 'Meets the expectation for the role.',
  },
  blind_spot: {
    label: 'Blind spot',
    tone: 'bad',
    description: 'The person rates at or above the bar but the manager sees a gap: over-rating.',
  },
  development_priority: {
    label: 'Development priority',
    tone: 'warn',
    description: 'The manager rates this below the bar for the role.',
  },
}
