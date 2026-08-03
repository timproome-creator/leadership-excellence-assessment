import { Resend } from 'resend'
import { roleLevel } from '@/lib/framework'
import { baseUrl } from '@/lib/site'
import { BRAND } from '@/lib/brand'

// Brand identity colours (see lib/brand.ts). Semantic colours (green/amber/
// red tone chips, traffic lights) stay hardcoded — they mean the same thing
// in every brand.
const P = BRAND.palette
import type { RoleLevelKey } from '@/lib/framework/types'

// Sent once, at assessment creation. Best-effort: a failure here must never
// block or roll back the assessment record itself. The manager also sees
// their own console link on-screen immediately after create, so a failed
// email is a convenience loss, not an access loss, for them; for the
// employee it means the manager falls back to the copy-link panel.

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function wrapper(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,${P.bandStart},${P.bandEnd});border-radius:12px 12px 0 0;padding:28px;color:${P.bandHeading};">
      <p style="margin:0 0 6px;font-size:11px;color:${P.bandEyebrow};text-transform:uppercase;letter-spacing:0.1em;">${BRAND.emailEyebrow}</p>
      <h1 style="margin:0;font-size:19px;font-weight:700;">${esc(title)}</h1>
    </div>
    <div style="background:white;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
      ${bodyHtml}
      <p style="margin:20px 0 0;font-size:11px;color:#9ca3af;">${BRAND.name}${BRAND.legalName !== BRAND.name ? ` by ${BRAND.legalName}` : ''}.</p>
    </div>
  </div>
</body>
</html>`
}

function button(url: string, label: string): string {
  return `<a href="${url}" style="display:inline-block;background:${P.primary};color:white;font-weight:600;padding:11px 24px;border-radius:8px;text-decoration:none;font-size:14px;">${esc(label)}</a>`
}

export async function sendInviteEmails(args: {
  subjectName: string
  subjectEmail: string
  creatorEmail: string
  roleLevelKey: RoleLevelKey
  selfToken: string
  managerToken: string
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.RESEND_FROM || BRAND.emailFrom
  const roleName = roleLevel(args.roleLevelKey).name
  const selfUrl = `${baseUrl()}/a/${args.selfToken}`
  const managerUrl = `${baseUrl()}/a/${args.managerToken}`

  const selfHtml = wrapper(
    'Your leadership self-assessment',
    `<p style="margin:0 0 14px;font-size:14px;color:#374151;">
      Your manager has set up a Warehouse Leadership Excellence Assessment for you, rated against the <strong>${esc(roleName)}</strong> bar. It takes about 10 minutes.
    </p>
    <p style="margin:0 0 18px;font-size:14px;color:#374151;">
      You rate yourself independently, your manager rates you independently, and neither of you sees the other's scores until you have both finished. That independence is what makes the comparison meaningful.
    </p>
    <p style="margin:0 0 18px;font-size:14px;color:#374151;">
      Your manager may also invite peers or direct reports to give feedback as part of this assessment. If they do, that feedback is only ever shown as a combined group average, never attributed to any one person.
    </p>
    ${button(selfUrl, 'Start your self-assessment →')}
    <p style="margin:18px 0 0;font-size:12px;color:#9ca3af;">This link is private to you. Do not forward it.</p>`,
  )

  const managerHtml = wrapper(
    'Your leadership assessment console',
    `<p style="margin:0 0 14px;font-size:14px;color:#374151;">
      You have set up a leadership assessment for <strong>${esc(args.subjectName)}</strong> against the ${esc(roleName)} bar. This is your private console link: rate as the manager here, and the results unlock once ${esc(args.subjectName)} has completed their side.
    </p>
    ${button(managerUrl, 'Open your console →')}
    <p style="margin:18px 0 0;font-size:12px;color:#9ca3af;">Keep this email. It is the only way back into this assessment.</p>`,
  )

  // Best-effort, independent of each other: one failing must not block the other.
  await Promise.allSettled([
    resend.emails.send({
      from,
      to: args.subjectEmail,
      subject: `Your leadership self-assessment: ${roleName}`,
      html: selfHtml,
    }),
    resend.emails.send({
      from,
      to: args.creatorEmail,
      subject: `Your assessment console: ${args.subjectName}`,
      html: managerHtml,
    }),
  ])
}

const RATER_KIND_LABEL: Record<'peer' | 'direct_report', string> = {
  peer: 'peer',
  direct_report: 'direct report',
}

// Sent once, when a manager adds a peer or direct report to a 360 assessment.
// Same best-effort posture as sendInviteEmails.
export async function sendRaterInvite(args: {
  subjectName: string
  raterEmail: string
  raterKind: 'peer' | 'direct_report'
  roleLevelKey: RoleLevelKey
  raterToken: string
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.RESEND_FROM || BRAND.emailFrom
  const roleName = roleLevel(args.roleLevelKey).name
  const kindLabel = RATER_KIND_LABEL[args.raterKind]
  const url = `${baseUrl()}/a/${args.raterToken}`

  const html = wrapper(
    `Your feedback on ${args.subjectName}`,
    `<p style="margin:0 0 14px;font-size:14px;color:#374151;">
      You have been asked to give ${kindLabel} feedback on <strong>${esc(args.subjectName)}</strong>, rated against the ${esc(roleName)} bar. It takes about 10 minutes.
    </p>
    <p style="margin:0 0 18px;font-size:14px;color:#374151;">
      Your response is combined with feedback from other ${esc(kindLabel)}s and shown only as a group average, never on its own, so nothing you submit can be traced back to you individually.
    </p>
    ${button(url, 'Give your feedback →')}
    <p style="margin:18px 0 0;font-size:12px;color:#9ca3af;">This link is private to you. Do not forward it.</p>`,
  )

  await resend.emails.send({
    from,
    to: args.raterEmail,
    subject: `Your feedback on ${args.subjectName}`,
    html,
  })
}

// Sent when a manager has lost their console link (e.g. the original invite
// email never arrived). Looks up by creator_email, so may cover several
// assessments the same address created — one email lists every console link.
export async function sendConsoleLinkRecovery(args: {
  toEmail: string
  assessments: { subjectName: string; managerToken: string }[]
}): Promise<void> {
  if (!process.env.RESEND_API_KEY || args.assessments.length === 0) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.RESEND_FROM || BRAND.emailFrom

  const rows = args.assessments
    .map(
      (a) => `<p style="margin:0 0 14px;font-size:14px;color:#374151;">
        <strong>${esc(a.subjectName)}</strong><br/>
        ${button(`${baseUrl()}/a/${a.managerToken}`, 'Open your console →')}
      </p>`,
    )
    .join('')

  const html = wrapper(
    'Your assessment console links',
    `<p style="margin:0 0 14px;font-size:14px;color:#374151;">
      You asked to recover access to your Warehouse Leadership Excellence Assessment. Here ${args.assessments.length === 1 ? 'is the console link' : 'are the console links'} tied to this email address:
    </p>
    ${rows}
    <p style="margin:18px 0 0;font-size:12px;color:#9ca3af;">Keep this email. Each link is the only way back into that assessment.</p>`,
  )

  await resend.emails.send({
    from,
    to: args.toEmail,
    subject: 'Your assessment console links',
    html,
  })
}
