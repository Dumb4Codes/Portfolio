/** Mono strip that drifts sideways (the motion engine speeds it up with scroll velocity). Wrapped and static under reduced motion. */
export default function Ticker({ items }: { items: string[] }) {
  const list = items.map((t) => t.toUpperCase())
  return (
    <div className="ticker">
      <div className="ticker__track mono">
        {[0, 1].map((dup) => (
          <ul key={dup} className="ticker__set" {...(dup === 1 ? { 'aria-hidden': true } : { 'aria-label': 'Technologies I use most' })}>
            {list.map((t) => (
              <li key={t}>
                {t}
                <span aria-hidden="true"> · </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
