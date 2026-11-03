import { mulberry32 } from './rng'
import type { Box, Shape } from './types'

export type Mask = { width: number; height: number; data: Uint8ClampedArray | Uint8Array }

/**
 * Pure part of the text shape: given an alpha mask (RGBA or single channel), pick `n` random opaque
 * pixels and fit them into `box` keeping aspect. Kept separate from the canvas so it can be unit tested.
 */
export function pointsFromMask(mask: Mask, n: number, box: Box, seed = 7, channels = 4): Shape {
  const { width, height, data } = mask
  const opaque: number[] = []
  const off = channels === 4 ? 3 : 0
  for (let i = 0; i < width * height; i++) if (data[i * channels + off] > 128) opaque.push(i)

  const pos = new Float32Array(n * 3)
  const attr = new Float32Array(n)
  if (!opaque.length) return { pos, attr }

  const rnd = mulberry32(seed)
  const scale = Math.min(box.w / width, box.h / height)
  for (let k = 0; k < n; k++) {
    const idx = opaque[Math.floor(rnd() * opaque.length)]
    const px = (idx % width) + rnd()
    const py = Math.floor(idx / width) + rnd()
    pos[k * 3] = box.cx + (px - width / 2) * scale
    pos[k * 3 + 1] = box.cy - (py - height / 2) * scale
    pos[k * 3 + 2] = (rnd() - 0.5) * 14
  }
  return { pos, attr }
}
