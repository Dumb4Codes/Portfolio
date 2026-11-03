'use client'
import { useEffect, useState } from 'react'

/** Live clock for a time zone. Renders a placeholder on the server so hydration never mismatches. */
export default function LiveClock({ timezone, className }: { timezone: string; className?: string }) {
  const [now, setNow] = useState<string | null>(null)
  const abbr = timezone === 'Asia/Kolkata' ? 'IST' : timezone.split('/').pop()?.replace('_', ' ').toUpperCase()

  useEffect(() => {
    const f = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    const tick = () => setNow(f.format(new Date()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [timezone])

  return (
    <span className={className} aria-hidden="true">
      {abbr} {now ?? '--:--:--'}
    </span>
  )
}
