import { Resend } from 'resend'
import { z } from 'zod'
import { BRAND } from '@/lib/brand'

// Brand identity colours (see lib/brand.ts). Semantic colours (green/amber/
// red tone chips, traffic lights) stay hardcoded — they mean the same thing
// in every brand.
const P = BRAND.palette

// Shared between the client-triggered "email me a copy" route
// (app/api/email-results/route.ts) and the automatic send fired server-side
// from submitRatings when both sides complete. One HTML template, one send
// path, so the two can never drift.

const tone = z.enum(['good', 'warn', 'bad', 'neutral'])

const rowSchema = z.object({
  name: z.string(),
  self: z.number().nullable(),
  manager: z.number().nullable(),
  target: z.number(),
  light: z.enum(['green', 'amber', 'red']).nullable(),
  gapLabel: z.string().nullable(),
  gapTone: tone.nullable(),
})

export const reportPayloadSchema = z.object({
  subjectName: z.string(),
  roleLevelName: z.string(),
  context: z.string(),
  reportUrl: z.string(),
  executiveSummary: z.object({
    maturityLabel: z.string(),
    strengthsNarrative: z.string(),
    strengthNames: z.array(z.string()),
    gapsNarrative: z.string(),
    gapNames: z.array(z.string()),
    recommendation: z.string(),
  }),
  overallSelf: z.number().nullable(),
  overallManager: z.number().nullable(),
  maturityLabel: z.string(),
  competencies: z.array(rowSchema),
  criticalFailures: z.array(
    z.object({ name: z.string(), managerScore: z.number().nullable(), businessRisk: z.string() }),
  ),
  strengths: z.array(z.object({ name: z.string(), managerScore: z.number().nullable() })),
  developmentPriorities: z.array(
    z.object({ name: z.string(), managerScore: z.number().nullable(), target: z.number() }),
  ),
  perceptionGaps: z.array(
    z.object({
      name: z.string(),
      self: z.number().nullable(),
      manager: z.number().nullable(),
      gapLabel: z.string().nullable(),
    }),
  ),
  businessRisks: z.array(z.object({ competencyName: z.string(), risk: z.string() })),
  recommendations: z.object({
    immediate: z.array(z.object({ competencyName: z.string().nullable(), content: z.string() })),
    actions30Day: z.array(z.object({ competencyName: z.string().nullable(), content: z.string() })),
    actions90Day: z.array(z.object({ competencyName: z.string().nullable(), content: z.string() })),
    training: z.array(z.object({ competencyName: z.string().nullable(), content: z.string() })),
    coaching: z.array(z.object({ competencyName: z.string().nullable(), content: z.string() })),
    succession: z.string(),
    developmentPlans: z.array(
      z.object({
        competencyName: z.string(),
        currentScore: z.number(),
        targetScore: z.number(),
        expectedBehaviouralChange: z.string(),
        workplaceAssignments: z.array(z.string()),
        coaching: z.array(z.string()),
        formalLearning: z.array(z.string()),
        successMeasure: z.string(),
        evidenceRequired: z.array(z.string()),
        reviewTimelineDays: z.array(z.number()),
        estimatedTimeToCompetency: z.string(),
      }),
    ),
  }),
})

export const bodySchema = reportPayloadSchema.extend({ email: z.string().email() })

export type ReportPayload = z.infer<typeof reportPayloadSchema>

