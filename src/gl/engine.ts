import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { director, OVERRIDE_SHAPE } from './director'
import { fragmentShader, vertexShader } from './shaders'
import { generateScene, MOBILE_BREAKPOINT, STACK_BREAKPOINT, textShape } from './shapes'
import type { Box, Shape } from './shapes'
import { mulberry32 } from './shapes/rng'

/**
 * The particle renderer, written against plain three.js (no React wrapper) to keep the lazy GL chunk
 * small. One draw call: THREE.Points + a custom ShaderMaterial. The loop only runs while something
 * moves (scroll, morph, pointer, theme change) and rests on a still frame after ~3.5s of calm.
 */

const SCENE_KEYS = ['hero', 'ledger', 'clock', 'route', 'field', 'pin'] as const
const FOV = 35

type Options = {
  canvas: HTMLCanvasElement
  count: number
  onReady: () => void
  onSlow: () => void
  onLost: () => void
}

/** Reads the hero word's on-screen box so the particle word sits exactly over the HTML word. */
function heroBox(vw: number, vh: number): { box: Box; lines: string[]; font: string; ls: number } {
  // two candidates (single line / stacked); the one that is actually laid out wins
  const el = Array.from(document.querySelectorAll<HTMLElement>('[data-hero-name]')).find((e) => e.getBoundingClientRect().width > 24)
  const fallback: Box = { cx: 0, cy: vh * 0.05, w: vw * 0.92, h: vw * 0.26 }
  if (!el) return { box: fallback, lines: ['YOUVRAJ'], font: 'sans-serif', ls: 0 }
  // the block is as wide as its container; the painted word is narrower, so measure the text itself
  const range = document.createRange()
  range.selectNodeContents(el)
  const lines = Array.from(range.getClientRects()).filter((q) => q.width > 4)
  const left = Math.min(...lines.map((q) => q.left))
  const right = Math.max(...lines.map((q) => q.right))
  const r = el.getBoundingClientRect()
  const docTop = r.top + window.scrollY
  const cs = getComputedStyle(el)
  return {
    ls: parseFloat(cs.letterSpacing) / parseFloat(cs.fontSize) || 0,
    box: { cx: (left + right) / 2 - vw / 2, cy: vh / 2 - (docTop + r.height / 2), w: right - left, h: r.height },
    lines:
      el.dataset.stacked !== undefined
        ? Array.from(el.querySelectorAll('span')).map((s) => (s.textContent ?? '').toUpperCase())
        : [(el.textContent ?? '').toUpperCase()],
    font: getComputedStyle(el).fontFamily,
  }
}

export class ParticleEngine {
  private renderer: WebGLRenderer
  private scene = new Scene()
  private camera = new PerspectiveCamera(FOV, 1, 1, 8000)
  private geo = new BufferGeometry()
  private mat: ShaderMaterial
  private points: Points
  private count: number

  private vw = 0
  private vh = 0
  private mobile = false
  private stacked = false
  private shapes = new Map<number, Shape>()
  private boundA = -1
  private boundB = -1
  private overrideVersion = -1

  private mouse = new Vector2(-9999, -9999)
  private mouseTarget = new Vector2(-9999, -9999)
  private mouseK = 0
  private ripple = 0

  private raf = 0
  private last = 0
  private t0 = performance.now()
  private lastActivity = 0
  private ready = false
  private disposed = false
  private probe = { warm: 0, frames: 0, start: 0, done: false }
  private layoutTimer: ReturnType<typeof setTimeout> | undefined
  private resizeObserver: ResizeObserver
  private mo: MutationObserver
  private cleanup: (() => void)[] = []

