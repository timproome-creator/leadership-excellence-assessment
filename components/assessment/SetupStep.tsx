'use client'

import { useState } from 'react'
import { ROLE_LEVELS } from '@/lib/framework'
import type { RoleLevelKey } from '@/lib/framework/types'

export interface AssessmentMeta {
  subjectName: string
  subjectEmail: string
  creatorEmail: string
  roleLevel: RoleLevelKey
  industry: string
  site: string
  country: string
  businessUnit: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SetupStep({
  onStart,
  heading = 'Set up the assessment',
  subheading = 'The role you choose sets the expectation bar each competency is rated against.',
  submitLabel = 'Start self-assessment →',
  busy = false,
}: {
  onStart: (meta: AssessmentMeta) => void
  heading?: string
  subheading?: string
  submitLabel?: string
  busy?: boolean
}) {
  const [subjectName, setSubjectName] = useState('')
  const [subjectEmail, setSubjectEmail] = useState('')
  const [creatorEmail, setCreatorEmail] = useState('')
  const [roleLevel, setRoleLevel] = useState<RoleLevelKey | ''>('')
  const [industry, setIndustry] = useState('')
  const [site, setSite] = useState('')
  const [country, setCountry] = useState('')
  const [businessUnit, setBusinessUnit] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit() {
    if (!subjectName.trim()) return setError('Enter the leader’s name.')
    if (!roleLevel) return setError('Select the role being assessed.')
    if (!EMAIL_RE.test(subjectEmail.trim())) return setError('Enter a valid email for the leader, their self-assessment link is sent there.')
    if (!EMAIL_RE.test(creatorEmail.trim())) return setError('Enter your own email, your console link is sent there so you don’t lose access.')
    setError(null)
    onStart({
      subjectName: subjectName.trim(),
      subjectEmail: subjectEmail.trim(),
      creatorEmail: creatorEmail.trim(),
      roleLevel,
      industry,
      site,
      country,
      businessUnit,
    })
  }

  const selected = ROLE_LEVELS.find((r) => r.key === roleLevel)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-gray-900">{heading}</h2>
      <p className="text-sm text-gray-500 mt-1">{subheading}</p>

      <div className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Leader being assessed
          </label>
          <input
            className="input"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="e.g. Sam Dlamini"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Leader&rsquo;s email
            </label>
            <input
              type="email"
              className="input"
              value={subjectEmail}
              onChange={(e) => setSubjectEmail(e.target.value)}
              placeholder="sam@company.com"
            />
            <p className="text-xs text-gray-400 mt-1">Their self-assessment link is emailed here</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Your email
            </label>
            <input
              type="email"
              className="input"
              value={creatorEmail}
              onChange={(e) => setCreatorEmail(e.target.value)}
              placeholder="you@company.com"
            />
            <p className="text-xs text-gray-400 mt-1">Your console link is emailed here too</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Role being assessed
          </label>
          <div className="grid sm:grid-cols-2 gap-2">
            {ROLE_LEVELS.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRoleLevel(r.key)}
                className={[
                  'text-left rounded-lg border px-3 py-2.5 transition-colors',
                  roleLevel === r.key
                    ? 'accent-selected'
                    : 'border-gray-200 hover:border-gray-300',
                ].join(' ')}
              >
                <div className="text-sm font-semibold text-gray-900">{r.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{r.scope}</div>
              </button>
            ))}
          </div>
        </div>

        {selected && (
          <p className="text-xs accent-text accent-panel rounded-lg px-3 py-2">
            Rating against the <strong>{selected.name}</strong> bar: {selected.scope}
          </p>
        )}

        <details className="text-sm">
          <summary className="cursor-pointer text-gray-600 font-medium">
            Optional context (for reporting)
          </summary>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <input className="input" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Industry (e.g. Retail)" />
            <input className="input" value={businessUnit} onChange={(e) => setBusinessUnit(e.target.value)} placeholder="Business unit" />
            <input className="input" value={site} onChange={(e) => setSite(e.target.value)} placeholder="Site / DC" />
            <input className="input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
          </div>
        </details>

        {error && <p className="err">{error}</p>}

        <div className="flex justify-end pt-2">
          <button type="button" className="btn-primary" onClick={submit} disabled={busy}>
            {busy ? 'Working...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
