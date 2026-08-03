'use client'

import { useEffect, useState } from 'react'
import { BASE_PATH } from '@/lib/site'

// The employee's self-rating link is emailed automatically on create (see
// sendInviteEmails in lib/email/invites.ts). This panel leads with that fact
// and offers the copy-link box as a fallback, not the primary action, since
// delivery is best-effort (Resend send failures are swallowed, not surfaced
// here) and a manager may want to send it themselves anyway.
export function ShareLinkPanel({
  selfToken,
  subjectName,
}: {
  selfToken: string
  subjectName: string
}) {
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [showLink, setShowLink] = useState(false)

  useEffect(() => {
    setUrl(`${window.location.origin}${BASE_PATH}/a/${selfToken}`)
  }, [selfToken])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="accent-panel border rounded-xl p-6">
      <h3 className="text-sm font-bold accent-text-strong">
        We've emailed {subjectName || 'the leader'} their assessment link
      </h3>
      <p className="text-xs accent-text mt-1">
        They complete their self-assessment on their own device. They rate
        independently and never see your ratings, which is what makes the gap
        analysis meaningful.
      </p>

      {!showLink ? (
        <button
          type="button"
          className="text-xs accent-text font-medium hover:underline mt-3"
          onClick={() => setShowLink(true)}
        >
          Link not arriving, or want to send it yourself? Get the link →
        </button>
      ) : (
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="input flex-1 font-mono text-xs"
          />
          <button type="button" className="btn-primary shrink-0" onClick={copy} disabled={!url}>
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  )
}
