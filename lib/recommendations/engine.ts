// ────────────────────────────────────────────────────────────────
// WLEA recommendation + development engine (Phase 2).
// Rule-based, driven by the content library in ./content.ts. Reads
// the already-computed AssessmentResult; writes no new ratings.
//
// Predictions (estimated time to competency) are intentionally banded,
// not precise dates, and succession is a qualitative gate-based note,
// not the full Succession Readiness Index (that is Phase 3, scored
// against the NEXT role level's anchors).
// ────────────────────────────────────────────────────────────────

import type {
  AssessmentResult,
  CompetencyResult,
  DevelopmentPlan,
  RecommendationAction,
  RecommendationSet,
} from '@/lib/framework/types'
import { DEVELOPMENT_CONTENT } from './content'

const REVIEW_TIMELINE_DAYS = [30, 60, 90, 180, 365]

function estimatedTimeToCompetency(gap: number): string {
  if (gap >= 2) return '6-12 months, with a formal review at 90 days'
  if (gap === 1) return '3-6 months, with a formal review at 90 days'
  return '1-3 months, with a formal review at 30 days'
}

function buildDevelopmentPlan(r: CompetencyResult, anchorText: string): DevelopmentPlan {
  const content = DEVELOPMENT_CONTENT[r.competency.key]
  const current = r.managerScore ?? 0
  const gap = r.target - current

  return {
    competency: r.competency,
    currentScore: current,
    targetScore: r.target,
    gap,
    expectedBehaviouralChange: `Move from inconsistent demonstration of this competency to consistently meeting the bar: ${anchorText}`,
    workplaceAssignments: content?.workplaceAssignments ?? [],
    coaching: content?.coaching ?? [],
    formalLearning: content?.formalLearning ?? [],
    successMeasure: content?.successMeasure ?? '',
    evidenceRequired: r.competency.behaviours,
    reviewTimelineDays: REVIEW_TIMELINE_DAYS,
    estimatedTimeToCompetency: estimatedTimeToCompetency(gap),
  }
}

function successionNote(result: AssessmentResult): string {
  if (result.criticalFailures.length > 0) {
    const names = result.criticalFailures.map((r) => r.competency.name).join(', ')
    return `Succession risk: not yet ready for the next level. Critical competency gap in ${names} needs to close first.`
  }
  if (result.developmentPriorities.length >= 4) {
    return 'Succession: multiple development priorities open. Revisit succession readiness once the top priorities below are closed.'
  }
  const overall = result.overallManager ?? 0
  if (overall >= 4 && result.developmentPriorities.length === 0) {
    return 'Potential succession candidate for the next role level, subject to a full assessment against that level’s bar. No specific promotion window is implied by this score alone.'
  }
  return 'Succession readiness is not yet clear-cut. Use the development priorities below to build the case over the next review cycle.'
}

export function buildRecommendations(result: AssessmentResult): RecommendationSet {
  const plans = result.developmentPriorities.map((r) =>
    buildDevelopmentPlan(r, r.competency.anchors[result.roleLevel.key].text),
  )

  const immediate: RecommendationAction[] = plans.slice(0, 2).map((p) => ({
    competencyName: p.competency.name,
    content: `Discuss this gap with the manager within the next 1-2 weeks and agree the first workplace assignment below.`,
  }))

  const actions30Day: RecommendationAction[] = plans.slice(0, 3).map((p) => ({
    competencyName: p.competency.name,
    content: p.workplaceAssignments[0] ?? '',
  }))

  const actions90Day: RecommendationAction[] = plans.slice(0, 3).map((p) => ({
    competencyName: p.competency.name,
    content:
      p.workplaceAssignments[1] ??
      `Formal review of progress against the ${p.competency.name} bar.`,
  }))

  const trainingSeen = new Set<string>()
  const training: RecommendationAction[] = []
  plans.forEach((p) => {
    p.formalLearning.forEach((t) => {
      if (!trainingSeen.has(t)) {
        trainingSeen.add(t)
        training.push({ competencyName: p.competency.name, content: t })
      }
    })
  })

  const coachingSeen = new Set<string>()
  const coaching: RecommendationAction[] = []
  plans.forEach((p) => {
    p.coaching.forEach((c) => {
      if (!coachingSeen.has(c)) {
        coachingSeen.add(c)
        coaching.push({ competencyName: p.competency.name, content: c })
      }
    })
  })

  return {
    immediate,
    actions30Day,
    actions90Day,
    training,
    coaching,
    succession: successionNote(result),
    developmentPlans: plans,
  }
}

// Storage shape for result_summary (jsonb). Each DevelopmentPlan carries a
// full Competency object — definition, whyItMatters, behaviours, and anchors
// for all 4 role levels — which is fine to build fresh at render time but
// would duplicate that framework text into every stored assessment row.
// Only .name/.key are ever actually displayed (DevelopmentPlanSection.tsx),
// so persist just those — the framework is code-seeded and can supply the
// rest again if ever needed.
export interface StoredDevelopmentPlan extends Omit<DevelopmentPlan, 'competency'> {
  competencyKey: string
  competencyName: string
}

export interface StoredRecommendationSet extends Omit<RecommendationSet, 'developmentPlans'> {
  developmentPlans: StoredDevelopmentPlan[]
}

export function toStoredRecommendations(recs: RecommendationSet): StoredRecommendationSet {
  return {
    ...recs,
    developmentPlans: recs.developmentPlans.map(({ competency, ...rest }) => ({
      ...rest,
      competencyKey: competency.key,
      competencyName: competency.name,
    })),
  }
}
