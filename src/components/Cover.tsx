import Img from '@/components/Img'
import { hashSlug } from '@/content/derive'

/** Typographic cover for projects without an image: title in Archivo on a tint derived from the slug. Never blank. */
export function GeneratedCover({ title, slug, className = '' }: { title: string; slug: string; className?: string }) {
  const h = Math.round(hashSlug(slug) * 360)
  const ang = Math.round(hashSlug(slug + 'a') * 90 + 120)
  return (
    <div className={`gen-cover ${className}`} style={{ ['--h' as string]: h, ['--ang' as string]: `${ang}deg` }} aria-hidden="true">
      <span className="gen-cover__title display">{title}</span>
      <span className="gen-cover__dots" />
    </div>
  )
}

type Props = {
  src?: string
  alt: string
  title: string
  slug: string
  sizes: string
  blur?: string
  priority?: boolean
  className?: string
}

/** Project cover: an optimised <img> with a blur placeholder (computed at build, passed in), or the generated typographic cover. */
export default function Cover({ src, alt, title, slug, sizes, blur, priority, className }: Props) {
  if (!src) return <GeneratedCover title={title} slug={slug} className={className} />
  return (
    <Img
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={75}
      blur={blur}
      className={className}
      style={{ objectFit: 'cover' }}
    />
  )
}
