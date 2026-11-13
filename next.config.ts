import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'], qualities: [60, 75, 85] },
  productionBrowserSourceMaps: false,
  // Next 16 otherwise writes an AGENTS.md into the repo on `next dev`
  agentRules: false,
  // Keystatic's GitHub mode runs the dev editor on 127.0.0.1; Next 16 blocks dev assets/HMR from it otherwise (blank page).
  allowedDevOrigins: ['127.0.0.1'],
  async redirects() {
    return [{ source: '/admin', destination: '/keystatic', permanent: false }]
  },
  async headers() {
    return [
      { source: '/keystatic/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/admin', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      // the résumé opens in the browser, and saves as Youvraj_Singh_Resume.pdf whatever its URL is
      { source: '/resume/:file*', headers: [{ key: 'Content-Disposition', value: 'inline; filename="Youvraj_Singh_Resume.pdf"' }] },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}
export default config
