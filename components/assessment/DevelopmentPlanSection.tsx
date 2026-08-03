'use client'

import type { DevelopmentPlan, RecommendationSet } from '@/lib/framework/types'
import { formatNumber } from '@/lib/utils'

function PlanCard({ plan }: { plan: DevelopmentPlan }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-bold text-gray-900">{plan.competency.name}</h4>
        <span className="text-xs text-gray-400 shrink-0">
          {formatNumber(plan.currentScore, 0)} → {plan.targetScore}
        </span>
      </div>

      <p className="text-xs text-gray-600 mt-2">{plan.expectedBehaviouralChange}</p>

      <div className="mt-3 grid sm:grid-cols-3 gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide accent-text">
            Workplace (70%)
          </p>
          <ul className="mt-1 ml-4 list-disc text-xs text-gray-600 space-y-1">
            {plan.workplaceAssignments.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
            Coaching (20%)
          </p>
          <ul className="mt-1 ml-4 list-disc text-xs text-gray-600 space-y-1">
            {plan.coaching.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-700">
            Formal learning (10%)
          </p>
          <ul className="mt-1 ml-4 list-disc text-xs text-gray-600 space-y-1">
            {plan.formalLearning.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 grid sm:grid-cols-2 gap-3 text-xs">
        <div>
          <span className="font-semibold text-gray-700">Success measure: </span>
          <span className="text-gray-600">{plan.successMeasure}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Evidence required: </span>
          <span className="text-gray-600">{plan.evidenceRequired.join('; ')}</span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span>
          Review at: {plan.reviewTimelineDays.join(' / ')} days
        </span>
        <span className="text-gray-300">·</span>
        <span>Indicative time to competency: {plan.estimatedTimeToCompetency}</span>
      </div>
    </div>
  )
}

export function DevelopmentPlanSection({ recs }: { recs: RecommendationSet }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-1">Recommended actions</h3>
        <p className="text-xs text-gray-500 mb-4">
          Rule-based, generated from the development priorities below.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Immediate</p>
            <ul className="mt-2 space-y-2">
              {recs.immediate.length === 0 && (
                <li className="text-xs text-gray-400">None needed.</li>
              )}
              {recs.immediate.map((a, i) => (
                <li key={i} className="text-xs text-gray-700">
                  <span className="font-semibold">{a.competencyName}:</span> {a.content}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">30 days</p>
            <ul className="mt-2 space-y-2">
              {recs.actions30Day.map((a, i) => (
                <li key={i} className="text-xs text-gray-700">
                  <span className="font-semibold">{a.competencyName}:</span> {a.content}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide accent-text">90 days</p>
            <ul className="mt-2 space-y-2">
              {recs.actions90Day.map((a, i) => (
                <li key={i} className="text-xs text-gray-700">
                  <span className="font-semibold">{a.competencyName}:</span> {a.content}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {(recs.training.length > 0 || recs.coaching.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 grid sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2">Training recommendations</h3>
            <ul className="space-y-2">
              {recs.training.map((t, i) => (
                <li key={i} className="text-xs text-gray-700">
                  <span className="font-semibold">{t.competencyName}:</span> {t.content}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2">Coaching recommendations</h3>
            <ul className="space-y-2">
              {recs.coaching.map((c, i) => (
                <li key={i} className="text-xs text-gray-700">
                  <span className="font-semibold">{c.competencyName}:</span> {c.content}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="accent-panel border rounded-xl p-5">
        <h3 className="text-sm font-bold accent-text-strong mb-1">Succession note</h3>
        <p className="text-sm accent-text-strong">{recs.succession}</p>
      </div>

      {recs.developmentPlans.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3">
            Individual development plans (70 / 20 / 10)
          </h3>
          <div className="space-y-4">
            {recs.developmentPlans.map((plan) => (
              <PlanCard key={plan.competency.key} plan={plan} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
