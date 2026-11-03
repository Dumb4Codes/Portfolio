import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0B', color: '#EDE8DF', fontSize: 84, fontWeight: 900, letterSpacing: -5, position: 'relative' }}>
        YS
        <div style={{ position: 'absolute', right: 30, top: 28, width: 16, height: 16, borderRadius: 16, background: '#FF5A1F' }} />
      </div>
    ),
    size,
  )
}
