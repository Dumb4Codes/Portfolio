import { notFound } from 'next/navigation'

/** Any unknown URL ends here so the 404 renders inside the site layout (the particles stay mounted). */
export default function CatchAll() {
  notFound()
}
