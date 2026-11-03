import { pointsFromMask } from './mask'
import type { Box, Shape } from './types'

/**
 * Samples text drawn in the display font. Call after `document.fonts.ready`.
 * `lines` lets mobile stack "YOU / VRAJ". Browser only (needs a canvas).
 */
export function textShape(lines: string[], n: number, box: Box, fontFamily: string, seed = 7): Shape {
  const px = 240
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const font = `800 ${px}px ${fontFamily}`
  ctx.font = font
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width))
  const lh = px * 0.92
  canvas.width = Math.ceil(widest + px * 0.2)
  canvas.height = Math.ceil(lh * lines.length + px * 0.2)
  ctx.font = font // resizing the canvas resets the context
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  lines.forEach((l, i) => ctx.fillText(l, canvas.width / 2, px * 0.1 + lh * (i + 0.5)))
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return pointsFromMask({ width: img.width, height: img.height, data: img.data }, n, box, seed)
}
