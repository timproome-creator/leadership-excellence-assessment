// ────────────────────────────────────────────────────────────────
// Executive summary generator — pure rules over the scored result.
// Gives the exec/HR reader the story before the data: verdict first,
// confirmed strengths celebrated BEFORE gaps (deliberate — a leader
// with four 4/5 scores must not receive a document that reads as
// "here is what is wrong with you"), then the gaps that matter and
// an overall readiness recommendation. Every sentence is derived
// from real scores; nothing here is freeform-generated prose.
// ────────────────────────────────────────────────────────────────

import type { AssessmentResult } from './framework/types'

export interface ExecutiveSummary {
  maturityLabel: string
  // One or two sentences celebrating what the manager confirmed as strengths.
  strengthsNarrative: string
  // Names of above-the-bar competencies (chips in the UI, list in PDF/email).
  strengthNames: string[]
  // The gaps that matter, phrased as readiness, not failure.
  gapsNarrative: string
  gapNames: string[]
  // Overall readiness verdict, one or two short lines.
  recommendation: string
}

function joinNames(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

export function buildExecutiveSummary(result: AssessmentResult): ExecutiveSummary {
  const roleName = result.roleLevel.name
  const strengths = result.strengths
  const priorities = result.developmentPriorities
  const criticals = result.criticalFailures
  const onTrackCount = result.competencies.filter(
    (r) => r.managerScore !== null && r.managerScore >= r.target,
  ).length
  const totalCount = result.competencies.length

  // ── Strengths first ────────────────────────────────────────────
  const strengthNames = strengths.map((r) => r.competency.name)
  let strengthsNarrative: string
  if (strengthNames.length >= 2) {
    strengthsNarrative = `This leader shows confirmed strength in ${joinNames(
      strengthNames.slice(0, 4),
    )}, rated above the ${roleName} bar by their manager. That is a solid foundation to build from.`
  } else if (strengthNames.length === 1) {
    strengthsNarrative = `This leader shows confirmed strength in ${strengthNames[0]}, rated above the ${roleName} bar by their manager, and meets the bar on ${onTrackCount} of ${totalCount} competencies overall.`
  } else if (onTrackCount > 0) {
    strengthsNarrative = `This leader meets the ${roleName} bar on ${onTrackCount} of ${totalCount} competencies. No competency is rated above the bar yet, so the strengths to build on are consistency rather than standout areas.`
  } else {
    strengthsNarrative = `Manager ratings currently sit below the ${roleName} bar across the board. Treat this as a development baseline, not a verdict: the plan below is built to move it.`
  }

  // ── Gaps, phrased as readiness ─────────────────────────────────
  const topPriorities = priorities.slice(0, 2)
  const gapNames = topPriorities.map((r) => r.competency.name)
  const maxGap = Math.max(0, ...topPriorities.map((r) => r.gapToBar ?? 0))
  const horizon = maxGap >= 2 ? '6 to 12 months' : '3 to 6 months'

  let gapsNarrative: string
  if (criticals.length > 0) {
    const critNames = criticals.map((r) => r.competency.name)
    gapsNarrative = `A critical flag is raised on ${joinNames(critNames)}: a competency the role cannot compromise on scored at or below 2. This is addressed first in the development plan, ahead of everything else.`
  } else if (gapNames.length === 2) {
    gapsNarrative = `Two competencies currently limit readiness for broader leadership responsibility: ${gapNames[0]} and ${gapNames[1]}. Closing these would materially strengthen succession readiness over the next ${horizon}.`
  } else if (gapNames.length === 1) {
    gapsNarrative = `One competency currently limits readiness for broader leadership responsibility: ${gapNames[0]}. Closing this gap would materially strengthen succession readiness over the next ${horizon}.`
  } else {
    gapsNarrative = `No competency sits below the ${roleName} bar. Development focus shifts from closing gaps to stretching toward the next role level.`
  }

  // ── Overall recommendation ─────────────────────────────────────
  const overall = result.overallManager ?? 0
  let recommendation: string
  if (criticals.length > 0) {
    recommendation =
      'Development required in the current role. Address the critical competency gap before broadening responsibility.'
  } else if (priorities.length === 0 && overall >= 4) {
    recommendation =
      'Performing strongly at the current bar. Potential succession candidate for the next role level, subject to a full assessment against that level’s bar.'
  } else if (priorities.length === 0) {
    recommendation = 'Ready for the current role. Solid across the board at the current bar.'
  } else {
    recommendation =
      'Ready for the current role. Targeted development required before next-level readiness.'
  }

  return {
    maturityLabel: result.maturityLabel,
    strengthsNarrative,
    strengthNames,
    gapsNarrative,
    gapNames,
    recommendation,
  }
}
