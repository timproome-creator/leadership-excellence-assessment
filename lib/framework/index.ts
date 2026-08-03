import type { AssessmentModule, Competency } from './types'
import { WLEA_SCALE, ROLE_LEVELS } from './scale'
import { CLUSTERS, COMPETENCIES } from './competencies'

export const WLEA: AssessmentModule = {
  key: 'wlea',
  name: 'Warehouse Leadership Excellence Assessment',
  shortName: 'WLEA',
  version: '1.0.0',
  scale: WLEA_SCALE,
  roleLevels: ROLE_LEVELS,
  clusters: CLUSTERS,
  competencies: COMPETENCIES,
}

export function competenciesByCluster(clusterKey: string): Competency[] {
  return COMPETENCIES.filter((c) => c.clusterKey === clusterKey)
}

export function competency(key: string): Competency {
  const found = COMPETENCIES.find((c) => c.key === key)
  if (!found) throw new Error(`Unknown competency: ${key}`)
  return found
}

export * from './types'
export { WLEA_SCALE, ROLE_LEVELS, roleLevel, maturityLabel } from './scale'
export { CLUSTERS, COMPETENCIES } from './competencies'
