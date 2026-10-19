import type { Scale, RoleLevel } from './types'

// Anchored 1–5 scale, rated against the role's expectation bar.
export const WLEA_SCALE: Scale = {
  key: 'wlea-1to5',
  min: 1,
  max: 5,
  meetsExpectation: 3,
  labels: [
    { value: 1, label: 'Significant gap' },
    { value: 2, label: 'Developing' },
    { value: 3, label: 'Meets expectation' },
    { value: 4, label: 'Strong / consistent' },
    { value: 5, label: 'Role model, coaches others' },
  ],
}

export const ROLE_LEVELS: RoleLevel[] = [
  {
    key: 'jpm',
    name: 'Junior Production Manager',
    shortName: 'Junior PM',
    rank: 1,
    scope: 'A shift / team / area. Delivers today’s plan within set standards.',
  },
  {
    key: 'pm',
    name: 'Production Manager',
    shortName: 'Production Mgr',
    rank: 2,
    scope: 'A department / function. Delivers weekly to period targets.',
  },
  {
    key: 'dcm',
    name: 'DC Manager',
    shortName: 'DC Manager',
    rank: 3,
    scope: 'The whole site. Integrates all functions; owns site performance.',
  },
  {
    // Same rank as 'dcm' deliberately — a parallel function at the same
    // seniority, not a rung between DC Manager and Executive. `rank` isn't
    // read anywhere as a sort/comparison key today (checked before adding
    // this), so a tie is safe; ROLE_LEVELS array order is what actually
    // drives the role-picker's display order.
    key: 'fm',
    name: 'Facilities & Maintenance Manager',
    shortName: 'Facilities Mgr',
    rank: 3,
    scope: 'The site’s buildings, plant, automation, security and fire compliance. Owns site risk and asset integrity.',
  },
  {
    key: 'exec',
    name: 'Executive',
    shortName: 'Executive',
    rank: 4,
    scope: 'Multiple sites / the network. Sets strategy and capability.',
  },
]

export function roleLevel(key: string): RoleLevel {
  const found = ROLE_LEVELS.find((r) => r.key === key)
  if (!found) throw new Error(`Unknown role level: ${key}`)
  return found
}

// Maturity banding of an overall (1–5) score into VSCE maturity language.
export function maturityLabel(score: number | null): string {
  if (score === null || !Number.isFinite(score)) return '—'
  if (score >= 4.5) return 'Role model'
  if (score >= 3.5) return 'Leading'
  if (score >= 2.75) return 'Capable'
  if (score >= 1.75) return 'Developing'
  return 'Significant gap'
}
