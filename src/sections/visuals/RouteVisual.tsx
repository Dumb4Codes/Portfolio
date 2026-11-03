'use client'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { ROUTE_NODES, nodeT, routePath } from '@/gl/shapes/route'
import { prefersReducedMotion } from '@/lib/scroll'
import { useChapter } from './useChapter'

const STOPS = ['AREA', 'BUY', 'PICK UP', 'DROP OFF', 'DROP OFF', 'HOME']
const STATUS = ['REQUESTED', 'ASSIGNED', 'ACCEPTED', 'IN PROGRESS', 'OUT FOR DELIVERY', 'DELIVERED']
const SAMPLE_ID = 'MDB-4K7Q2X' // fictional, never a real tracking ID
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const DESCRIPTION =
  'Illustrative delivery route with sample data. One rider visits up to four stops: buy, pick up, drop off, then home. Status moves from requested to delivered, and the customer sees each step on a tracking page.'

const noop = () => () => {}

/** Scrambles characters into place when `go` flips true. Reduced motion: the final text, no animation. */
function useScramble(target: string, go: boolean) {
  const [text, setText] = useState(target)
  const started = useRef(false)
  const reduced = useSyncExternalStore(noop, prefersReducedMotion, () => false)

  useEffect(() => {
    if (reduced) return
    if (!go) {
      started.current = false
      return
    }
    if (started.current) return
    started.current = true
    let frame = 0
    const id = setInterval(() => {
      frame++
      const settled = Math.floor(frame / 3)
      setText(
        target
          .split('')
          .map((c, i) => (i < 4 || i - 3 <= settled - 1 ? c : ALPHABET[Math.floor(Math.random() * ALPHABET.length)]))
          .join(''),
      )
      if (settled > target.length) {
        clearInterval(id)
        setText(target)
      }
    }, 40)
    return () => clearInterval(id)
  }, [go, target, reduced])

  if (reduced) return target
  return go ? text : target.replace(/[A-Z0-9]/g, '·').replace('MDB-', 'MDB-')
}

export default function RouteVisual({ standalone = false }: { standalone?: boolean }) {
  const steps = 36
  const { ref, step } = useChapter<HTMLDivElement>(steps)
  const p = step / steps
  const status = Math.min(STATUS.length - 1, Math.floor(p * STATUS.length * 0.999))
  const id = useScramble(SAMPLE_ID, p > 0.04)

  return (
    <div ref={ref} className={`visual visual--route ${standalone ? 'visual--standalone' : ''}`} role="img" aria-label={DESCRIPTION}>
      <div className="route-map" aria-hidden="true">
        {/* drawn on phones and the case study; on desktop chapters the particles draw the route */}
        <svg className="route-svg route-static" viewBox="0 0 200 110" preserveAspectRatio="none">
          <path d={routePath(200, 110)} className="route-path" vectorEffect="non-scaling-stroke" />
        </svg>
        {ROUTE_NODES.map(([x, y], i) => (
          <span
            key={i}
            className="stop mono"
            data-on={p + 0.02 >= nodeT(i)}
            style={{ left: `${50 + x * 50}%`, top: `${50 - y * 50}%` }}
          >
            <b>{i === 0 || i === STOPS.length - 1 ? '' : i}</b>
            {STOPS[i]}
          </span>
        ))}
      </div>

      <div className="route-meta" aria-hidden="true">
        <ol className="status mono">
          {STATUS.map((s, i) => (
            <li key={s} data-on={i <= status} data-current={i === status}>
              {s}
            </li>
          ))}
        </ol>
        <p className="track mono">
          <span className="muted">Tracking</span> <b>{id}</b>
        </p>
      </div>
      <p className="vis-tag mono">Illustrative · sample data</p>
    </div>
  )
}
