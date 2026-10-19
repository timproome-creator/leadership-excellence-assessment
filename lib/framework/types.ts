// ────────────────────────────────────────────────────────────────
// VSCE Assessment Engine — framework + instance types
// WLEA is the first module built on these shared types.
// ────────────────────────────────────────────────────────────────

export type RoleLevelKey = 'jpm' | 'pm' | 'dcm' | 'exec' | 'fm'

export interface RoleLevel {
  key: RoleLevelKey
  name: string
  shortName: string
  rank: number // 1..4, widening scope of impact
  scope: string
}

export interface ScaleLabel {
  value: number
  label: string
}

export interface Scale {
  key: string
  min: number
  max: number
  meetsExpectation: number // the "3 — meets the bar" value
  labels: ScaleLabel[]
}

export interface LevelAnchor {
  text: string // the "meets expectation" standard at this level
  target: number // the bar for this level (usually meetsExpectation)
}

export interface Cluster {
  key: string
  name: string
  sortOrder: number
}

export interface Competency {
  key: string
  name: string
  clusterKey: string
  definition: string
  whyItMatters: string
  isCritical: boolean // low score = red flag regardless of average
  weight: number
  behaviours: string[] // observable evidence cues
  businessRisk: string // surfaced when scored below the bar
  anchors: Record<RoleLevelKey, LevelAnchor>
}

export interface AssessmentModule {
  key: string
  name: string
  shortName: string
  version: string
  scale: Scale
  roleLevels: RoleLevel[]
  clusters: Cluster[]
  competencies: Competency[]
}

// ── Instance / responses ─────────────────────────────────────────

export type RaterType = 'self' | 'line_manager'

export interface Rating {
  score: number | null
  confidence: number | null // 1..5 rater confidence
  comment: string
}

export type RaterRatings = Record<string, Rating> // keyed by competency.key
export type AllRatings = Record<RaterType, RaterRatings>

// ── Scoring outputs ──────────────────────────────────────────────

export type TrafficLight = 'green' | 'amber' | 'red'

export type GapClass =
  | 'aligned_strength'
  | 'development_priority'
  | 'blind_spot'
  | 'hidden_strength'
  | 'on_track'

export interface CompetencyResult {
  competency: Competency
  selfScore: number | null
  managerScore: number | null
  target: number
  gapToBar: number | null // target - managerScore (positive = below bar)
  selfManagerGap: number | null // managerScore - selfScore
  trafficLight: TrafficLight | null
  gapClass: GapClass | null
  criticalFailure: boolean
}

export interface ClusterResult {
  cluster: Cluster
  selfScore: number | null
  managerScore: number | null
  competencies: CompetencyResult[]
}

export interface BusinessRisk {
  competencyName: string
  risk: string
}

export interface AssessmentResult {
  roleLevel: RoleLevel
  overallSelf: number | null
  overallManager: number | null
  maturityLabel: string
  clusters: ClusterResult[]
  competencies: CompetencyResult[]
  strengths: CompetencyResult[]
  developmentPriorities: CompetencyResult[]
  biggestPerceptionGaps: CompetencyResult[]
  businessRisks: BusinessRisk[]
  criticalFailures: CompetencyResult[]
}

// ── Development & recommendation engine (Phase 2) ────────────────

export interface DevelopmentContent {
  workplaceAssignments: string[] // 70%
  coaching: string[] // 20%
  formalLearning: string[] // 10%
  successMeasure: string
}

export interface DevelopmentPlan {
  competency: Competency
  currentScore: number
  targetScore: number
  gap: number
  expectedBehaviouralChange: string
  workplaceAssignments: string[]
  coaching: string[]
  formalLearning: string[]
  successMeasure: string
  evidenceRequired: string[]
  reviewTimelineDays: number[]
  estimatedTimeToCompetency: string
}

export interface RecommendationAction {
  competencyName: string | null
  content: string
}

export interface RecommendationSet {
  immediate: RecommendationAction[]
  actions30Day: RecommendationAction[]
  actions90Day: RecommendationAction[]
  training: RecommendationAction[]
  coaching: RecommendationAction[]
  succession: string
  developmentPlans: DevelopmentPlan[]
}
