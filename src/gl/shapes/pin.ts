import { mulberry32 } from './rng'
import type { Shape, ShapeCtx } from './types'

export const BENGALURU = { lat: 12.97, lon: 77.59 }

const rad = (d: number) => (d * Math.PI) / 180

/** Unit vector for lat/lon, rotated so that (lat0, lon0) faces the viewer. */
function toView(lat: number, lon: number, lat0: number, lon0: number): [number, number, number] {
  const phi = rad(lat)
  const lam = rad(lon - lon0)
  const x = Math.cos(phi) * Math.sin(lam)
  const y = Math.sin(phi)
  const z = Math.cos(phi) * Math.cos(lam)
  const t = rad(lat0) // tilt so lat0 sits near the middle of the visible face
  return [x, y * Math.cos(t) - z * Math.sin(t), y * Math.sin(t) + z * Math.cos(t)]
}

/**
 * Dotted globe hemisphere (graticule lines + sparse dots) with a cluster rising into a
 * map pin at Bengaluru. attr: 1 on the pin and its pulse ring, 0 elsewhere.
 */
export function pinShape({ n, box, seed = 23 }: ShapeCtx): Shape {
  const rnd = mulberry32(seed)
  const R = (Math.min(box.w, box.h) / 2) * 0.82
  const pos = new Float32Array(n * 3)
  const attr = new Float32Array(n)
  const lat0 = 18
  const lon0 = BENGALURU.lon - 14 // India a little right of centre, like a tilted globe

  const nPin = Math.floor(n * 0.16)
  const nRing = Math.floor(n * 0.04)
  const nSphere = n - nPin - nRing
  let k = 0

  while (k < nSphere) {
    let lat: number
    let lon: number
    if (rnd() < 0.55) {
      if (rnd() < 0.5) {
        lon = Math.round((lon0 + (rnd() - 0.5) * 180) / 15) * 15
        lat = (rnd() - 0.5) * 180
      } else {
        lat = Math.round(((rnd() - 0.5) * 160) / 15) * 15
        lon = lon0 + (rnd() - 0.5) * 180
      }
    } else {
      lat = Math.asin(2 * rnd() - 1) * (180 / Math.PI)
      lon = lon0 + (rnd() - 0.5) * 180
    }
    const [x, y, z] = toView(lat, lon, lat0, lon0)
    if (z <= 0.02) continue
    pos[k * 3] = box.cx + x * R
    pos[k * 3 + 1] = box.cy + y * R
    pos[k * 3 + 2] = z * R * 0.35
    k++
  }

  const [bx, by, bz] = toView(BENGALURU.lat, BENGALURU.lon, lat0, lon0)
  const px = box.cx + bx * R
  const py = box.cy + by * R
  const pz = bz * R * 0.35

  // map pin: a ring head with a centre dot and a tapered tail down to the surface point
  const headR = R * 0.085
  const stem = R * 0.22
  for (let i = 0; i < nPin; i++, k++) {
    let x: number
    let y: number
    if (rnd() < 0.62) {
      const th = rnd() * Math.PI * 2
      const hollow = rnd() < 0.85
      const r = hollow ? headR * (0.82 + rnd() * 0.18) : headR * 0.28 * Math.sqrt(rnd())
      x = Math.cos(th) * r
      y = stem + headR + Math.sin(th) * r
    } else {
      const t = rnd()
      const side = rnd() < 0.5 ? -1 : 1
      x = side * headR * 0.92 * (1 - t) ** 1.1
      y = stem + headR * 0.2 - t * (stem + headR * 0.2)
    }
    pos[k * 3] = px + x
    pos[k * 3 + 1] = py + y
    pos[k * 3 + 2] = pz + 12 + (rnd() - 0.5) * 6
    attr[k] = 1
  }
  for (let i = 0; i < nRing; i++, k++) {
    const th = rnd() * Math.PI * 2
    const r = R * 0.07 * (1 + rnd() * 0.04)
    pos[k * 3] = px + Math.cos(th) * r
    pos[k * 3 + 1] = py + Math.sin(th) * r * 0.45
    pos[k * 3 + 2] = pz + 4
    attr[k] = 1
  }
  return { pos, attr }
}
