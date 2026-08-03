'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAssessment } from '@/app/actions'
import { SetupStep, type AssessmentMeta } from './SetupStep'

// Manager-led entry point. The manager describes the leader being assessed,
// then lands on their owner console (/a/[managerToken]) where they can share
// the employee's self-rating link, rate as the manager, and open the reveal.
export function ManagerCreate() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function start(meta: AssessmentMeta) {
    setBusy(true)
    setError(null)
    const res = await createAssessment(meta)
    if (res.managerToken) {
      router.push(`/a/${res.managerToken}`)
      return
    }
    setBusy(false)
    setError(res.error ?? 'Could not create the assessment. Please try again.')
  }

  return (
    <div>
      <SetupStep
        onStart={start}
        heading="Create a leadership assessment"
        subheading="You are setting this up as the line manager. The role you choose sets the expectation bar each competency is rated against. Next you will get a link to send to the leader for their self-assessment."
        submitLabel="Create and get links →"
        busy={busy}
      />
      {error && (
        <p className="err text-center mt-3">{error}</p>
      )}
    </div>
  )
}
