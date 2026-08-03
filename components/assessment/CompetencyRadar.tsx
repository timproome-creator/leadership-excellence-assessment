'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import type { CompetencyResult } from '@/lib/framework/types'

const SHORT: Record<string, string> = {
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

export function CompetencyRadar({ results }: { results: CompetencyResult[] }) {
  const data = results.map((r) => ({
    competency: SHORT[r.competency.key] ?? r.competency.name,
    Self: r.selfScore,
    Manager: r.managerScore,
    Bar: r.target,
  }))

  return (
    <div className="w-full h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid />
          <PolarAngleAxis dataKey="competency" tick={{ fontSize: 11, fill: '#475569' }} />
          <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <Radar name="Bar" dataKey="Bar" stroke="#cbd5e1" fill="#cbd5e1" fillOpacity={0.25} />
          <Radar name="Self" dataKey="Self" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} />
          <Radar name="Manager" dataKey="Manager" stroke="#1d4ed8" fill="#1d4ed8" fillOpacity={0.25} />
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
