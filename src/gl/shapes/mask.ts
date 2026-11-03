import { mulberry32 } from './rng'
import type { Box, Shape } from './types'

export type Mask = { width: number; height: number; data: Uint8ClampedArray | Uint8Array }

/**
 * Pure part of the text shape: given an alpha mask (RGBA or single channel), pick `n` random opaque
 * pixels and fit them into `box` keeping aspect. Kept separate from the canvas so it can be unit tested.
 */
export function pointsFromMask(mask: Mask, n: number, box: Box, seed = 7, channels = 4, fit: 'contain' | 'width' = 'contain'): Shape {
  const { width, height, data } = mask
  const opaque: number[] = []
  const off = channels === 4 ? 3 : 0
  for (let i = 0; i < width * height; i++) if (data[i * channels + off] > 128) opaque.push(i)

  const pos = new Float32Array(n * 3)
  const attr = new Float32Array(n)
  if (!opaque.length) return { pos, attr }

  // `width`: crop to the painted pixels and fit their width to the box (text that must match an HTML word)
  let x0 = 0
  let y0 = 0
  let bw = width
  let bh = height
  if (fit === 'width') {
    let minX = width
    let maxX = 0
    let minY = height
    let maxY = 0
    for (const i of opaque) {
      const x = i % width
      const y = (i / width) | 0
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    x0 = minX
    y0 = minY
    bw = maxX - minX + 1
    bh = maxY - minY + 1
  }
  const rnd = mulberry32(seed)
  const scale = fit === 'width' ? box.w / bw : Math.min(box.w / width, box.h / height)
  for (let k = 0; k < n; k++) {
    const idx = opaque[Math.floor(rnd() * opaque.length)]
    const px = (idx % width) + rnd()
    const py = Math.floor(idx / width) + rnd()
    pos[k * 3] = box.cx + (px - (x0 + bw / 2)) * scale
    pos[k * 3 + 1] = box.cy - (py - (y0 + bh / 2)) * scale
    pos[k * 3 + 2] = (rnd() - 0.5) * 14
  }
  return { pos, attr }
}
