'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RaterRatings } from '@/lib/framework/types'
import { submitRaterRatings } from '@/app/actions'
import type { LoadResult } from '@/app/actions'
import { RatingStep } from './RatingStep'
import { ConsentGate } from './ConsentGate'

const KIND_LABEL: Record<'peer' | 'direct_report', string> = {
  peer: 'peer feedback',
  direct_report: 'direct-report feedback',
}

// Peer / direct-report rater flow: consent, rate, submit, done. Never sees a
// reveal, never sees anyone else's scores, mirrors the self view but writes
// to wlea_raters via submitRaterRatings instead of the assessment row.
export function RaterPanel({
  token,
  data,
}: {
  token: string
  data: Extract<LoadResult, { kind: 'peer' | 'direct_report' }>
}) {
  const router = useRouter()
  const [consented, setConsented] = useState(data.consented)
  const [ratings, setRatings] = useState<RaterRatings>(data.myRatings ?? {})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (data.alreadySubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 max-w-xl mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto text-xl font-bold">
          ✓
        </div>
        <h2 className="text-lg font-bold text-green-900 mt-4">Feedback submitted</h2>
        <p className="text-sm text-green-700 mt-2">
          Thanks. Your {KIND_LABEL[data.kind]} has been recorded and combined with feedback from other {data.kind === 'peer' ? 'peers' : 'direct reports'} into a group average. You can close this page.
        </p>
      </div>
    )
  }

  async function complete() {
    setSaving(true)
    setError(null)
    const res = await submitRaterRatings(token, ratings)
    if (res.success) {
      router.refresh()
      return
    }
    setSaving(false)
    setError(res.error ?? 'Could not submit. Please try again.')
  }

  if (!consented) {
    return <ConsentGate token={token} role={data.kind} onConsented={() => setConsented(true)} />
  }

  return (
    <div>
      <RatingStep
        rater={data.kind}
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
