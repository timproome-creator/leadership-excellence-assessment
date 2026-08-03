'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from './auth/AuthModal'
import { BRAND } from '@/lib/brand'
import { BASE_PATH } from '@/lib/site'

// Mr Price Group's internal deployment sits behind a wider portal
// (performance-talent) with Trackers, 9-Box, Scorecard and People alongside
// this assessment tool. The public dcupside.com brand has none of that, so
// only mrpg gets the unified, cadence-ordered nav — dcupside keeps its own
// narrower set untouched. Order follows the FY cadence (see performance-talent's
// lib/cadence.ts): Assessment happens first, then Trackers, then 9-Box, then
// the ongoing Scorecard, then the People roster underneath all of it.
const dcupsideLinks: { href: string; label: string; external?: boolean }[] = [
  { href: '/', label: 'Assessment' },
  { href: '/console', label: 'My assessments' },
  { href: '/about', label: 'About' },
]

const mrpgLinks: { href: string; label: string; external?: boolean }[] = BRAND.allToolsUrl
  ? [
      { href: BRAND.allToolsUrl, label: 'Year', external: true },
      { href: '/', label: 'Assessment' },
      { href: '/console', label: 'My assessments' },
      { href: `${BRAND.allToolsUrl}/trackers`, label: 'Trackers', external: true },
      { href: `${BRAND.allToolsUrl}/ninebox`, label: '9-Box', external: true },
      { href: `${BRAND.allToolsUrl}/scorecard`, label: 'Scorecard', external: true },
      { href: `${BRAND.allToolsUrl}/people`, label: 'People', external: true },
      { href: '/about', label: 'About' },
    ]
  : dcupsideLinks

const links = BRAND.id === 'mrpg' ? mrpgLinks : dcupsideLinks

export function PlatformNav() {
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className="border-b border-black/20 print:hidden"
      style={{ backgroundColor: 'var(--brand-header)' }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          {BRAND.logoSrc ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- plain
                  img is basePath-aware here via the manual BASE_PATH prefix;
                  next/image would need its own config for a static jpeg. */}
              <img src={`${BASE_PATH}${BRAND.logoSrc}`} alt={BRAND.name} className="h-8 w-auto" />
              <span
                className="font-normal text-[10px] uppercase tracking-wide leading-tight"
                style={{ color: 'var(--brand-accent)' }}
              >
                {BRAND.subtitle}
              </span>
            </>
          ) : (
            <span className="text-base font-bold leading-tight" style={{ color: 'var(--brand-on-header)' }}>
              {BRAND.name}
              <br />
              <span
                className="font-normal text-[10px] uppercase tracking-wide"
                style={{ color: 'var(--brand-accent)' }}
              >
                {BRAND.subtitle}
              </span>
            </span>
          )}
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) =>
            link.external ? (
              // Plain <a>, not next/link: this app has basePath '/leadership',
              // so Link would prepend that and keep us inside this app. These
              // hrefs are already absolute (BRAND.allToolsUrl-based), pointing
              // out to the performance-talent portal.
              <a key={link.href} href={link.href} className="nav-link">
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  'nav-link',
                  isActive(link.href) ? 'nav-link--active' : '',
                ].join(' ')}
              >
                {link.label}
              </Link>
            ),
          )}
          {BRAND.id !== 'mrpg' && (
            <a href={BRAND.allToolsUrl ?? '/'} className="nav-link">
              All tools
            </a>
          )}
          <span
            className="w-px h-5 mx-1"
            style={{ backgroundColor: 'var(--brand-header-active)' }}
          />
          {!loading &&
            (user ? (
              <button
                type="button"
                onClick={signOut}
                title={user.email ?? undefined}
                className="nav-link"
              >
                Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuth(true)}
                className="nav-link"
              >
                Sign in
              </button>
            ))}
        </nav>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </header>
  )
}
