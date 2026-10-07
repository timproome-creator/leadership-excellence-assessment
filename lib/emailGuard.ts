// Outbound-email guard (V2 decision D1, 2026-10-07).
//
// The email routes used to send to any recipient, from any caller, with
// user-typed text interpolated into the HTML unescaped: an open relay on the
// dcupside.com sending domain, which also carries sign-in emails. This file
// closes that with four checks, applied before any send:
//   1. same-site Origin (blocks cross-site scripted abuse)
//   2. request size cap
//   3. HTML escaping of every user-supplied string
//   4. database-backed send limits per recipient / IP / tool
//
// FAILS CLOSED: if the email_send_log table is missing or unreachable, the
// send is refused. Requires supabase/email_send_log.sql to have been run.
// Identical copies live in each V1 app (V1 has no shared package).

import { createHash } from 'crypto'
import { createServiceClient } from '@/lib/supabase/service'

const PER_RECIPIENT_PER_HOUR = 3
const PER_IP_PER_HOUR = 10
const PER_TOOL_PER_DAY = 300
export const MAX_BODY_CHARS = 20_000

const DEFAULT_ALLOWED_HOSTS = ['dcupside.com', 'www.dcupside.com', 'localhost', '127.0.0.1']

type HeaderBag = { get(name: string): string | null }

const sha = (s: string) => createHash('sha256').update(s.trim().toLowerCase()).digest('hex')

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Returns a copy with every string (at any depth) HTML-escaped. */
export function escapeDeep<T>(v: T): T {
  if (typeof v === 'string') return escapeHtml(v) as T
  if (Array.isArray(v)) return v.map((x) => escapeDeep(x)) as T
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, escapeDeep(x)])) as T
  }
  return v
}

/** Browsers always send Origin on a cross-origin or same-origin fetch POST. */
export function isAllowedOrigin(h: HeaderBag): boolean {
  const origin = h.get('origin')
  if (!origin) return false
  let host: string
  try {
    host = new URL(origin).hostname.toLowerCase()
  } catch {
    return false
  }
  const own = (h.get('x-forwarded-host') ?? h.get('host') ?? '').split(':')[0].toLowerCase()
  const extra = (process.env.EMAIL_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return host === own || DEFAULT_ALLOWED_HOSTS.includes(host) || extra.includes(host)
}

function clientIp(h: HeaderBag): string {
  return (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'unknown'
}

export type GuardResult = { ok: true } | { ok: false; status: number; error: string }

/** Checks the send limits and, if allowed, records the send. */
export async function checkAndRecordSend(args: {
  tool: string
  recipient: string
  headers: HeaderBag
}): Promise<GuardResult> {
  const recipientHash = sha(args.recipient)
  const ipHash = sha(clientIp(args.headers))
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  let service: ReturnType<typeof createServiceClient>
  try {
    service = createServiceClient()
  } catch (e) {
    console.error('[emailGuard] service client unavailable, refusing to send', e)
    return { ok: false, status: 503, error: 'Email is temporarily unavailable.' }
  }

  const count = async (col: string, val: string, since: string) => {
    const { count: n, error } = await service
      .from('email_send_log')
      .select('id', { count: 'exact', head: true })
      .eq(col, val)
      .gte('created_at', since)
    if (error) throw error
    return n ?? 0
  }

  try {
    const [byRecipient, byIp, byTool] = await Promise.all([
      count('recipient_hash', recipientHash, hourAgo),
      count('ip_hash', ipHash, hourAgo),
      count('tool', args.tool, dayAgo),
    ])
    if (byRecipient >= PER_RECIPIENT_PER_HOUR || byIp >= PER_IP_PER_HOUR || byTool >= PER_TOOL_PER_DAY) {
      return { ok: false, status: 429, error: 'Too many emails requested. Please try again later.' }
    }
    const { error } = await service
      .from('email_send_log')
      .insert({ tool: args.tool, recipient_hash: recipientHash, ip_hash: ipHash })
    if (error) throw error
    return { ok: true }
  } catch (e) {
    console.error('[emailGuard] send-limit check failed, refusing to send', e)
    return { ok: false, status: 503, error: 'Email is temporarily unavailable.' }
  }
}
