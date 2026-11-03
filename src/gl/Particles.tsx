'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { director, OVERRIDE_SHAPE } from './director'
import { fragmentShader, vertexShader } from './shaders'
import { generateScene, MOBILE_BREAKPOINT, textShape } from './shapes'
import type { Box, Shape } from './shapes'
import { mulberry32 } from './shapes/rng'

type Props = {
  count: number
  /** called once the first frame has been drawn */
  onReady: () => void
  /** called when a one-second probe finds the GPU too slow for this count */
  onSlow: () => void
}

const SCENE_KEYS = ['hero', 'ledger', 'clock', 'route', 'field', 'pin'] as const

const hex = (h: string) => new THREE.Color(h)

/** Reads the hero word's on-screen box so the particle word sits exactly over the HTML word. */
function heroBox(vw: number, vh: number): { box: Box; lines: string[]; font: string } {
  // two candidates (single line / stacked); the one that is actually laid out wins
  const el = Array.from(document.querySelectorAll<HTMLElement>('[data-hero-name]')).find((e) => e.getBoundingClientRect().width > 24)
  const mobile = vw < MOBILE_BREAKPOINT
  const fallback: Box = { cx: 0, cy: vh * 0.05, w: vw * 0.92, h: vw * 0.26 }
  void mobile
  if (!el) return { box: fallback, lines: ['YOUVRAJ'], font: 'sans-serif' }
  const r = el.getBoundingClientRect()
  const docTop = r.top + window.scrollY
  const font = getComputedStyle(el).fontFamily
  return {
    box: { cx: r.left + r.width / 2 - vw / 2, cy: vh / 2 - (docTop + r.height / 2), w: r.width, h: r.height },
    lines: el.dataset.stacked !== undefined ? Array.from(el.querySelectorAll('span')).map((s) => (s.textContent ?? '').toUpperCase()) : [(el.textContent ?? '').toUpperCase()],
    font,
  }
}

