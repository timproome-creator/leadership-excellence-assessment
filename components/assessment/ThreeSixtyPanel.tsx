'use client'

import { competency } from '@/lib/framework'
import { formatNumber } from '@/lib/utils'
import type { AggregateGroup } from '@/app/actions'

const MIN_RATERS_FOR_AGGREGATE = 3

function CategoryCard({ title, group }: { title: string; group: AggregateGroup }) {
  if (group.n === 0) return null

  if (!group.sufficientN) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-700">{title}</h3>
        <p className="text-sm text-gray-400 mt-2">
          {group.n} of {MIN_RATERS_FOR_AGGREGATE} responses in. Scores show once the threshold is
          met, to keep individual feedback anonymous.
        </p>
      </div>
    )
  }

  const rows = group.byCompetency
    .map((r) => ({ name: competency(r.competencyKey).name, mean: r.mean }))
    .filter((r): r is { name: string; mean: number } => r.mean !== null)
    .sort((a, b) => a.mean - b.mean)

  // sufficientN guarantees overallMean is non-null (see aggregateOverall).
  const overall = group.overallMean ?? 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-bold text-gray-700">{title}</h3>
        <span className="text-xs text-gray-400">{group.n} responses</span>
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-2xl font-bold text-gray-900 tabular-nums">
          {formatNumber(overall, 1)}
        </span>
        <span className="text-xs text-gray-400">group average</span>
      </div>
      <ul className="mt-4 space-y-1.5">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{r.name}</span>
            <span className="tabular-nums text-gray-500">{formatNumber(r.mean, 1)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ThreeSixtyPanel({
  peerAggregate,
  directReportAggregate,
}: {
  peerAggregate: AggregateGroup
  directReportAggregate: AggregateGroup
}) {
  if (peerAggregate.n === 0 && directReportAggregate.n === 0) return null

  return (
    <div>
      <h3 className="text-sm font-bold text-gray-700 mb-3">360 feedback</h3>
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Handle with care.</span> These scores were given in
          confidence. In the development conversation, share the themes they point to, not the
          raw numbers. In a small team, quoting scores directly can expose who said what and
          put people at risk of comeback for honest feedback.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <CategoryCard title="Peers" group={peerAggregate} />
        <CategoryCard title="Direct reports" group={directReportAggregate} />
      </div>
    </div>
  )
}
