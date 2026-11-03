import Image from 'next/image'
import { hashSlug } from '@/content/derive'
import { blurFor } from '@/lib/blur'

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
  priority?: boolean
  className?: string
}

/** Project cover: next/image with a blur placeholder, or the generated typographic cover. */
export default async function Cover({ src, alt, title, slug, sizes, priority, className }: Props) {
  if (!src) return <GeneratedCover title={title} slug={slug} className={className} />
  const blur = await blurFor(src)
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={75}
      placeholder={blur ? 'blur' : 'empty'}
      blurDataURL={blur}
      className={className}
      style={{ objectFit: 'cover' }}
    />
  )
}
