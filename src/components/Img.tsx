import { getImageProps } from 'next/image'
import { preload } from 'react-dom'

type Props = {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  quality?: number
  priority?: boolean
  /** blur placeholder (data URL), computed at build */
  blur?: string
  className?: string
  style?: React.CSSProperties
  draggable?: boolean
}

/**
 * next/image optimisation (AVIF/WebP, srcset, blur placeholder) rendered as a plain <img>.
 * `<Image>` is a client component, and every instance costs hydration time on phones; this is the same
 * output for static pictures with none of that cost.
 */
export default function Img({ src, alt, width, height, fill, sizes, quality = 75, priority, blur, className, style, draggable }: Props) {
  const { props } = getImageProps({
    src,
    alt,
    width,
    height,
    fill,
    sizes,
    quality,
    priority,
    placeholder: blur ? 'blur' : 'empty',
    blurDataURL: blur,
  })
  if (priority && typeof window === 'undefined') {
    preload(props.src, { as: 'image', imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: 'high' })
  }
  // eslint-disable-next-line @next/next/no-img-element -- intentional: optimised by getImageProps above
  return <img {...props} alt={alt} className={className} style={{ ...props.style, ...style }} draggable={draggable} />
}
