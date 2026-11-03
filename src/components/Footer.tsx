import LiveClock from './LiveClock'
import BackToTop from './BackToTop'

export default function Footer({ name, timezone, builtAt, socials }: { name: string; timezone: string; builtAt: string; socials: { label: string; href: string }[] }) {
  const updated = new Date(builtAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="rule" />
        <div className="site-footer__row mono">
          <LiveClock timezone={timezone} className="muted" />
          <span className="muted">Last updated {updated}</span>
          <span className="muted">Designed &amp; built by {name}</span>
          <ul className="site-footer__links">
            {socials.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <span className="muted kbd-note">Press ⌘K / Ctrl K</span>
          <BackToTop />
        </div>
      </div>
    </footer>
  )
}