const TONE_STYLE: Record<'good' | 'warn' | 'bad' | 'neutral', { color: string; bg: string; border: string }> = {
  good: { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  warn: { color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  bad: { color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  neutral: { color: '#4b5563', bg: '#f9fafb', border: '#e5e7eb' },
}

const LIGHT_COLOR: Record<'green' | 'amber' | 'red', string> = {
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
}

const fmt = (n: number | null, decimals = 1) =>
  n === null || !Number.isFinite(n)
    ? '-'
    : new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(n)

// Basic escaping: free-text fields (names, risks, comments) are user-supplied.
const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function chip(label: string, t: 'good' | 'warn' | 'bad' | 'neutral'): string {
  const s = TONE_STYLE[t]
  return `<span style="display:inline-block;font-size:11px;font-weight:600;color:${s.color};background:${s.bg};border:1px solid ${s.border};border-radius:9999px;padding:2px 8px;">${esc(label)}</span>`
}

function buildEmailHtml(d: ReportPayload): string {
  const context = d.context ? `<p style="margin:6px 0 0;color:${P.bandBody};font-size:13px;">${esc(d.context)}</p>` : ''

  const rows = d.competencies
    .map((r) => {
      const light = r.light
        ? `<span style="display:inline-block;width:10px;height:10px;border-radius:9999px;background:${LIGHT_COLOR[r.light]};"></span>`
        : ''
      const gap = r.gapLabel && r.gapTone ? chip(r.gapLabel, r.gapTone) : ''
      return `<tr>
        <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;color:#1f2937;font-size:13px;">${esc(r.name)}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;text-align:center;color:${P.secondary};font-weight:600;font-size:13px;">${fmt(r.self)}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;text-align:center;color:${P.primary};font-weight:600;font-size:13px;">${fmt(r.manager)}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;text-align:center;color:#9ca3af;font-size:13px;">${fmt(r.target, 0)}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;text-align:center;">${light}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;">${gap}</td>
      </tr>`
    })
    .join('')

  const chipRow = (names: string[], color: string, bg: string, border: string) =>
    names.length
      ? `<div style="margin:8px 0 0;">${names
          .map(
            (n) =>
              `<span style="display:inline-block;font-size:11px;font-weight:600;color:${color};background:${bg};border:1px solid ${border};border-radius:9999px;padding:2px 8px;margin:0 4px 4px 0;">${esc(n)}</span>`,
          )
          .join('')}</div>`
      : ''

  // Strengths deliberately celebrated before gaps — see lib/executiveSummary.ts.
  const summaryBlock = `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:18px;margin-bottom:20px;">
    <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#374151;">Executive summary</p>
    <p style="margin:0;font-size:13px;color:#1f2937;">${esc(d.executiveSummary.strengthsNarrative)}</p>
    ${chipRow(d.executiveSummary.strengthNames, '#15803d', '#f0fdf4', '#bbf7d0')}
    <p style="margin:12px 0 0;font-size:13px;color:#1f2937;">${esc(d.executiveSummary.gapsNarrative)}</p>
    ${chipRow(d.executiveSummary.gapNames, '#b45309', '#fffbeb', '#fde68a')}
    <div style="background:${P.panelBg};border:1px solid ${P.panelBorder};border-radius:8px;padding:10px 14px;margin-top:14px;">
      <p style="margin:0;font-size:11px;font-weight:700;color:${P.deep};text-transform:uppercase;letter-spacing:0.05em;">Overall recommendation</p>
      <p style="margin:4px 0 0;font-size:13px;color:${P.panelText};">${esc(d.executiveSummary.recommendation)}</p>
    </div>
  </div>`

  const criticalBlock = d.criticalFailures.length
    ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#991b1b;">Critical-failure flags</p>
        <ul style="margin:0;padding-left:18px;color:#991b1b;font-size:13px;">
          ${d.criticalFailures.map((c) => `<li style="margin-bottom:4px;"><strong>${esc(c.name)}</strong>, manager score ${fmt(c.managerScore, 0)}. ${esc(c.businessRisk)}</li>`).join('')}
        </ul>
      </div>`
    : ''

  const strengthsBlock = d.strengths.length
    ? `<ul style="margin:0;padding-left:18px;color:#1f2937;font-size:13px;">${d.strengths.map((s) => `<li style="margin-bottom:3px;">${esc(s.name)} <span style="color:#9ca3af;">&middot; manager ${fmt(s.managerScore, 0)}</span></li>`).join('')}</ul>`
    : `<p style="margin:0;color:#9ca3af;font-size:13px;">No competency rated above the bar yet.</p>`

  const prioritiesBlock = d.developmentPriorities.length
    ? `<ol style="margin:0;padding-left:18px;color:#1f2937;font-size:13px;">${d.developmentPriorities.map((p) => `<li style="margin-bottom:3px;">${esc(p.name)} <span style="color:#9ca3af;">&middot; manager ${fmt(p.managerScore, 0)} vs bar ${fmt(p.target, 0)}</span></li>`).join('')}</ol>`
    : `<p style="margin:0;color:#9ca3af;font-size:13px;">No competency below the bar. Solid across the board.</p>`

  const gapsBlock = d.perceptionGaps.length
    ? `<div style="background:white;border:1px solid #e5e7eb;border-radius:10px;padding:18px;margin-bottom:16px;">
        <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#374151;">Biggest perception gaps: start the conversation here</p>
        <p style="margin:0 0 10px;font-size:12px;color:#6b7280;">Where the leader and the manager see things most differently.</p>
        <ul style="margin:0;padding-left:18px;color:#1f2937;font-size:13px;">
          ${d.perceptionGaps.map((g) => `<li style="margin-bottom:3px;">${esc(g.name)} <span style="color:#9ca3af;">&middot; self ${fmt(g.self, 0)} &middot; mgr ${fmt(g.manager, 0)}</span>${g.gapLabel ? ` ${esc(g.gapLabel)}` : ''}</li>`).join('')}
        </ul>
      </div>`
    : ''

  const risksBlock = d.businessRisks.length
    ? `<div style="background:white;border:1px solid #e5e7eb;border-radius:10px;padding:18px;margin-bottom:16px;">
        <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#374151;">Business risks from gaps</p>
        <ul style="margin:0;padding-left:18px;color:#374151;font-size:13px;">
          ${d.businessRisks.map((b) => `<li style="margin-bottom:4px;"><strong style="color:#111827;">${esc(b.competencyName)}:</strong> ${esc(b.risk)}</li>`).join('')}
        </ul>
      </div>`
    : ''

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:640px;margin:0 auto;">

    <div style="background:linear-gradient(135deg,${P.bandStart},${P.bandEnd});border-radius:12px 12px 0 0;padding:32px 28px;color:${P.bandHeading};">
      <p style="margin:0 0 8px;font-size:11px;color:${P.bandEyebrow};text-transform:uppercase;letter-spacing:0.1em;">${BRAND.emailEyebrow}</p>
      <h1 style="margin:0;font-size:22px;font-weight:700;line-height:1.3;">Leadership profile: ${esc(d.subjectName)}</h1>
      <p style="margin:6px 0 0;color:${P.bandBody};font-size:13px;">Rated against the ${esc(d.roleLevelName)} bar</p>
      ${context}
    </div>

    <div style="background:white;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:28px;">

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
        <tr>
          <td style="text-align:center;width:33%;">
            <div style="font-size:32px;font-weight:700;color:${P.secondary};line-height:1;">${fmt(d.overallSelf)}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px;">Self</div>
          </td>
          <td style="text-align:center;width:33%;">
            <div style="font-size:32px;font-weight:700;color:${P.primary};line-height:1;">${fmt(d.overallManager)}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px;">Manager</div>
          </td>
          <td style="text-align:center;width:33%;">
            <div style="font-size:16px;font-weight:600;color:#111827;line-height:1;padding-top:8px;">${esc(d.maturityLabel)}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:6px;">Maturity</div>
          </td>
        </tr>
      </table>

      ${summaryBlock}

      ${criticalBlock}

      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#374151;">Competency-by-competency</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:22px;">
        <thead>
          <tr style="color:#6b7280;font-size:11px;text-align:left;border-bottom:1px solid #e5e7eb;">
            <th style="padding:6px;font-weight:500;">Competency</th>
            <th style="padding:6px;font-weight:500;text-align:center;">Self</th>
            <th style="padding:6px;font-weight:500;text-align:center;">Mgr</th>
            <th style="padding:6px;font-weight:500;text-align:center;">Bar</th>
            <th style="padding:6px;font-weight:500;text-align:center;"></th>
            <th style="padding:6px;font-weight:500;">Read</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td style="width:50%;vertical-align:top;padding-right:8px;">
            <div style="background:#f9fafb;border:1px solid #f3f4f6;border-radius:10px;padding:16px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#15803d;">Strengths</p>
              ${strengthsBlock}
            </div>
          </td>
          <td style="width:50%;vertical-align:top;padding-left:8px;">
            <div style="background:#f9fafb;border:1px solid #f3f4f6;border-radius:10px;padding:16px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#b45309;">Development priorities</p>
              ${prioritiesBlock}
            </div>
          </td>
        </tr>
      </table>

      ${gapsBlock}
      ${risksBlock}

      <div style="background:${P.panelBg};border:1px solid ${P.panelBorder};border-radius:10px;padding:16px;margin-top:4px;text-align:center;">
        <p style="margin:0 0 12px;font-size:13px;color:${P.panelText};">This is a summary. The full development plan, including 70/20/10 actions and review timelines for each priority, is on the online report.</p>
        <a href="${d.reportUrl}" style="display:inline-block;background:${P.primary};color:white;font-weight:600;padding:10px 22px;border-radius:8px;text-decoration:none;font-size:13px;">View the full report online &rarr;</a>
      </div>

      <p style="margin:20px 0 0;font-size:11px;color:#9ca3af;">This report was generated by ${BRAND.name}. Scores are on a 1 to 5 scale, rated against the expectation bar for the selected role.</p>
    </div>
  </div>
</body>
</html>`
}

// Best-effort: never throws. Callers (the API route and the auto-send on
// completion) both treat a failed report email as a convenience loss, not a
// blocker — the on-screen reveal is always the source of truth.
export async function sendReportEmail(args: {
  to: string
  payload: ReportPayload
}): Promise<{ success: boolean }> {
  if (!process.env.RESEND_API_KEY) return { success: false }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.RESEND_FROM || BRAND.emailFrom

  try {
    const { error } = await resend.emails.send({
      from,
      to: args.to,
      subject: `Leadership profile: ${args.payload.subjectName}`,
      html: buildEmailHtml(args.payload),
    })
    return { success: !error }
  } catch {
    return { success: false }
  }
}
