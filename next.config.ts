import type { NextConfig } from 'next'

// Must match BASE_PATH in lib/site.ts exactly (that constant covers the
// manually-built URLs that Next.js's own basePath prepending doesn't reach).
const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  basePath: '/leadership',
}

export default nextConfig
