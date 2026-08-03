'use client'

import { useState } from 'react'
import { CLUSTERS, COMPETENCIES, WLEA_SCALE, roleLevel } from '@/lib/framework'
import type { RaterRatings, RaterType, RoleLevelKey } from '@/lib/framework/types'

const CONFIDENCE = [
  { label: 'Low', value: 1 },
  { label: 'Medium', value: 3 },
  { label: 'High', value: 5 },
]

// Widened beyond the scoring engine's RaterType: peer/direct_report are
// display-only roles here, they never enter the self-vs-manager gap engine.
export type DisplayRater = RaterType | 'peer' | 'direct_report'

const RATER_LABEL: Record<DisplayRater, string> = {
  self: 'Self-assessment',
  line_manager: 'Line-manager assessment',
  peer: 'Peer assessment',
  direct_report: 'Direct-report assessment',
}

const RATER_COMPLETE_LABEL: Record<DisplayRater, string> = {
  self: 'Done, hand over to manager →',
  line_manager: 'Reveal results →',
  peer: 'Submit your rating →',
  direct_report: 'Submit your rating →',
}

export function RatingStep({
  rater,
  roleLevelKey,
  ratings,
  onChange,
  onComplete,
  subjectName,
}: {
  rater: DisplayRater
  roleLevelKey: RoleLevelKey
  ratings: RaterRatings
  onChange: (updater: (prev: RaterRatings) => RaterRatings) => void
  onComplete: () => void
  subjectName?: string
}) {
  const level = roleLevel(roleLevelKey)
  const isSelf = rater === 'self'
  const who = isSelf ? 'yourself' : subjectName || 'this leader'

  const scored = COMPETENCIES.filter(
    (c) => typeof ratings[c.key]?.score === 'number',
  ).length
  const allScored = scored === COMPETENCIES.length

  function setField(key: string, patch: Partial<RaterRatings[string]>) {
    onChange((prev) => {
      const current = prev[key] ?? { score: null, confidence: null, comment: '' }
      return { ...prev, [key]: { ...current, ...patch } }
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide accent-text">
              {RATER_LABEL[rater]}
            </p>
            <h2 className="text-lg font-bold text-gray-900">
              Rate {who} as a {level.name}
            </h2>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-gray-900">
              {scored}
              <span className="text-gray-400 text-base">/{COMPETENCIES.length}</span>
            </div>
            <div className="text-xs text-gray-500">competencies rated</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Score each against the <strong>{level.name}</strong> bar shown. 3 = meets the
          expectation for the role.
        </p>
      </div>

      <div className="space-y-6">
        {CLUSTERS.slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((cluster) => (
            <div key={cluster.key}>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                {cluster.name}
              </h3>
              <div className="space-y-3">
                {COMPETENCIES.filter((c) => c.clusterKey === cluster.key).map((c) => {
                  const r = ratings[c.key]
                  const anchor = c.anchors[roleLevelKey]
                  return (
                    <div
                      key={c.key}
                      className="bg-white rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-gray-900">{c.name}</h4>
                        {c.isCritical && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 shrink-0">
                            Critical
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{c.definition}</p>

                      <div className="mt-2 text-xs accent-panel accent-text-strong rounded-lg px-3 py-2">
                        <span className="font-semibold">Bar for {level.shortName}:</span>{' '}
                        {anchor.text}
                      </div>

                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                          What to look for
                        </summary>
                        <ul className="mt-1 ml-4 list-disc text-xs text-gray-500 space-y-0.5">
                          {c.behaviours.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </details>

                      {/* Score selector */}
                      <div className="mt-3 grid grid-cols-5 gap-1.5">
                        {WLEA_SCALE.labels.map((s) => {
                          const active = r?.score === s.value
                          return (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => setField(c.key, { score: s.value })}
                              title={s.label}
                              className={[
                                'rounded-lg border py-2 text-sm font-semibold transition-colors',
                                active
                                  ? 'accent-selected-solid'
                                  : 'border-gray-200 text-gray-700 hover:bg-gray-50',
                              ].join(' ')}
                            >
                              {s.value}
                            </button>
                          )
                        })}
                      </div>
                      {r?.score != null && (
                        <p className="text-xs text-gray-500 mt-1">
                          {WLEA_SCALE.labels.find((l) => l.value === r.score)?.label}
                        </p>
                      )}

                      {/* Confidence + note */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500">Confidence:</span>
                        {CONFIDENCE.map((conf) => (
                          <button
                            key={conf.value}
                            type="button"
                            onClick={() => setField(c.key, { confidence: conf.value })}
                            className={[
                              'text-xs rounded-full px-2.5 py-1 border transition-colors',
                              r?.confidence === conf.value
                                ? 'accent-selected accent-panel accent-text'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300',
                            ].join(' ')}
                          >
                            {conf.label}
                          </button>
                        ))}
                      </div>
                      <input
                        className="input mt-2 text-xs"
                        placeholder="Evidence / note (optional)"
                        value={r?.comment ?? ''}
                        onChange={(e) => setField(c.key, { comment: e.target.value })}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
      </div>

      <div className="flex items-center justify-between mt-6 mb-12">
        <p className="text-xs text-gray-500">
          {allScored ? 'All competencies rated.' : `${COMPETENCIES.length - scored} remaining.`}
        </p>
        <button
          type="button"
          className="btn-primary"
          disabled={!allScored}
          onClick={onComplete}
        >
          {RATER_COMPLETE_LABEL[rater]}
        </button>
      </div>
    </div>
  )
}
