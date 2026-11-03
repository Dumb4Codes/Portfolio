import type { HTMLAttributes } from 'react'

/**
 * Entrances. Each variant is its own motion so sections do not all fade up the same way.
 *  lines : SplitText lines slide up under masks (60-80ms stagger)
 *  rise  : small lift + fade
 *  rule  : hairline draws itself (scaleX 0 -> 1)
 *  clip  : image/box reveals with a clip-path wipe
 *  wdth  : display type expands from condensed (wdth 62) to its resting width
 *
 * This is a plain server component: it only writes `data-reveal` hooks. The motion engine
 * (src/motion/engine.ts) animates them after first paint; without it nothing stays hidden.
 */
export type Variant = 'lines' | 'rise' | 'rule' | 'clip' | 'wdth'

type Props = {
  variant: Variant
  as?: React.ElementType
  delay?: number
  /** ScrollTrigger start position, default "top 88%" */
  start?: string
} & HTMLAttributes<HTMLElement>

export default function Reveal({ variant, as: Tag = 'div', delay, start, children, ...rest }: Props) {
  return (
    <Tag data-reveal={variant} data-delay={delay} data-start={start} {...rest}>
      {children}
    </Tag>
  )
}
