'use client'
import dynamic from 'next/dynamic'

/** Vercel's free analytics and speed insights, loaded after hydration and only when rendered (on Vercel). */
const Analytics = dynamic(() => import('@vercel/analytics/next').then((m) => m.Analytics), { ssr: false })
const SpeedInsights = dynamic(() => import('@vercel/speed-insights/next').then((m) => m.SpeedInsights), { ssr: false })

export default function Telemetry() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
