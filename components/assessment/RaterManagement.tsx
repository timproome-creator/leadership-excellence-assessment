'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addRater } from '@/app/actions'
import type { RaterSummary } from '@/app/actions'
import { BASE_PATH } from '@/lib/site'

const KIND_LABEL: Record<'peer' | 'direct_report', string> = {
  peer: 'peer',
  direct_report: 'direct report',
}

const MIN_RATERS_FOR_AGGREGATE = 3

function raterUrl(token: string): string {
  return `${window.location.origin}${BASE_PATH}/a/${token}`
}

// Rater invites are email-only at send time (see sendRaterInvite in
// lib/email/invites.ts). Corporate mail filters can swallow a brand-new
// sending domain, so every rater row gets a copy-link fallback the manager
// can send by hand — same rescue path as ShareLinkPanel for the self link.
function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(raterUrl(token))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button type="button" className="text-xs accent-text font-medium hover:underline shrink-0" onClick={copy}>
      {copied ? 'Copied' : 'Copy link'}
    </button>
  )
}

function AddRaterForm({
  token,
  kind,
}: {
  token: string
  kind: 'peer' | 'direct_report'
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addedToken, setAddedToken] = useState<string | null>(null)

  async function submit() {
    setBusy(true)
    setError(null)
    const res = await addRater(token, kind, name, email)
    if (res.success) {
      setName('')
      setEmail('')
      setOpen(false)
      setBusy(false)
      setAddedToken(res.token ?? null)
      router.refresh()
      return
    }
    setBusy(false)
    setError(res.error ?? 'Could not add this person.')
  }

  if (addedToken) {
    return (
      <div className="border accent-panel accent-panel rounded-lg p-3 space-y-2">
        <p className="text-xs accent-text">
          Invite emailed. If it does not arrive, copy this link and send it to them directly.
        </p>
        <div className="flex items-center gap-3">
          <CopyLinkButton token={addedToken} />
          <button type="button" className="text-xs text-gray-500 hover:underline" onClick={() => setAddedToken(null)}>
            Done
          </button>
        </div>
      </div>
    )
  }

  if (!open) {
    return (
      <button type="button" className="text-sm accent-text font-medium hover:underline" onClick={() => setOpen(true)}>
        + Add a {KIND_LABEL[kind]}
      </button>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-2">
      <input
        className="input text-sm"
        placeholder="Name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="input text-sm"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error && <p className="err">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" className="text-sm text-gray-500 px-2" onClick={() => setOpen(false)} disabled={busy}>
          Cancel
        </button>
        <button type="button" className="btn-primary text-sm py-1.5 px-3" onClick={submit} disabled={busy}>
          {busy ? 'Adding...' : 'Send invite'}
        </button>
      </div>
    </div>
  )
}

function RaterGroup({
  token,
  kind,
  raters,
}: {
  token: string
  kind: 'peer' | 'direct_report'
  raters: RaterSummary[]
}) {
  const submittedCount = raters.filter((r) => r.submitted).length
  const label = kind === 'peer' ? 'Peers' : 'Direct reports'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">
          {label}
          {raters.length > 0 && (
            <span className="text-gray-400 font-normal"> · {submittedCount}/{raters.length} responded</span>
          )}
        </p>
      </div>
      {raters.length > 0 && (
        <ul className="space-y-1">
          {raters.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${r.submitted ? 'bg-green-500' : 'bg-gray-300'}`} />
                {r.raterName}
              </span>
              {!r.submitted && <CopyLinkButton token={r.token} />}
            </li>
          ))}
        </ul>
      )}
      {raters.length > 0 && submittedCount < MIN_RATERS_FOR_AGGREGATE && (
        <p className="text-xs text-gray-400">
          Needs {MIN_RATERS_FOR_AGGREGATE - submittedCount} more response{MIN_RATERS_FOR_AGGREGATE - submittedCount === 1 ? '' : 's'} before a group score shows, to keep individual feedback anonymous.
        </p>
      )}
      <AddRaterForm token={token} kind={kind} />
    </div>
  )
}

export function RaterManagement({
  token,
  raters,
}: {
  token: string
  raters: RaterSummary[]
}) {
  const peers = raters.filter((r) => r.raterType === 'peer')
  const reports = raters.filter((r) => r.raterType === 'direct_report')

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-bold text-gray-700">360 feedback (optional)</h3>
      <p className="text-xs text-gray-500 mt-1 mb-4">
        Add peers or direct reports for a fuller picture. Their scores are only ever shown as a group average once at least {MIN_RATERS_FOR_AGGREGATE} people in that category have responded, never individually.
      </p>
      <div className="grid sm:grid-cols-2 gap-6">
        <RaterGroup token={token} kind="peer" raters={peers} />
        <RaterGroup token={token} kind="direct_report" raters={reports} />
      </div>
    </div>
  )
}
