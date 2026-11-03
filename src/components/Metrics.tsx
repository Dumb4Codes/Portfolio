type M = { value: string; label: string }

/** Mono counters. The HTML shows the final value; the motion engine counts it up from zero when it scrolls in. */
export default function Metrics({ items, className = '', large = false }: { items: M[]; className?: string; large?: boolean }) {
  if (!items.length) return null
  return (
    <dl className={`metrics ${large ? 'metrics--lg' : ''} ${className}`}>
      {items.map((m) => (
        <div key={m.label} className="metric">
          <dt className="mono muted">{m.label}</dt>
          <dd className="metric__value mono" data-metric={m.value}>
            {m.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
