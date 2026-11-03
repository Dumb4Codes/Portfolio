import { ImageResponse } from 'next/og'
import { mulberry32 } from '@/gl/shapes/rng'

export const OG_SIZE = { width: 1200, height: 630 }

/** Share image: carbon background, a field of particle-like dots, big title. No external fonts or images. */
export function ogImage({ title, kicker, sub }: { title: string; kicker: string; sub?: string }) {
  const rnd = mulberry32(5)
  const dots = Array.from({ length: 520 }, () => {
    const a = rnd() * Math.PI * 2
    const r = Math.sqrt(rnd()) * 330
    return { x: 880 + Math.cos(a) * r * 1.15, y: 315 + Math.sin(a) * r * 0.95, s: 2 + rnd() * 3, o: 0.15 + rnd() * 0.6, hot: rnd() > 0.97 }
  })
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#0A0A0B', color: '#EDE8DF', fontFamily: 'sans-serif' }}>
        {dots.map((d, i) => (
          <div key={i} style={{ position: 'absolute', left: d.x, top: d.y, width: d.s, height: d.s, borderRadius: 9, background: d.hot ? '#FF5A1F' : '#EDE8DF', opacity: d.hot ? 1 : d.o }} />
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 64, width: '100%', height: '100%' }}>
          <div style={{ display: 'flex', fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', color: '#8A857C' }}>{kicker}</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: title.length > 18 ? 92 : 128, fontWeight: 800, letterSpacing: -4, lineHeight: 0.95, maxWidth: 760 }}>{title}</div>
            {sub && <div style={{ display: 'flex', fontSize: 32, color: '#8A857C', marginTop: 28, maxWidth: 700 }}>{sub}</div>}
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  )
}
