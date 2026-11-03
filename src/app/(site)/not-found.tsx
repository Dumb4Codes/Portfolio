import Link from 'next/link'
import Magnetic from '@/components/Magnetic'
import NotFoundScene from '@/components/NotFoundScene'

export const metadata = { title: 'Page not found', robots: { index: false } }

export default function NotFound() {
  return (
    <section className="nf wrap" aria-labelledby="nf-title">
      <NotFoundScene />
      <p className="mono muted">Error 404</p>
      <p className="nf__code display" aria-hidden="true">
        404
      </p>
      <h1 id="nf-title" className="display nf__title">
        This page <em className="serif">does not add up.</em>
      </h1>
      <p className="nf__text">The address may be mistyped, or the project was moved. Nothing is lost.</p>
      <Magnetic>
        <Link href="/" className="btn btn-accent" data-cursor="Home">
          Back home
        </Link>
      </Magnetic>
    </section>
  )
}
