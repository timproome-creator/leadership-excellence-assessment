'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WLEA, roleLevel } from '@/lib/framework'
import type { RaterRatings } from '@/lib/framework/types'
import { scoreAssessment } from '@/lib/scoring'
import { submitRatings, submitRaterRatings } from '@/app/actions'
import type { LoadResult } from '@/app/actions'
import { RatingStep } from './RatingStep'
import { ResultsDashboard } from './ResultsDashboard'
import { ShareLinkPanel } from './ShareLinkPanel'
import { ConsentGate } from './ConsentGate'
import { RaterPanel } from './RaterPanel'
import { RaterManagement } from './RaterManagement'
import { ThreeSixtyPanel } from './ThreeSixtyPanel'

export function AssessmentByToken({
  token,
  data,
}: {
  token: string
  data: LoadResult
}) {
  if (data.kind === 'not_found') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-xl mx-auto text-center">
        <h2 className="text-lg font-bold text-gray-900">Link not found</h2>
        <p className="text-sm text-gray-500 mt-2">
          This assessment link is not valid or has expired. Check the link, or ask
          the manager who set up the assessment to resend it.
        </p>
      </div>
    )
  }

  if (data.kind === 'self') {
    return <SelfView token={token} data={data} />
  }

  if (data.kind === 'peer' || data.kind === 'direct_report') {
    return <RaterPanel token={token} data={data} />
  }

  return <ManagerView token={token} data={data} />
}

// ── Employee self-rating ─────────────────────────────────────────
function SelfView({
  token,
  data,
}: {
  token: string
  data: Extract<LoadResult, { kind: 'self' }>
}) {
  const router = useRouter()
  const [consented, setConsented] = useState(data.consented)
  const [ratings, setRatings] = useState<RaterRatings>(data.myRatings ?? {})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // `saving` only guards the button/error UI below; the server response is the
  // source of truth for whether this is submitted, so it always wins here.
  if (data.alreadySubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 max-w-xl mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto text-xl font-bold">
          ✓
        </div>
        <h2 className="text-lg font-bold text-green-900 mt-4">Self-assessment submitted</h2>
        <p className="text-sm text-green-700 mt-2">
          Thanks. Your ratings have been recorded. Your manager will review the
          results with you in a development conversation. You can close this page.
        </p>
      </div>
    )
  }

  async function complete() {
    setSaving(true)
    setError(null)
    const res = await submitRatings(token, ratings)
    if (res.success) {
      router.refresh()
      return
    }
    setSaving(false)
    setError(res.error ?? 'Could not submit. Please try again.')
  }

  if (!consented) {
    return <ConsentGate token={token} role="self" onConsented={() => setConsented(true)} />
  }

  return (
    <div>
      <RatingStep
        rater="self"
        roleLevelKey={data.meta.roleLevel}
        ratings={ratings}
        onChange={setRatings}
        onComplete={complete}
        subjectName={data.meta.subjectName}
      />
      {error && <p className="err text-center mt-3">{error}</p>}
    </div>
  )
}

// ── Manager owner console ────────────────────────────────────────
function ManagerView({
  token,
  data,
}: {
  token: string
  data: Extract<LoadResult, { kind: 'manager' }>
}) {
  const router = useRouter()
  const [consented, setConsented] = useState(data.consented)
  const [ratings, setRatings] = useState<RaterRatings>(data.myRatings ?? {})
  const [rating, setRating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const result = useMemo(() => {
    if (!data.reveal) return null
    return scoreAssessment(
      { self: data.reveal.selfRatings, line_manager: data.reveal.managerRatings },
      data.meta.roleLevel,
    )
  }, [data.reveal, data.meta.roleLevel])

  async function complete() {
    setSaving(true)
    setError(null)
    const res = await submitRatings(token, ratings)
    if (res.success) {
      setRating(false)
      router.refresh()
      return
    }
    setSaving(false)
    setError(res.error ?? 'Could not submit. Please try again.')
  }

  // Reveal is ready: show the full results (email panel lives inside it),
  // plus the 360 aggregate layer if any peers/direct-reports were added.
  if (result && data.meta) {
    return (
      <div className="space-y-6">
        <ResultsDashboard
          result={result}
          meta={data.meta}
          module={WLEA}
          peerAggregate={data.peerAggregate}
          directReportAggregate={data.directReportAggregate}
        />
        <ThreeSixtyPanel peerAggregate={data.peerAggregate} directReportAggregate={data.directReportAggregate} />
      </div>
    )
  }

  // Manager is mid-rating.
  if (rating && !data.managerSubmitted) {
    if (!consented) {
      return <ConsentGate token={token} role="manager" onConsented={() => setConsented(true)} />
    }
    return (
      <div>
        <RatingStep
          rater="line_manager"
          roleLevelKey={data.meta.roleLevel}
          ratings={ratings}
          onChange={setRatings}
          onComplete={complete}
          subjectName={data.meta.subjectName}
        />
        {error && <p className="err text-center mt-3">{error}</p>}
      </div>
    )
  }

  // Owner console: share link + status + rate CTA.
  const roleName = roleLevel(data.meta.roleLevel).name
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide accent-text">
          Manager console
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-0.5">
          {data.meta.subjectName}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Assessed against the {roleName} bar</p>
      </div>

      {!data.selfSubmitted && <ShareLinkPanel selfToken={data.selfToken} subjectName={data.meta.subjectName} />}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-700">Progress</h3>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <StatusDot done={data.selfSubmitted} />
            <span className={data.selfSubmitted ? 'text-gray-800' : 'text-gray-500'}>
              {data.meta.subjectName}&rsquo;s self-assessment
              {data.selfSubmitted ? ' submitted' : ' not yet submitted'}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <StatusDot done={data.managerSubmitted} />
            <span className={data.managerSubmitted ? 'text-gray-800' : 'text-gray-500'}>
              Your manager assessment
              {data.managerSubmitted ? ' submitted' : ' not yet submitted'}
            </span>
          </li>
        </ul>

        {!data.managerSubmitted ? (
          <button type="button" className="btn-primary mt-5" onClick={() => setRating(true)}>
            {data.myRatings && Object.keys(data.myRatings).length > 0
              ? 'Continue your assessment →'
              : 'Start your manager assessment →'}
          </button>
        ) : (
          <p className="text-sm text-gray-500 mt-5">
            {data.selfSubmitted
              ? 'Both assessments are in. Loading the results...'
              : `Your ratings are in. The results unlock once ${data.meta.subjectName} completes their self-assessment. Revisit this link then.`}
          </p>
        )}
        {error && <p className="err mt-3">{error}</p>}
      </div>

      <RaterManagement token={token} raters={data.raters} />

      <p className="text-center text-xs text-gray-400">
        Bookmark this page. It is your private link to the results, seen only by you.
      </p>
    </div>
  )
}

function StatusDot({ done }: { done: boolean }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${done ? 'bg-green-500' : 'bg-gray-300'}`}
    />
  )
}
