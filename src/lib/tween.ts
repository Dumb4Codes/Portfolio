/** Tiny rAF helpers (no GSAP), for the few animations that must exist before the motion engine loads. */
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

export function tween(from: number, to: number, ms: number, onUpdate: (v: number) => void, ease: (t: number) => number = easeOutCubic) {
  const t0 = performance.now()
  let raf = 0
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / ms)
    onUpdate(from + (to - from) * ease(p))
    if (p < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
  return () => cancelAnimationFrame(raf)
}

/** Runs `step` every frame until it returns false. `wake()` (re)starts the loop. */
export function frameLoop(step: () => boolean) {
  let raf = 0
  const tick = () => {
    raf = 0
    if (step()) raf = requestAnimationFrame(tick)
  }
  return {
    wake: () => {
      if (!raf) raf = requestAnimationFrame(tick)
    },
    stop: () => cancelAnimationFrame(raf),
  }
}
