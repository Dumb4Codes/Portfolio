import Lenis from 'lenis'
import { formatMetric, parseMetric } from '@/content/derive'
import { chapterLocal } from '@/lib/chapter'
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap'
import { getLenis, prefersReducedMotion, setLenis } from '@/lib/scroll'

/**
 * The motion engine. Everything that needs GSAP / ScrollTrigger / Lenis lives here and is loaded
 * lazily after first paint (see Boot.tsx). The server-rendered HTML carries the hooks as data attributes:
 *   [data-reveal]      entrance variants          [data-metric]   count-up numbers
 *   .chapter-wrap      pinned SKOPE chapters      .builds__stage  horizontal gallery
 *   .ticker__track     sliding tech strip         .certs__stage   fanning certificate deck
 * Each behaviour returns a cleanup so route changes can tear down and rebuild from the new DOM.
 */

type Cleanup = () => void
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel))
const reduced = () => prefersReducedMotion()

// ---------------------------------------------------------------- smooth scroll (once per page load)

let lenis: Lenis | null = null
let lenisTick: ((t: number) => void) | null = null

function ensureLenis() {
  if (lenis || reduced()) return
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: false })
  setLenis(lenis)
  lenis.on('scroll', ScrollTrigger.update)
  lenisTick = (t: number) => lenis?.raf(t * 1000)
  gsap.ticker.add(lenisTick)
  gsap.ticker.lagSmoothing(0)
  // anchor links work with Lenis (and still update the hash)
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return
    const url = new URL(a.href, location.href)
    if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return
    const el = document.getElementById(decodeURIComponent(url.hash.slice(1)))
    if (!el) return
    e.preventDefault()
    lenis?.scrollTo(el, { offset: -(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64) })
    history.pushState(null, '', url.hash)
  })
}

// ---------------------------------------------------------------- entrances

function reveals(): Cleanup[] {
  const undo: Cleanup[] = []
  for (const el of $$('[data-reveal]')) {
    const variant = el.dataset.reveal!
    const delay = Number(el.dataset.delay ?? 0)
    const trigger = { trigger: el, start: el.dataset.start ?? 'top 88%', once: true }
    if (variant === 'rule') {
      gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.4, delay, scrollTrigger: trigger })
    } else if (variant === 'rise') {
      gsap.fromTo(el, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay, scrollTrigger: trigger })
    } else if (variant === 'clip') {
      gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)', opacity: 1 }, { clipPath: 'inset(0 0 0% 0)', duration: 1.2, delay, scrollTrigger: trigger })
    } else if (variant === 'wdth') {
      // hold the box height steady while the width axis animates, so nothing around it shifts
      const final = parseFloat(getComputedStyle(el).getPropertyValue('--w')) || 100
      const hold = () => {
        el.style.minHeight = ''
        el.style.minHeight = `${el.getBoundingClientRect().height}px`
      }
      hold()
      ScrollTrigger.addEventListener('refreshInit', hold)
      undo.push(() => ScrollTrigger.removeEventListener('refreshInit', hold))
      gsap.fromTo(el, { '--w': '62%', opacity: 0 }, { '--w': `${final}%`, opacity: 1, duration: 1.3, delay, scrollTrigger: trigger })
    } else if (variant === 'lines') {
      let split: SplitText | undefined
      void document.fonts.ready.then(() => {
        split = SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          aria: 'none',
          onSplit: (self) => {
            el.style.visibility = 'visible'
            return gsap.from(self.lines, { yPercent: 110, duration: 1.1, stagger: 0.07, delay, scrollTrigger: trigger })
          },
        })
      })
      undo.push(() => split?.revert())
    }
  }
  return undo
}

function metrics(): Cleanup[] {
  for (const el of $$('[data-metric]')) {
    const p = parseMetric(el.dataset.metric!)
    if (p.value === null) continue
    const proxy = { v: 0 }
    el.textContent = formatMetric(p, 0)
    gsap.to(proxy, {
      v: p.value,
      duration: 1.6,
      ease: 'power3.out',
      onUpdate: () => (el.textContent = formatMetric(p, proxy.v)),
      onComplete: () => (el.textContent = p.raw),
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
  }
  return []
}

// ---------------------------------------------------------------- hero

function hero(): Cleanup[] {
  const section = document.querySelector<HTMLElement>('.hero')
  const headline = document.querySelector<HTMLElement>('[data-hero-headline]')
  const sub = document.querySelector<HTMLElement>('[data-hero-sub]')
  if (!section || !headline || !sub) return []
  // the entrance is CSS (it must not wait for this chunk); here: the scrubbed scroll-out
  const st = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom 30%',
    scrub: true,
    onUpdate: (self) => gsap.set([headline, sub], { yPercent: -60 * self.progress, opacity: 1 - self.progress * 1.1 }),
  })
  return [() => st.kill()]
}

