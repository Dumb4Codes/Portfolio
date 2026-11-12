import { routePath, ROUTE_NODES } from '@/gl/shapes/route'
import type { Project } from '@/content/schema'

/**
 * Procedural covers for confidential work. No screenshots, no real data: an abstract of what the
 * system does, drawn as SVG in the site's own language (mono hairlines, one accent). Server-rendered.
 */

const W = 160
const H = 100

function Ledger() {
  const rows = 7
  const top = 14
  const rowH = (H - 30) / rows
  const lit = 4
  return (
    <>
      <g className="icov__grid">
        {Array.from({ length: rows + 1 }, (_, i) => (
          <line key={i} x1="14" x2={W - 14} y1={top + i * rowH} y2={top + i * rowH} />
        ))}
      </g>
      {Array.from({ length: rows }, (_, r) => {
        const y = top + r * rowH + rowH / 2
        const long = 38 + ((r * 37) % 26)
        const num = 14 + ((r * 19) % 10)
        const hot = r === lit
        return (
          <g key={r} className={hot ? 'icov__row is-hot' : 'icov__row'} style={{ opacity: r > lit ? 0.45 : 1 }}>
            <rect x="16" y={y - 1.3} width="4" height="2.6" rx="1.3" className="icov__sign" />
            <rect x="26" y={y - 1.1} width="18" height="2.2" rx="1.1" />
            <rect x="50" y={y - 1.1} width={long} height="2.2" rx="1.1" />
            <rect x={W - 16 - num} y={y - 1.1} width={num} height="2.2" rx="1.1" />
          </g>
        )
      })}
      <text x={W - 14} y={H - 7} textAnchor="end" className="icov__text">
        VARIANCE 0.000
      </text>
      <text x="14" y={H - 7} className="icov__text icov__text--muted">
        APPEND-ONLY
      </text>
    </>
  )
}

const at = (hour: number, r: number): [number, number] => {
  const a = (hour / 24) * Math.PI * 2
  return [Math.sin(a) * r, -Math.cos(a) * r]
}
const arc = (a: number, b: number, r: number) => {
  const [x1, y1] = at(a, r)
  const [x2, y2] = at(b, r)
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${r} ${r} 0 ${b - a > 12 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

function Payroll() {
  const R = 36
  const [hx, hy] = at(17.5, R - 2)
  return (
    <>
      <g transform={`translate(${W / 2} ${H / 2 + 2})`}>
        <circle r={R} className="icov__ring" />
        {Array.from({ length: 24 }, (_, h) => {
          const [x1, y1] = at(h, R)
          const [x2, y2] = at(h, R - (h % 6 === 0 ? 4 : 2))
          return <line key={h} x1={x1} y1={y1} x2={x2} y2={y2} className="icov__tick" />
        })}
        <path d={arc(7, 17, R * 0.8)} className="icov__arc" />
        <path d={arc(9, 18.5, R * 0.66)} className="icov__arc" />
        <path d={arc(16.5, 26.5, R * 0.52)} className="icov__arc is-hot" />
        <line x1="0" y1="0" x2={hx} y2={hy} className="icov__hand" />
        <circle r="1.8" className="icov__pip" />
      </g>
      <text x="14" y={H - 7} className="icov__text icov__text--muted">
        24H · 3 SHIFTS
      </text>
      <text x={W - 14} y={H - 7} textAnchor="end" className="icov__text">
        Δ ₹0.00
      </text>
    </>
  )
}

function Route() {
  const w = W - 28
  const h = H - 36
  return (
    <>
      <g transform="translate(14 12)">
        <path d={routePath(w, h)} className="icov__route" />
        {ROUTE_NODES.map(([x, y], i) => {
          const cx = (x * 0.5 + 0.5) * w
          const cy = (0.5 - y * 0.5) * h
          const last = i === ROUTE_NODES.length - 1
          return last ? <circle key={i} cx={cx} cy={cy} r="4.2" className="icov__home" /> : <circle key={i} cx={cx} cy={cy} r={i === 2 ? 3.2 : 2.4} className={i === 2 ? 'icov__node is-hot' : 'icov__node'} />
        })}
      </g>
      <text x="14" y={H - 7} className="icov__text icov__text--muted">
        1 RIDER · 4 STOPS
      </text>
      <text x={W - 14} y={H - 7} textAnchor="end" className="icov__text">
        LIVE · 5S
      </text>
    </>
  )
}

const LABEL: Record<Project['visual'], string> = {
  ledger: 'Illustrative cover: an append-only stock ledger with a zero variance line',
  payroll: 'Illustrative cover: a 24-hour clock with three shift arcs and a zero payroll difference',
  route: 'Illustrative cover: a delivery route through four stops to home',
  none: 'Illustrative cover',
}

export default function InternalCover({ visual, className = '' }: { visual: Project['visual']; className?: string }) {
  return (
    <div className={`icov icov--${visual} ${className}`} role="img" aria-label={LABEL[visual]}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id={`dots-${visual}`} width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.55" className="icov__dot" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#dots-${visual})`} />
        {visual === 'ledger' && <Ledger />}
        {visual === 'payroll' && <Payroll />}
        {visual === 'route' && <Route />}
      </svg>
      <span className="vis-tag mono-sm">Illustrative · sample data</span>
    </div>
  )
}
