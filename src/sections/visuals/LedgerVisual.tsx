'use client'
import { useChapter } from './useChapter'

type Row = { sign: '+' | '−'; qty: string; unit: string; item: string; type: string; note: string; bal: string }

/** Sample data only. Quantities are invented for the picture; the variance line is the point. */
const ROWS: Row[] = [
  { sign: '+', qty: '20.000', unit: 'kg', item: 'ONION', type: 'RECEIPT', note: 'APPROVED', bal: '20.000' },
  { sign: '−', qty: '4.800', unit: 'kg', item: 'ONION', type: 'PRODUCTION', note: 'GRAVY BASE', bal: '15.200' },
  { sign: '+', qty: '6.000', unit: 'kg', item: 'GRAVY BASE', type: 'PRODUCTION', note: 'BATCH 01', bal: '6.000' },
  { sign: '+', qty: '12.000', unit: 'kg', item: 'CHICKEN', type: 'RECEIPT', note: 'APPROVED', bal: '12.000' },
  { sign: '−', qty: '1,000', unit: 'g', item: 'GRAVY BASE', type: 'SALE', note: 'BUTTER CHICKEN ×5', bal: '5.000' },
  { sign: '−', qty: '900', unit: 'g', item: 'CHICKEN', type: 'SALE', note: 'BUTTER CHICKEN ×5', bal: '11.100' },
]
const STAGES = 12
const GATE = 4

const DESCRIPTION =
  'Illustrative ledger with sample data: receipts add stock, production and sales subtract it, every movement is a new line, and the variance at the end is 0.000.'

export default function LedgerVisual({ example }: { example?: string }) {
  const steps = ROWS.length + 2
  const { ref, step } = useChapter<HTMLDivElement>(steps)
  const rows = Math.min(step, ROWS.length)
  const done = step >= steps
  const stage = Math.max(1, Math.round((step / steps) * STAGES))

  return (
    <div ref={ref} className="visual visual--ledger" role="img" aria-label={DESCRIPTION}>
      <div className="vis-head mono">
        <span>Stock ledger</span>
        <span className="vis-tag">Illustrative · sample data</span>
      </div>

      <ol className="ledger" aria-hidden="true">
        {ROWS.map((r, i) => (
          <li key={i} className="ledger__row mono" data-on={i < rows} data-current={i === rows - 1 && !done}>
            <span className={r.sign === '+' ? 'ledger__plus' : 'ledger__minus'}>{r.sign}</span>
            <span className="ledger__qty">
              {r.qty} {r.unit}
            </span>
            <span className="ledger__item">{r.item}</span>
            <span className="ledger__bal">{r.bal}</span>
            <span className="ledger__meta">
              {r.type} · {r.note}
            </span>
          </li>
        ))}
      </ol>

      <div className="ledger__foot mono" aria-hidden="true" data-on={done}>
        <span>Variance after daily closing</span>
        <b className="accent">{done ? '0.000' : '· · ·'}</b>
      </div>

      <div className="rail" aria-hidden="true">
        <div className="rail__ticks">
          {Array.from({ length: STAGES }, (_, i) => (
            <i key={i} data-on={i < stage} data-gate={i + 1 === GATE} />
          ))}
        </div>
        <div className="rail__labels mono muted">
          <span>Purchase</span>
          <span className="rail__gate" style={{ left: `${((GATE - 0.5) / STAGES) * 100}%` }}>
            Approval gate
          </span>
          <span>Locked day</span>
        </div>
      </div>
      {example && <p className="vis-note muted">{example}</p>}
    </div>
  )
}
