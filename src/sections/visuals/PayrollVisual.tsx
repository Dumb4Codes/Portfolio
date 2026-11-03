'use client'
import { useChapter } from './useChapter'

const STATES = ['GENERATED', 'UNDER_REVIEW', 'APPROVED', 'FINALIZED', 'PAID'] as const
const NET = 31250 // sample figure, fictional

const DESCRIPTION =
  'Illustrative payroll clock with sample data. A 24-hour ring shows three shifts: 07:00 to 17:00, 09:00 to 18:30 and 16:30 to 02:30, which crosses midnight. Payroll then moves through five states, from generated to paid, and the difference from the budget sheet lands at zero rupees.'

/** Hour -> point on the ring, 0 at top, clockwise. */
const at = (hour: number, r: number): [number, number] => {
  const a = (hour / 24) * Math.PI * 2
  return [Math.sin(a) * r, -Math.cos(a) * r]
}

const SHIFTS: [number, number, number][] = [
  [7, 17, 0.8],
  [9, 18.5, 0.68],
  [16.5, 26.5, 0.56],
]
const arc = (a: number, b: number, r: number) => {
  const [x1, y1] = at(a, r)
  const [x2, y2] = at(b, r)
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${r} ${r} 0 ${b - a > 12 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

export default function PayrollVisual({ standalone = false }: { standalone?: boolean }) {
  const steps = 40
  const { ref, step } = useChapter<HTMLDivElement>(steps)
  const p = step / steps
  const state = Math.min(STATES.length - 1, Math.floor(p * STATES.length * 0.999))
  const done = step >= steps
  const net = Math.round(NET * Math.min(1, p / 0.8))
  const hand = at(p * 24, 94) // the sign-in/out tick sweeps once around the day
  const inner = at(p * 24, 62)
  const labels = [0, 6, 12, 18]

  return (
    <div ref={ref} className={`visual visual--payroll ${standalone ? 'visual--standalone' : ''}`} role="img" aria-label={DESCRIPTION}>
      <svg viewBox="-100 -100 200 200" aria-hidden="true" className="clock-svg">
        {/* ring + arcs: shown on phones and the case study; on desktop chapters the particles draw them */}
        <g className="clock-static">
          <circle r="96" className="clock-ring" />
          {SHIFTS.map(([a, b, k], i) => (
            <path key={i} d={arc(a, b, 96 * k)} className={i === 2 ? 'clock-arc clock-arc--night' : 'clock-arc'} />
          ))}
        </g>
        {labels.map((h) => {
          const [x, y] = at(h, 109)
          return (
            <text key={h} x={x} y={y} className="clock-hour mono" textAnchor="middle" dominantBaseline="central">
              {String(h).padStart(2, '0')}
            </text>
          )
        })}
        <line x1={inner[0]} y1={inner[1]} x2={hand[0]} y2={hand[1]} className="clock-hand" />
        <circle cx={hand[0]} cy={hand[1]} r="3.2" className="clock-pip" />
      </svg>

      <ul className="shift-legend mono" aria-hidden="true">
        <li><i /> Shift A <b>07:00 → 17:00</b></li>
        <li><i /> Shift B <b>09:00 → 18:30</b></li>
        <li><i className="is-night" /> Shift C <b>16:30 → 02:30</b> <span className="accent">crosses midnight</span></li>
      </ul>

      <div className="net" aria-hidden="true">
        <span className="mono muted">Net pay · sample</span>
        <strong className="net__fig mono">₹ {net.toLocaleString('en-IN')}.00</strong>
        <span className="net__delta mono" data-on={done}>
          <span className="muted">vs budget sheet</span> <b className="accent">Δ ₹0.00</b>
        </span>
      </div>

      <ol className="states mono" aria-hidden="true">
        {STATES.map((s, i) => (
          <li key={s} data-on={i <= state} data-current={i === state}>
            {s}
          </li>
        ))}
      </ol>
      <p className="vis-tag mono">Illustrative · sample data</p>
    </div>
  )
}
