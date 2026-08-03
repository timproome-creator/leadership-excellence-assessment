'use client'

import { useState } from 'react'
import { BASE_PATH } from '@/lib/site'
import type { ReportPayload } from '@/lib/email/report'

export type EmailReportPayload = ReportPayload

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function EmailReportPanel({ payload }: { payload: EmailReportPayload }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function send() {
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error')
      setMessage('Enter a valid email address.')
      return
    }
    setStatus('sending')
    setMessage(null)
    try {
      const res = await fetch(`${BASE_PATH}/api/email-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, ...payload }),
      })
      if (res.ok) {
        setStatus('sent')
        return
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      setStatus('error')
      setMessage(data?.error ?? 'Could not send the email. Please try again.')
    } catch {
      setStatus('error')
      setMessage('Could not send the email. Please try again.')
    }
  }

  if (status === 'sent') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <p className="text-sm font-semibold text-green-800">Report sent.</p>
        <p className="text-xs text-green-700 mt-1">
          A copy is on its way to {email.trim()}. Check spam if it does not arrive shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-bold text-gray-700">Email a copy of this report</h3>
      <p className="text-xs text-gray-500 mt-1">
        Results are not saved to an account. Send yourself a copy before you close this page.
      </p>
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          className="input flex-1"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === 'error') setStatus('idle')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send()
          }}
          disabled={status === 'sending'}
        />
        <button
          type="button"
          className="btn-primary shrink-0"
          onClick={send}
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Sending...' : 'Email me this report'}
        </button>
      </div>
      {status === 'error' && message && <p className="err mt-2">{message}</p>}
    </div>
  )
}
