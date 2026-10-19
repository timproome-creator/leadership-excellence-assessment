// Shared between the on-screen radar (CompetencyRadar, Recharts) and the PDF
// radar (lib/pdf/RadarChart, react-pdf SVG primitives) so axis labels can
// never drift between the two renderers.
export const COMPETENCY_SHORT_LABEL: Record<string, string> = {
  integrity_trust: 'Integrity',
  drive_resilience: 'Drive',
  learning_development: 'Learning',
  operational_knowledge: 'Ops Knowledge',
  commercial_cost: 'Commercial',
  problem_solving: 'Problem-Solving',
  planning_prioritisation: 'Planning',
  directing_monitoring: 'Directing',
  building_team: 'Team Building',
  developing_people: 'Developing',
  collaboration_conflict: 'Collaboration',
  communicating_inspiring: 'Communicating',
  critical_strategic: 'Strategic',
}
