'use client'

import { useMemo, useState } from 'react'
import type { AssessmentModule } from '@/lib/framework/types'
import type { AssessmentResult, CompetencyResult, TrafficLight } from '@/lib/framework/types'
import { GAP_CLASS_META } from '@/lib/scoring'
import { buildRecommendations } from '@/lib/recommendations/engine'
import { buildExecutiveSummary } from '@/lib/executiveSummary'
import { buildReportPayload } from '@/lib/email/reportPayload'
import { formatNumber } from '@/lib/utils'
import { BASE_PATH } from '@/lib/site'
import type { AssessmentMeta } from './SetupStep'
import { CompetencyRadar } from './CompetencyRadar'
import { DevelopmentPlanSection } from './DevelopmentPlanSection'
import { EmailReportPanel } from './EmailReportPanel'

const TONE: Record<string, string> = {
  good: 'bg-green-50 text-green-700 border-green-200',
  warn: 'bg-amber-50 text-amber-700 border-amber-200',
  bad: 'bg-red-50 text-red-700 border-red-200',
  neutral: 'bg-gray-50 text-gray-600 border-gray-200',
}

const LIGHT: Record<TrafficLight, string> = {
  green: 'bg-green-500',
  amber: 'bg-amber-400',
  red: 'bg-red-500',
}

function ScoreCell({ value }: { value: number | null }) {
  return <span className="tabular-nums">{value === null ? '—' : formatNumber(value, 1)}</span>
}

function GapChip({ r }: { r: CompetencyResult }) {
  if (!r.gapClass) return null
  const meta = GAP_CLASS_META[r.gapClass]
  return (
    <span
      className={`text-[11px] font-medium rounded-full border px-2 py-0.5 ${TONE[meta.tone]}`}
      title={meta.description}
    >
      {meta.label}
    </span>
  )
}

