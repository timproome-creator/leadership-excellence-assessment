'use client'

import { useState } from 'react'
import { recordConsent } from '@/app/actions'

type ConsentRole = 'self' | 'manager' | 'peer' | 'direct_report'

const COPY: Record<ConsentRole, { title: string; points: string[] }> = {
  self: {
    title: 'Before you start',
    points: [
      'You are rating your own leadership behaviour against 13 competencies. Your manager is rating you independently, on the same competencies.',
      'Neither of you sees the other’s scores until you have both finished. That is what makes the comparison meaningful.',
      'Your manager may also invite peers or direct reports to give feedback. If they do, it is only ever shown as a combined group average, never attributed to any one person.',
      'Your ratings are used for this assessment and, in anonymised form, to build sector benchmarks. They are never shared outside this assessment individually.',
    ],
  },
  manager: {
    title: 'Before you rate',
    points: [
      'You are rating this person’s leadership behaviour against 13 competencies, as their manager.',
      'You will not see their self-ratings until you have both finished. That independence is what makes the comparison meaningful.',
      'Your ratings are used for this assessment and, in anonymised form, to build sector benchmarks. They are never shared outside this assessment individually.',
    ],
  },
  peer: {
    title: 'Before you give feedback',
    points: [
      'You are rating this person’s leadership behaviour against 13 competencies, as a peer.',
      'Your response is combined with feedback from other peers and shown only as a group average, never on its own, once at least 3 peers have responded.',
      'Nothing you submit can be traced back to you individually, and it is never shown to anyone until that group threshold is met.',
    ],
  },
  direct_report: {
    title: 'Before you give feedback',
    points: [
      'You are rating this person’s leadership behaviour against 13 competencies, as one of their direct reports.',
      'Your response is combined with feedback from other direct reports and shown only as a group average, never on its own, once at least 3 direct reports have responded.',
      'Nothing you submit can be traced back to you individually, and it is never shown to anyone until that group threshold is met.',
    ],
  },
}

export function ConsentGate({
  token,
  role,
  onConsented,
}: {
  token: string
  role: ConsentRole
  onConsented: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const copy = COPY[role]

  async function agree() {
    setBusy(true)
    setError(null)
    const res = await recordConsent(token)
    if (res.success) {
      onConsented()
      return
    }
    setBusy(false)
    setError(res.error ?? 'Could not continue. Please try again.')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 max-w-xl mx-auto">
      <h2 className="text-lg font-bold text-gray-900">{copy.title}</h2>
      <ul className="mt-4 space-y-3">
        {copy.points.map((p, i) => (
          <li key={i} className="text-sm text-gray-600 flex gap-2">
            <span className="accent-text shrink-0">&bull;</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {error && <p className="err mt-3">{error}</p>}
      <div className="flex justify-end pt-6">
        <button type="button" className="btn-primary" onClick={agree} disabled={busy}>
          {busy ? 'Working...' : 'I understand, continue →'}
        </button>
      </div>
    </div>
  )
}