// ---------------------------------------------------------------- ticker

function ticker(): Cleanup[] {
  const el = document.querySelector<HTMLElement>('.ticker__track')
  if (!el) return []
  let x = 0
  const tick = (_t: number, dt: number) => {
    const half = el.scrollWidth / 2
    x -= (0.045 + Math.abs(getLenis()?.velocity ?? 0) * 0.06) * dt
    if (x <= -half) x += half
    el.style.transform = `translate3d(${x}px,0,0)`
  }
  gsap.ticker.add(tick)
  return [() => gsap.ticker.remove(tick)]
}

// ---------------------------------------------------------------- SKOPE chapters

function chapters(): Cleanup[] {
  const undo: Cleanup[] = []
  const mm = gsap.matchMedia()
  for (const wrap of $$('.chapter-wrap')) {
    const chapter = wrap.querySelector<HTMLElement>('.chapter')!
    // desktop: pin ~150vh. Mobile: stacked, no pin.
    mm.add('(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({ trigger: chapter, start: 'top top', end: '+=150%', pin: true, pinSpacing: true, anticipatePin: 1 })
    })
    // progress is broadcast so overlays and the shader accent move together (same curve as the director)
    const broadcast = () => {
      const r = wrap.getBoundingClientRect()
      const p = chapterLocal(window.innerHeight / 2 - r.top, 0, r.height)
      wrap.style.setProperty('--p', p.toFixed(4))
      wrap.dispatchEvent(new CustomEvent('chapter-progress', { detail: p }))
    }
    const st = ScrollTrigger.create({ trigger: wrap, start: 'top bottom', end: 'bottom top', onUpdate: broadcast, onRefresh: broadcast })
    broadcast()
    undo.push(() => st.kill())
  }
  undo.push(() => mm.revert())
  return undo
}

// ---------------------------------------------------------------- personal builds gallery

