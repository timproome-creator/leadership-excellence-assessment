import { NextResponse } from 'next/server'
import { bodySchema, sendReportEmail } from '@/lib/email/report'
import { checkAndRecordSend, isAllowedOrigin, MAX_BODY_CHARS } from '@/lib/emailGuard'

export const dynamic = 'force-dynamic'

// Emails the completed leadership assessment report to the user. The on-screen
// reveal is the source of truth; this is a best-effort "keep a copy" action so
// a pilot user does not lose the report when they close the tab. Same
// template/send path as the automatic manager email fired from
// submitRatings (see lib/email/report.ts) — this route is the client-
// triggered, self-chosen-recipient variant of the same thing.

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'Email is not configured on this deployment.' },
      { status: 503 },
    )
  }

  if (!isAllowedOrigin(req.headers)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const raw = await req.text()
  if (raw.length > MAX_BODY_CHARS) {
    return NextResponse.json({ error: 'Request too large.' }, { status: 413 })
  }

  let parsed: ReturnType<typeof bodySchema.parse>
  try {
    parsed = bodySchema.parse(JSON.parse(raw))
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // HTML escaping already happens inside buildEmailHtml (lib/email/report.ts).
  const guard = await checkAndRecordSend({ tool: 'wlea-report', recipient: parsed.email, headers: req.headers })
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  const { email, ...payload } = parsed
  const { success } = await sendReportEmail({ to: email, payload })
  if (!success) return NextResponse.json({ error: 'Could not send the email.' }, { status: 502 })
  return NextResponse.json({ success: true })
}