export default function Particles({ count, onReady, onSlow }: Props) {
  const { size, camera, invalidate, gl } = useThree()
  const vw = size.width
  const vh = size.height
  const mobile = vw < MOBILE_BREAKPOINT

  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    g.setAttribute('aPosA', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    g.setAttribute('aPosB', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    g.setAttribute('aAttrA', new THREE.BufferAttribute(new Float32Array(count), 1))
    g.setAttribute('aAttrB', new THREE.BufferAttribute(new Float32Array(count), 1))
    const rnd = mulberry32(99)
    const r = new Float32Array(count * 4)
    for (let i = 0; i < r.length; i++) r[i] = rnd()
    g.setAttribute('aRand', new THREE.BufferAttribute(r, 4))
    g.setDrawRange(0, count)

    const m = new THREE.ShaderMaterial({
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
        uMouse: { value: new THREE.Vector2(-9999, -9999) },
        uMouseR: { value: 150 },
        uMouseK: { value: 0 },
        uHeroShift: { value: 0 },
        uVel: { value: 0 },
        uScatter: { value: 0 },
        uSize: { value: 2 },
        uCamZ: { value: 1000 },
        uRipple: { value: 0 },
        uRipplePos: { value: new THREE.Vector3() },
        uFg: { value: hex('#EDE8DF') },
        uAccent: { value: hex('#FF5A1F') },
        uCold: { value: hex('#7AA2FF') },
        uOpacity: { value: 0.9 },
        uDark: { value: 1 },
      },
    })
    return { geo: g, mat: m }
  }, [count])

  useEffect(
    () => () => {
      geo.dispose()
      mat.dispose()
    },
    [geo, mat],
  )

  const state = useRef({
    shapes: new Map<number, Shape>(),
    boundA: -1,
    boundB: -1,
    version: 0,
    mouse: new THREE.Vector2(-9999, -9999),
    mouseTarget: new THREE.Vector2(-9999, -9999),
    mouseK: 0,
    lastActivity: 0,
    ripple: 0,
    fps: { frames: 0, start: 0, done: false, warm: 0 },
    ready: false,
    overrideVersion: -1,
  })

  // camera so that 1 world unit = 1 css px at z = 0
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const z = size.height / 2 / Math.tan((cam.fov * Math.PI) / 360)
    cam.position.set(0, 0, z)
    cam.far = z * 4
    cam.updateProjectionMatrix()
    mat.uniforms.uCamZ.value = z
    mat.uniforms.uSize.value = (mobile ? 2.1 : 2.4) * gl.getPixelRatio()
    mat.uniforms.uMouseR.value = mobile ? 90 : 160
  }, [camera, size.height, mobile, gl, mat])

  const wake = useMemo(
    () => () => {
      state.current.lastActivity = performance.now()
      invalidate()
    },
    [invalidate],
  )

  // theme -> colours + blending
  useEffect(() => {
    const apply = () => {
      const dark = document.documentElement.dataset.theme !== 'light'
      const u = mat.uniforms
      u.uFg.value.set(dark ? '#EDE8DF' : '#0E0E0F')
      u.uAccent.value.set(dark ? '#FF5A1F' : '#E04A12')
      u.uDark.value = dark ? 1 : 0
      mat.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending
      mat.needsUpdate = true
      wake()
    }
    apply()
    const mo = new MutationObserver(apply)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [mat, wake])

  // input + layout events
  useEffect(() => {
    const s = state.current
    const onMove = (e: PointerEvent) => {
      s.mouseTarget.set(e.clientX - vw / 2, vh / 2 - e.clientY)
      if (s.mouseK === 0) s.mouse.copy(s.mouseTarget)
      s.mouseK = e.pointerType === 'touch' ? 0 : 1
      wake()
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      mat.uniforms.uRipplePos.value.set(e.clientX - vw / 2, vh / 2 - e.clientY, 0)
      s.ripple = 1
      wake()
    }
    const onLeave = () => {
      s.mouseK = 0
      wake()
    }
    let t: ReturnType<typeof setTimeout>
    const onLayout = () => {
      clearTimeout(t)
      t = setTimeout(() => {
        director.measure()
        wake()
      }, 120)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', wake, { passive: true })
    window.addEventListener('gl:layout', onLayout)
    window.addEventListener('gl:wake', wake)
    document.addEventListener('visibilitychange', wake)
    director.measure()
    return () => {
      clearTimeout(t)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', wake)
      window.removeEventListener('gl:layout', onLayout)
      window.removeEventListener('gl:wake', wake)
      document.removeEventListener('visibilitychange', wake)
    }
  }, [vw, vh, wake, mat])

  // shapes depend on viewport; rebuild on resize
  useEffect(() => {
    const s = state.current
    s.shapes.clear()
    s.boundA = -1
    s.boundB = -1
    director.measure()
    wake()
  }, [vw, vh, count, wake])

  const getShape = (i: number): Shape => {
    const s = state.current
    const hit = s.shapes.get(i)
    if (hit) return hit
    let shape: Shape
    if (i === 0) {
      const { box, lines, font } = heroBox(vw, vh)
      shape = textShape(lines, count, box, font)
    } else if (i === OVERRIDE_SHAPE) {
      const box: Box = mobile
        ? { cx: 0, cy: vh * 0.05, w: vw * 0.9, h: vw * 0.45 }
        : { cx: 0, cy: 0, w: Math.min(vw * 0.8, 1300), h: vh * 0.5 }
      shape = textShape([director.override?.text ?? 'HIRE?'], count, box, getComputedStyle(document.body).fontFamily)
    } else {
      shape = generateScene(SCENE_KEYS[i] as Exclude<(typeof SCENE_KEYS)[number], 'hero'>, count, vw, vh)
    }
    s.shapes.set(i, shape)
    return shape
  }

  useFrame((frame, rawDt) => {
    const s = state.current
    const dt = Math.min(rawDt, 0.05)
    const now = performance.now()
    const u = mat.uniforms

    if (s.overrideVersion !== director.overrideVersion) {
      s.shapes.delete(OVERRIDE_SHAPE)
      if (s.boundB === OVERRIDE_SHAPE) s.boundB = -1
      s.overrideVersion = director.overrideVersion
    }

    const f = director.update(dt, window.scrollY, vh)

    if (f.shapeA !== s.boundA) {
      const sh = getShape(f.shapeA)
      ;(geo.attributes.aPosA.array as Float32Array).set(sh.pos)
      ;(geo.attributes.aAttrA.array as Float32Array).set(sh.attr)
      geo.attributes.aPosA.needsUpdate = true
      geo.attributes.aAttrA.needsUpdate = true
      s.boundA = f.shapeA
    }
    if (f.shapeB !== s.boundB) {
      const sh = getShape(f.shapeB)
      ;(geo.attributes.aPosB.array as Float32Array).set(sh.pos)
      ;(geo.attributes.aAttrB.array as Float32Array).set(sh.attr)
      geo.attributes.aPosB.needsUpdate = true
      geo.attributes.aAttrB.needsUpdate = true
      s.boundB = f.shapeB
    }

    s.mouse.lerp(s.mouseTarget, 1 - Math.exp(-dt * 10))
    s.ripple = Math.max(0, s.ripple - dt * 0.9)
    const sCoord = director.s
    u.uProgress.value = f.progress
    u.uShapeA.value = f.shapeA
    u.uShapeB.value = f.shapeB
    u.uLocalA.value = f.localA
    u.uLocalB.value = f.localB
    u.uHeroShift.value = f.heroShift
    u.uVel.value = f.vel
    u.uScatter.value = f.scatter
    u.uTime.value = frame.clock.elapsedTime
    u.uMouse.value.copy(s.mouse)
    u.uMouseK.value = s.mouseK
    u.uRipple.value = s.ripple
    const o = Math.min(Math.max(sCoord, 0), 1)
    u.uOpacity.value = mobile ? 0.95 - 0.68 * o : 1 - 0.12 * o

    if (!s.ready) {
      s.ready = true
      onReady()
    }

    // one-second FPS probe: halve the count on slow GPUs
    const p = s.fps
    if (!p.done) {
      p.warm = (p.warm ?? 0) + 1 // ignore hydration / shader compile jank
      if (p.warm < 45) {
        invalidate()
        return
      }
      if (!p.start) p.start = now
      p.frames++
      if (now - p.start > 1500) {
        p.done = true
        const fps = (p.frames * 1000) / (now - p.start)
        if (fps < 45) onSlow()
      }
    }

    // keep rendering while something moves or the user is active; otherwise rest on a still frame
    if (f.active || !p.done || now - s.lastActivity < 3500) invalidate()
  })

  return <points geometry={geo} material={mat} frustumCulled={false} />
}