function builds(): Cleanup[] {
  const el = document.querySelector<HTMLElement>('.builds__stage')
  const list = el?.querySelector<HTMLElement>('.builds__track')
  if (!el || !list) return []
  const mm = gsap.matchMedia()
  mm.add('(min-width: 1024px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)', () => {
    el.dataset.pinned = 'true'
    const dist = () => Math.max(0, list.scrollWidth - el.clientWidth)
    const skew = gsap.quickTo(list.querySelectorAll('.build__media'), 'skewX', { duration: 0.5, ease: 'power3' })
    const tween = gsap.to(list, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: () => `+=${dist()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => skew(gsap.utils.clamp(-4, 4, self.getVelocity() / -450)),
      },
    })
    const st = tween.scrollTrigger!

    // drag: the page scroll follows the pointer, Lenis supplies the inertia
    let down = false
    let lastX = 0
    const ratio = () => (st.end - st.start) / Math.max(1, dist())
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest('a,button')) return
      down = true
      lastX = e.clientX
      el.classList.add('is-dragging')
    }
    const onMove = (e: PointerEvent) => {
      if (!down) return
      const dx = e.clientX - lastX
      lastX = e.clientX
      const l = getLenis()
      if (l) l.scrollTo(l.scroll - dx * ratio(), { immediate: true })
      else window.scrollBy(0, -dx * ratio())
    }
    const onUp = () => {
      down = false
      el.classList.remove('is-dragging')
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      e.preventDefault()
      const card = list.querySelector<HTMLElement>('.build')!.offsetWidth + 48
      const l = getLenis()
      const to = (l?.scroll ?? window.scrollY) + (e.key === 'ArrowRight' ? 1 : -1) * card * ratio()
      if (l) l.scrollTo(to, { duration: 0.8 })
      else window.scrollTo({ top: to, behavior: 'smooth' })
    }
    list.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    list.addEventListener('keydown', onKey)
    return () => {
      delete el.dataset.pinned
      list.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      list.removeEventListener('keydown', onKey)
      gsap.set(list, { clearProps: 'transform' })
      gsap.set(list.querySelectorAll('.build__media'), { clearProps: 'skewX' })
    }
  })
  return [() => mm.revert()]
}

// ---------------------------------------------------------------- timeline, about, certificates, next project

function balanceLine(): Cleanup[] {
  const line = document.querySelector<HTMLElement>('.timeline__line')
  if (!line) return []
  gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: line.parentElement, start: 'top 70%', end: 'bottom 60%', scrub: 0.4 } })
  return []
}

function about(): Cleanup[] {
  const fig = document.querySelector<HTMLElement>('.about__photo')
  if (!fig) return []
  const img = fig.querySelector('img')
  if (img) gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true } })
  // duotone -> colour on hover (mouse) or tap
  const set = (on: boolean) => (fig.dataset.color = String(on))
  const enter = (e: PointerEvent) => e.pointerType === 'mouse' && set(true)
  const leave = (e: PointerEvent) => e.pointerType === 'mouse' && set(false)
  const click = () => set(fig.dataset.color !== 'true')
  fig.addEventListener('pointerenter', enter)
  fig.addEventListener('pointerleave', leave)
  fig.addEventListener('click', click)
  return [
    () => {
      fig.removeEventListener('pointerenter', enter)
      fig.removeEventListener('pointerleave', leave)
      fig.removeEventListener('click', click)
    },
  ]
}

function certs(): Cleanup[] {
  const el = document.querySelector<HTMLElement>('.certs__stage')
  if (!el) return []
  const mm = gsap.matchMedia()
  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const cards = $$('.cert', el)
    const n = cards.length
    const w = cards[0]?.offsetWidth ?? 220
    const span = Math.min(el.clientWidth - w, (n - 1) * (w * 0.72))
    // each card shows a 30px strip while stacked, so every card stays a usable target
    cards.forEach((c, i) => gsap.set(c, { x: (i - (n - 1) / 2) * 30, y: i * -3, rotation: (i - n / 2) * 1.6, rotateY: -8, z: i * 2, transformPerspective: 1200 }))
    gsap.to(cards, {
      x: (i) => (n === 1 ? 0 : -span / 2 + (span / (n - 1)) * i),
      y: 0,
      rotation: (i) => (i - (n - 1) / 2) * 1.4,
      rotateY: 0,
      z: 0,
      duration: 1.4,
      stagger: 0.07,
      scrollTrigger: { trigger: el, start: 'top 75%', once: true },
    })
    const enter = (e: Event) => gsap.to(e.currentTarget, { y: -18, rotation: 0, scale: 1.04, duration: 0.5, zIndex: 20 })
    const leave = (e: Event) => gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.5, zIndex: 0 })
    cards.forEach((c) => {
      c.addEventListener('pointerenter', enter)
      c.addEventListener('pointerleave', leave)
    })
    return () => {
      cards.forEach((c) => {
        c.removeEventListener('pointerenter', enter)
        c.removeEventListener('pointerleave', leave)
      })
      gsap.set(cards, { clearProps: 'all' })
    }
  })
  return [() => mm.revert()]
}

function nextRing(): Cleanup[] {
  const ring = document.querySelector<SVGElement>('[data-next-ring]')
  const link = ring?.closest('a')
  if (!ring || !link) return []
  gsap.fromTo(ring, { strokeDashoffset: 100 }, { strokeDashoffset: 50, ease: 'none', scrollTrigger: { trigger: link, start: 'top 85%', end: 'bottom bottom', scrub: true } })
  return []
}

// ---------------------------------------------------------------- start / stop

/** Called once the page is idle and again after every route change. Returns the teardown. */
export function start(): Cleanup {
  ensureLenis()
  const undo: Cleanup[] = []
  const html = document.documentElement
  const run = (fn: () => Cleanup[]) => {
    try {
      undo.push(...fn())
    } catch (err) {
      console.error('[motion]', fn.name, err)
    }
  }
  if (!reduced()) {
    run(reveals)
    run(metrics)
    run(hero)
    run(ticker)
    run(chapters)
    run(builds)
    run(balanceLine)
    run(about)
    run(certs)
    run(nextRing)
  } else {
    run(about)
  }
  html.dataset.motion = 'on'
  requestAnimationFrame(() => ScrollTrigger.refresh())
  return () => {
    undo.forEach((u) => u())
    ScrollTrigger.getAll().forEach((t) => t.kill())
    gsap.globalTimeline.clear()
  }
}
