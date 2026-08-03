'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { roleLevel } from '@/lib/framework'

// Client component, not a Server Component read: a magic-link sign-in
// completes in a new tab, and useAuth's onAuthStateChange subscription is
// what makes this tab pick that up live, without a manual refresh.

interface RosterRow {
  id: string
  subjectName: string
  roleLevelName: string
  status: string
  selfSubmitted: boolean
  managerSubmitted: boolean
  maturityLabel: string | null
  managerToken: string
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  open: { label: 'In progress', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  complete: { label: 'Complete', className: 'bg-green-50 text-green-700 border-green-200' },
  revealed: { label: 'Complete', className: 'bg-green-50 text-green-700 border-green-200' },
}

function StatusChip({ status, selfSubmitted, managerSubmitted }: RosterRow) {
  const meta = STATUS_LABEL[status] ?? STATUS_LABEL.open
  if (status === 'open') {
    const waiting = !selfSubmitted && !managerSubmitted
      ? 'Awaiting both'
      : !selfSubmitted
        ? 'Awaiting self'
        : 'Awaiting manager'
    return (
      <span className={`text-[11px] font-medium rounded-full border px-2 py-0.5 ${meta.className}`}>
        {waiting}
      </span>
    )
  }
  return (
    <span className={`text-[11px] font-medium rounded-full border px-2 py-0.5 ${meta.className}`}>
      {meta.label}
    </span>
  )
}

export default function ConsolePage() {
  const { user, loading } = useAuth()
  const [rows, setRows] = useState<RosterRow[] | null>(null)

  useEffect(() => {
    if (!user) {
      setRows(null)
      return
    }
    let cancelled = false
    const supabase = createClient()
    supabase
      .from('wlea_assessments')
      .select(
        'id, subject_name, role_level, status, self_submitted_at, manager_submitted_at, maturity_label, manager_token, created_at',
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        setRows(
          (error ? [] : (data ?? [])).map((r) => ({
            id: r.id as string,
            subjectName: (r.subject_name as string) || 'Untitled',
            roleLevelName: roleLevel(r.role_level as string).shortName,
            status: r.status as string,
            selfSubmitted: !!r.self_submitted_at,
            managerSubmitted: !!r.manager_submitted_at,
            maturityLabel: r.maturity_label as string | null,
            managerToken: r.manager_token as string,
          })),
        )
      })
    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="accent-text text-xs font-semibold uppercase tracking-wide mb-2">
          My assessments
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Every assessment you have created</h1>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : !user ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-600">
              Sign in from the top-right corner to see every assessment tied to your account.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Assessments created while signed out are still accessible by their link, but will
              not appear here.
            </p>
          </div>
        ) : rows === null ? (
          <p className="text-sm text-gray-400">Loading your assessments...</p>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-600">
              No assessments yet under this account.
            </p>
            <Link href="/" className="text-sm accent-text font-medium hover:underline mt-2 inline-block">
              Create your first assessment →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-200 text-left">
                  <th className="font-medium py-3 px-4">Leader</th>
                  <th className="font-medium py-3 px-4">Role bar</th>
                  <th className="font-medium py-3 px-4">Status</th>
                  <th className="font-medium py-3 px-4">Maturity</th>
                  <th className="font-medium py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4 font-medium text-gray-900">{r.subjectName}</td>
                    <td className="py-3 px-4 text-gray-600">{r.roleLevelName}</td>
                    <td className="py-3 px-4">
                      <StatusChip {...r} />
                    </td>
                    <td className="py-3 px-4 text-gray-600">{r.maturityLabel ?? '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/a/${r.managerToken}`}
                        className="text-sm accent-text font-medium hover:underline"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
