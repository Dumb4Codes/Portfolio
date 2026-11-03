'use client'
import { useRef } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/scroll'

/**
 * Entrances. Each variant is its own motion so sections do not all fade up the same way.
 *  lines : SplitText lines slide up under masks (60-80ms stagger)
 *  rise  : small lift + fade
 *  rule  : hairline draws itself (scaleX 0 -> 1)
 *  clip  : image/box reveals with a clip-path wipe
 *  wdth  : display type expands from condensed (wdth 62) to its resting width
 */
export type Variant = 'lines' | 'rise' | 'rule' | 'clip' | 'wdth'

type Props = {
  variant: Variant
  as?: React.ElementType
  className?: string
  delay?: number
  children?: React.ReactNode
  /** start position for the trigger */
  start?: string
} & React.HTMLAttributes<HTMLElement>

export default function Reveal({ variant, as: Tag = 'div', className, delay = 0, start = 'top 88%', children, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || prefersReducedMotion()) return
      const trigger = { trigger: el, start, once: true }

      if (variant === 'rule') {
        gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.4, delay, ease: 'expo.out', scrollTrigger: trigger })
      } else if (variant === 'rise') {
        gsap.fromTo(el, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay, ease: 'expo.out', scrollTrigger: trigger })
      } else if (variant === 'clip') {
        gsap.fromTo(
          el,
          { clipPath: 'inset(0 0 100% 0)', opacity: 1 },
          { clipPath: 'inset(0 0 0% 0)', duration: 1.2, delay, ease: 'expo.out', scrollTrigger: trigger },
        )
      } else if (variant === 'wdth') {
        // Keep the box height stable while the width axis animates (no layout shift).
        const final = parseFloat(getComputedStyle(el).getPropertyValue('--w')) || 100
        const hold = () => {
          el.style.minHeight = ''
          el.style.minHeight = `${el.getBoundingClientRect().height}px`
        }
        hold()
        ScrollTrigger.addEventListener('refreshInit', hold)
        gsap.fromTo(el, { '--w': '62%', opacity: 0 }, { '--w': `${final}%`, opacity: 1, duration: 1.3, delay, ease: 'expo.out', scrollTrigger: trigger })
        return () => ScrollTrigger.removeEventListener('refreshInit', hold)
      } else if (variant === 'lines') {
        let split: SplitText | undefined
        document.fonts.ready.then(() => {
          if (!ref.current) return
          split = SplitText.create(ref.current, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit: (self) => {
              ref.current!.style.visibility = 'visible'
              return gsap.from(self.lines, { yPercent: 110, duration: 1.1, stagger: 0.07, delay, ease: 'expo.out', scrollTrigger: trigger })
            },
          })
        })
        return () => split?.revert()
      }
    },
    { scope: ref, dependencies: [variant, delay, start] },
  )

  const mode = variant === 'rule' ? 'rule' : variant === 'lines' ? 'lines' : 'fade'
  return (
    <Tag ref={ref} className={className} data-reveal={mode} {...rest}>
      {children}
    </Tag>
  )
}
