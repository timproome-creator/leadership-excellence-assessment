import type { Metadata } from 'next'
import './globals.css'
import { PlatformNav } from '@/components/PlatformNav'
import { BRAND } from '@/lib/brand'

export const metadata: Metadata = {
  title: BRAND.metaTitle,
  description: BRAND.metaDescription,
  keywords: [
    'warehouse leadership assessment',
    'DC manager competency',
    'leadership development',
    'supply chain leadership',
    'competency assessment',
    'succession planning',
    'two-way assessment',
  ],
  openGraph: {
    title: BRAND.metaTitle,
    description: BRAND.metaDescription,
    type: 'website',
    siteName: BRAND.ogSiteName,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-brand={BRAND.id}>
      <body className="font-sans antialiased">
        <PlatformNav />
        {children}
      </body>
    </html>
  )
}