export function ResultsDashboard({
  result,
  meta,
}: {
  result: AssessmentResult
  meta: AssessmentMeta
  module: AssessmentModule
}) {
  const recs = useMemo(() => buildRecommendations(result), [result])
  const summary = useMemo(() => buildExecutiveSummary(result), [result])
  const [downloading, setDownloading] = useState(false)

  const emailPayload = useMemo(
    () =>
      buildReportPayload(
        result,
        meta.subjectName,
        [meta.site, meta.businessUnit, meta.industry, meta.country].filter(Boolean).join(' · '),
        // This component only ever renders on the reveal page itself, so the
        // current URL IS the online report. Guarded for the server render
        // pass, where window doesn't exist yet.
        typeof window !== 'undefined' ? window.location.href : '',
        recs,
      ),
    [result, meta, recs],
  )

  // Generates a real PDF server-side (react-pdf), not a browser print-to-PDF
  // (that approach's page-break/header placement was unreliable in testing).
  async function downloadPdf() {
    setDownloading(true)
    try {
      const res = await fetch(`${BASE_PATH}/api/report-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      })
      if (!res.ok) throw new Error('failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${meta.subjectName || 'leadership-report'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Best-effort UX only: the report itself is always visible on-screen.
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button type="button" className="btn-secondary" onClick={downloadPdf} disabled={downloading}>
          {downloading ? 'Preparing PDF...' : 'Download PDF'}
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide accent-text">
              Leadership profile · {result.roleLevel.name}
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">{meta.subjectName}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {[meta.site, meta.businessUnit, meta.industry, meta.country]
                .filter(Boolean)
                .join(' · ') || 'No context provided'}
            </p>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-sky-600">
                <ScoreCell value={result.overallSelf} />
              </div>
              <div className="text-xs text-gray-500">Self</div>
            </div>
            <div>
              <div className="text-2xl font-bold accent-text">
                <ScoreCell value={result.overallManager} />
              </div>
              <div className="text-xs text-gray-500">Manager</div>
            </div>
            <div>
              <div className="text-base font-semibold text-gray-900 mt-1.5">
                {result.maturityLabel}
              </div>
              <div className="text-xs text-gray-500">Maturity</div>
            </div>
          </div>
        </div>
      </div>

      {/* Executive summary — the story before the data. Strengths are
          deliberately celebrated BEFORE gaps: a leader with several
          above-bar scores must not receive a report that reads gap-first. */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-700">Executive summary</h3>
        <p className="text-sm text-gray-800 mt-3">{summary.strengthsNarrative}</p>
        {summary.strengthNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {summary.strengthNames.map((n) => (
              <span
                key={n}
                className="text-[11px] font-medium rounded-full border px-2 py-0.5 bg-green-50 text-green-700 border-green-200"
              >
                {n}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-800 mt-3">{summary.gapsNarrative}</p>
        {summary.gapNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {summary.gapNames.map((n) => (
              <span
                key={n}
                className="text-[11px] font-medium rounded-full border px-2 py-0.5 bg-amber-50 text-amber-700 border-amber-200"
              >
                {n}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 accent-panel border rounded-lg px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide accent-text-strong">
            Overall recommendation
          </p>
          <p className="text-sm accent-text-strong mt-1">{summary.recommendation}</p>
        </div>
      </div>

      {/* Critical failures */}
      {result.criticalFailures.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-red-800">⚠ Critical-failure flags</h3>
          <p className="text-xs text-red-700 mt-1">
            A critical competency scored at or below 2. These are escalated regardless
            of the overall score.
          </p>
          <ul className="mt-2 space-y-1">
            {result.criticalFailures.map((r) => (
              <li key={r.competency.key} className="text-sm text-red-800">
                <strong>{r.competency.name}</strong>, manager score{' '}
                {formatNumber(r.managerScore ?? 0, 0)}. {r.competency.businessRisk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Radar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-2">Competency radar</h3>
        <CompetencyRadar results={result.competencies} />
      </div>

      {/* Gap table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 overflow-x-auto">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Competency-by-competency</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-200">
              <th className="text-left font-medium py-2">Competency</th>
              <th className="text-center font-medium py-2 w-14">Self</th>
              <th className="text-center font-medium py-2 w-16">Mgr</th>
              <th className="text-center font-medium py-2 w-12">Bar</th>
              <th className="text-center font-medium py-2 w-10"></th>
              <th className="text-left font-medium py-2 pl-3">Read</th>
            </tr>
          </thead>
          <tbody>
            {result.competencies.map((r) => (
              <tr key={r.competency.key} className="border-b border-gray-100">
                <td className="py-2 pr-2 text-gray-800">{r.competency.name}</td>
                <td className="py-2 text-center text-sky-600 font-semibold">
                  <ScoreCell value={r.selfScore} />
                </td>
                <td className="py-2 text-center accent-text font-semibold">
                  <ScoreCell value={r.managerScore} />
                </td>
                <td className="py-2 text-center text-gray-400">{r.target}</td>
                <td className="py-2 text-center">
                  {r.trafficLight && (
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${LIGHT[r.trafficLight]}`}
                    />
                  )}
                </td>
                <td className="py-2 pl-3">
                  <GapChip r={r} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Strengths + priorities */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-green-700 mb-3">Strengths</h3>
          {result.strengths.length === 0 ? (
            <p className="text-sm text-gray-400">No competency rated above the bar yet.</p>
          ) : (
            <ul className="space-y-2">
              {result.strengths.map((r) => (
                <li key={r.competency.key} className="text-sm text-gray-800">
                  <span className="font-semibold">{r.competency.name}</span>
                  <span className="text-gray-400"> · manager {formatNumber(r.managerScore ?? 0, 0)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-amber-700 mb-3">Development priorities</h3>
          {result.developmentPriorities.length === 0 ? (
            <p className="text-sm text-gray-400">No competency below the bar. Solid across the board.</p>
          ) : (
            <ol className="space-y-2 list-decimal list-inside">
              {result.developmentPriorities.map((r) => (
                <li key={r.competency.key} className="text-sm text-gray-800">
                  <span className="font-semibold">{r.competency.name}</span>
                  <span className="text-gray-400">
                    {' '}
                    · manager {formatNumber(r.managerScore ?? 0, 0)} vs bar {r.target}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Perception gaps */}
      {result.biggestPerceptionGaps.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-1">
            Biggest perception gaps: start the conversation here
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Where the leader and the manager see things most differently.
          </p>
          <ul className="space-y-2">
            {result.biggestPerceptionGaps.map((r) => (
              <li key={r.competency.key} className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-800">{r.competency.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">
                    self {formatNumber(r.selfScore ?? 0, 0)} · mgr{' '}
                    {formatNumber(r.managerScore ?? 0, 0)}
                  </span>
                  <GapChip r={r} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Business risks */}
      {result.businessRisks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Business risks from gaps</h3>
          <ul className="space-y-2">
            {result.businessRisks.map((b, i) => (
              <li key={i} className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">{b.competencyName}:</span>{' '}
                {b.risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations + development plans */}
      <DevelopmentPlanSection recs={recs} />

      {/* Email a copy of the report */}
      <div className="print:hidden">
        <EmailReportPanel payload={emailPayload} />
      </div>

      <div className="flex justify-center pt-2 pb-10 print:hidden">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => window.location.reload()}
        >
          Start a new assessment
        </button>
      </div>
    </div>
  )
}
