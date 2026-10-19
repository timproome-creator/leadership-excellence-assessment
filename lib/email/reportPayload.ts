import { GAP_CLASS_META } from '@/lib/scoring'
import { buildExecutiveSummary } from '@/lib/executiveSummary'
import type { AssessmentResult, CompetencyResult, RecommendationSet } from '@/lib/framework/types'
import type { AggregateGroup } from '@/app/actions'
import type { ReportPayload } from './report'

// Single place that turns a scored assessment into the email report shape.
// Used by the client's "email me a copy" button (ResultsDashboard) AND the
// server-side auto-send fired from submitRatings on completion — keeping
// both in sync with the scoring engine by construction, not convention.
export function buildReportPayload(
  result: AssessmentResult,
  subjectName: string,
  context: string,
  reportUrl: string,
  recs: RecommendationSet,
  peerAggregate: AggregateGroup,
  directReportAggregate: AggregateGroup,
): ReportPayload {
  const gap = (r: CompetencyResult) => (r.gapClass ? GAP_CLASS_META[r.gapClass] : null)

  return {
    subjectName,
    roleLevelName: result.roleLevel.name,
    context,
    reportUrl,
    executiveSummary: buildExecutiveSummary(result),
    overallSelf: result.overallSelf,
    overallManager: result.overallManager,
    maturityLabel: result.maturityLabel,
    competencies: result.competencies.map((r) => ({
      key: r.competency.key,
      name: r.competency.name,
      self: r.selfScore,
      manager: r.managerScore,
      target: r.target,
      light: r.trafficLight,
      gapLabel: gap(r)?.label ?? null,
      gapTone: gap(r)?.tone ?? null,
    })),
    criticalFailures: result.criticalFailures.map((r) => ({
      name: r.competency.name,
      managerScore: r.managerScore,
      businessRisk: r.competency.businessRisk,
    })),
    strengths: result.strengths.map((r) => ({
      name: r.competency.name,
      managerScore: r.managerScore,
    })),
    developmentPriorities: result.developmentPriorities.map((r) => ({
      name: r.competency.name,
      managerScore: r.managerScore,
      target: r.target,
    })),
    perceptionGaps: result.biggestPerceptionGaps.map((r) => ({
      name: r.competency.name,
      self: r.selfScore,
      manager: r.managerScore,
      gapLabel: gap(r)?.label ?? null,
    })),
    businessRisks: result.businessRisks.map((b) => ({
      competencyName: b.competencyName,
      risk: b.risk,
    })),
    peerAggregate,
    directReportAggregate,
    recommendations: {
      immediate: recs.immediate,
      actions30Day: recs.actions30Day,
      actions90Day: recs.actions90Day,
      training: recs.training,
      coaching: recs.coaching,
      succession: recs.succession,
      developmentPlans: recs.developmentPlans.map((p) => ({
        competencyName: p.competency.name,
        currentScore: p.currentScore,
        targetScore: p.targetScore,
        expectedBehaviouralChange: p.expectedBehaviouralChange,
        workplaceAssignments: p.workplaceAssignments,
        coaching: p.coaching,
        formalLearning: p.formalLearning,
        successMeasure: p.successMeasure,
        evidenceRequired: p.evidenceRequired,
        reviewTimelineDays: p.reviewTimelineDays,
        estimatedTimeToCompetency: p.estimatedTimeToCompetency,
      })),
    },
  }
}
