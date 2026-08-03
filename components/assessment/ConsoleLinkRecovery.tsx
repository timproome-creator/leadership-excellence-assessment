'use client'

import { useState } from 'react'
import { recoverConsoleLinks } from '@/app/actions'

// There is no login for this tool — the manager console link handed out at
// creation (on-screen + email) is the only way in. This is the recovery path
// when that moment is lost: look up by the email used to create it, and
// email back every console link tied to that address.
export function ConsoleLinkRecovery() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit() {
    setBusy(true)
    await recoverConsoleLinks(email)
    setBusy(false)
    setSent(true)
  }

  if (!open) {
    return (
      <p className="text-center text-sm text-gray-500 mt-6">
        Already created an assessment and lost the link?{' '}
        <button type="button" className="accent-text font-medium hover:underline" onClick={() => setOpen(true)}>
          Recover it
        </button>
      </p>
    )
  }

  if (sent) {
    return (
      <p className="text-center text-sm text-gray-600 mt-6 max-w-md mx-auto">
        If that email has any assessments, we have sent the console link(s) to it. Check spam if nothing arrives shortly.
      </p>
    )
  }

  return (
    <div className="max-w-sm mx-auto mt-6 bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-2">
        Enter the email you used to create the assessment. We will email any console links tied to it.
      </p>
      <div className="flex gap-2">
        <input
          className="input text-sm flex-1"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="button"
          className="btn-primary text-sm py-1.5 px-3 shrink-0"
          onClick={submit}
          disabled={busy || !email.trim()}
        >
          {busy ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