  constructor(private opts: Options) {
    this.count = opts.count
    const { canvas, count } = opts

    this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false, depth: false })
    this.renderer.setClearColor(0x000000, 0)

    const pos = () => new BufferAttribute(new Float32Array(count * 3), 3)
    this.geo.setAttribute('position', pos())
    this.geo.setAttribute('aPosA', pos())
    this.geo.setAttribute('aPosB', pos())
    this.geo.setAttribute('aAttrA', new BufferAttribute(new Float32Array(count), 1))
    this.geo.setAttribute('aAttrB', new BufferAttribute(new Float32Array(count), 1))
    const rnd = mulberry32(99)
    const r = new Float32Array(count * 4)
    for (let i = 0; i < r.length; i++) r[i] = rnd()
    this.geo.setAttribute('aRand', new BufferAttribute(r, 4))
    this.geo.setDrawRange(0, count)

    this.mat = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uShapeA: { value: 0 },
        uShapeB: { value: 1 },
        uLocalA: { value: 0 },
        uLocalB: { value: 0 },
        uMouse: { value: this.mouse },
        uMouseR: { value: 150 },
        uMouseK: { value: 0 },
        uHeroShift: { value: 0 },
        uVel: { value: 0 },
        uScatter: { value: 0 },
        uSize: { value: 2 },
        uCamZ: { value: 1000 },
        uRipple: { value: 0 },
        uRipplePos: { value: new Vector3() },
        uFg: { value: new Color('#EDE8DF') },
        uAccent: { value: new Color('#FF5A1F') },
        uCold: { value: new Color('#7AA2FF') },
        uOpacity: { value: 0.9 },
        uDark: { value: 1 },
      },
    })
    this.points = new Points(this.geo, this.mat)
    this.points.frustumCulled = false
    this.scene.add(this.points)

    const onLost = (e: Event) => {
      e.preventDefault()
      opts.onLost()
    }
    canvas.addEventListener('webglcontextlost', onLost)
    this.cleanup.push(() => canvas.removeEventListener('webglcontextlost', onLost))

    this.bindEvents()
    this.applyTheme()
    this.mo = new MutationObserver(() => this.applyTheme())
    this.mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(document.documentElement)
    this.resize()
    this.wake()
  }

  // ---------- setup ----------

  private resize() {
    const vw = window.innerWidth
    const vh = window.innerHeight
    if (vw === this.vw && vh === this.vh) return
    this.vw = vw
    this.vh = vh
    this.mobile = vw < MOBILE_BREAKPOINT
    this.stacked = vw < STACK_BREAKPOINT
    const dpr = Math.min(window.devicePixelRatio || 1, this.mobile ? 1.5 : 1.75)
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(vw, vh, false)
    this.camera.aspect = vw / vh
    const z = vh / 2 / Math.tan((FOV * Math.PI) / 360) // 1 world unit = 1 css px at z = 0
    this.camera.position.set(0, 0, z)
    this.camera.far = z * 4
    this.camera.updateProjectionMatrix()
    const u = this.mat.uniforms
    u.uCamZ.value = z
    u.uSize.value = (this.mobile ? 2.1 : 2.4) * dpr
    u.uMouseR.value = this.mobile ? 90 : 160
    this.shapes.clear()
    this.boundA = this.boundB = -1
    clearTimeout(this.layoutTimer)
    this.layoutTimer = setTimeout(() => {
      director.measure()
      this.wake()
    }, 120)
    this.wake()
  }

  private applyTheme() {
    const dark = document.documentElement.dataset.theme !== 'light'
    const u = this.mat.uniforms
    u.uFg.value.set(dark ? '#EDE8DF' : '#0E0E0F')
    u.uAccent.value.set(dark ? '#FF5A1F' : '#E04A12')
    u.uDark.value = dark ? 1 : 0
    this.mat.blending = dark ? AdditiveBlending : NormalBlending
    this.mat.needsUpdate = true
    this.wake()
  }

  private bindEvents() {
    const wake = () => this.wake()
    const onMove = (e: PointerEvent) => {
      this.mouseTarget.set(e.clientX - this.vw / 2, this.vh / 2 - e.clientY)
      if (this.mouseK === 0) this.mouse.copy(this.mouseTarget)
      this.mouseK = e.pointerType === 'touch' ? 0 : 1
      this.wake()
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      this.mat.uniforms.uRipplePos.value.set(e.clientX - this.vw / 2, this.vh / 2 - e.clientY, 0)
      this.ripple = 1
      this.wake()
    }
    const onLeave = () => {
      this.mouseK = 0
      this.wake()
    }
    const onLayout = () => {
      clearTimeout(this.layoutTimer)
      this.layoutTimer = setTimeout(() => {
        director.measure()
        this.wake()
      }, 120)
    }
    const on = <K extends keyof WindowEventMap>(t: K, f: (e: WindowEventMap[K]) => void, o?: AddEventListenerOptions) => {
      window.addEventListener(t, f, o)
      this.cleanup.push(() => window.removeEventListener(t, f))
    }
    on('pointermove', onMove, { passive: true })
    on('pointerdown', onDown, { passive: true })
    on('scroll', wake, { passive: true })
    window.addEventListener('gl:layout', onLayout)
    window.addEventListener('gl:wake', wake)
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', wake)
    this.cleanup.push(() => {
      window.removeEventListener('gl:layout', onLayout)
      window.removeEventListener('gl:wake', wake)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', wake)
    })
    director.measure()
  }

  // ---------- shapes ----------

  private getShape(i: number): Shape {
    const hit = this.shapes.get(i)
    if (hit) return hit
    const { vw, vh, count } = this
    let shape: Shape
    if (i === 0) {
      const { box, lines, font, ls } = heroBox(vw, vh)
      shape = textShape(lines, count, box, font, 7, { letterSpacingEm: ls, fit: 'width' })
    } else if (i === OVERRIDE_SHAPE) {
      const box: Box = this.mobile ? { cx: 0, cy: vh * 0.05, w: vw * 0.9, h: vw * 0.45 } : { cx: 0, cy: 0, w: Math.min(vw * 0.8, 1300), h: vh * 0.5 }
      shape = textShape([director.override?.text ?? 'HIRE?'], count, box, getComputedStyle(document.body).fontFamily)
    } else {
      shape = generateScene(SCENE_KEYS[i] as Exclude<(typeof SCENE_KEYS)[number], 'hero'>, count, vw, vh)
    }
    this.shapes.set(i, shape)
    return shape
  }

  private bind(side: 'A' | 'B', shapeIndex: number) {
    const sh = this.getShape(shapeIndex)
    const pos = this.geo.attributes[`aPos${side}`] as BufferAttribute
    const attr = this.geo.attributes[`aAttr${side}`] as BufferAttribute
    ;(pos.array as Float32Array).set(sh.pos)
    ;(attr.array as Float32Array).set(sh.attr)
    pos.needsUpdate = true
    attr.needsUpdate = true
  }

  // ---------- loop ----------

  wake() {
    this.lastActivity = performance.now()
    this.schedule()
  }

  private schedule() {
    if (this.raf || this.disposed) return
    this.raf = requestAnimationFrame((t) => this.tick(t))
  }

  private tick(now: number) {
    this.raf = 0
    if (this.disposed) return
    const dt = Math.min(Math.max((now - this.last) / 1000, 0), 0.05) || 0.016
    this.last = now
    const u = this.mat.uniforms

    if (this.overrideVersion !== director.overrideVersion) {
      this.shapes.delete(OVERRIDE_SHAPE)
      if (this.boundB === OVERRIDE_SHAPE) this.boundB = -1
      this.overrideVersion = director.overrideVersion
    }

    const f = director.update(dt, window.scrollY, this.vh)
    if (f.shapeA !== this.boundA) {
      this.bind('A', f.shapeA)
      this.boundA = f.shapeA
    }
    if (f.shapeB !== this.boundB) {
      this.bind('B', f.shapeB)
      this.boundB = f.shapeB
    }

    this.mouse.lerp(this.mouseTarget, 1 - Math.exp(-dt * 10))
    this.ripple = Math.max(0, this.ripple - dt * 0.9)

    u.uProgress.value = f.progress
    u.uShapeA.value = f.shapeA
    u.uShapeB.value = f.shapeB
    u.uLocalA.value = f.localA
    u.uLocalB.value = f.localB
    u.uHeroShift.value = f.heroShift
    u.uVel.value = f.vel
    u.uScatter.value = f.scatter
    u.uTime.value = (now - this.t0) / 1000
    u.uMouseK.value = this.mouseK
    u.uRipple.value = this.ripple
    const o = Math.min(Math.max(director.s, 0), 1)
    u.uOpacity.value = this.stacked ? 0.95 - 0.68 * o : 1 - 0.12 * o

    this.renderer.render(this.scene, this.camera)

    if (!this.ready) {
      this.ready = true
      this.opts.onReady()
    }

    // one probe: halve the count on slow GPUs (skips the first ~1.5s of frames: hydration and shader compile jank)
    const p = this.probe
    if (!p.done) {
      if (++p.warm >= 90) {
        if (!p.start) p.start = now
        p.frames++
        if (now - p.start > 2000) {
          p.done = true
          if ((p.frames * 1000) / (now - p.start) < 45) this.opts.onSlow()
        }
      }
    }

    if (f.active || !p.done || now - this.lastActivity < 3500) this.schedule()
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    clearTimeout(this.layoutTimer)
    this.cleanup.forEach((c) => c())
    this.resizeObserver.disconnect()
    this.mo.disconnect()
    this.geo.dispose()
    this.mat.dispose()
    this.renderer.dispose()
  }
}
