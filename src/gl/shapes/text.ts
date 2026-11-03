import { pointsFromMask } from './mask'
import type { Box, Shape } from './types'

const TILE = 120 // 120 x 120 = 14,400 px, under Chrome's size threshold for GPU-accelerated 2D canvases

/**
 * Samples text drawn in the display font. Call after `document.fonts.ready`.
 * `lines` draws one string per line (centred). Browser only (needs a canvas).
 *
 * The glyphs are rasterised in small tiles. Small canvases stay CPU-backed, so reading the pixels
 * back never needs a GPU readback, whatever the text size.
 */
export function textShape(lines: string[], n: number, box: Box, fontFamily: string, seed = 7, opts: { letterSpacingEm?: number; fit?: 'contain' | 'width' } = {}): Shape {
  const px = 240
  const font = `800 ${px}px ${fontFamily}`
  const lh = px * 0.92

  const tile = document.createElement('canvas')
  tile.width = TILE
  tile.height = TILE
  const ctx = tile.getContext('2d', { willReadFrequently: true })!
  ctx.font = font
  const ls = (opts.letterSpacingEm ?? 0) * px
  if (ls && 'letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${ls}px`
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width))

  const W = Math.ceil(widest + px * 0.2)
  const H = Math.ceil(lh * lines.length + px * 0.2)
  const mask = new Uint8Array(W * H)

  for (let ty = 0; ty < H; ty += TILE) {
    for (let tx = 0; tx < W; tx += TILE) {
      ctx.clearRect(0, 0, TILE, TILE)
      ctx.save()
      ctx.translate(-tx, -ty)
      ctx.font = font
      if (ls && 'letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${ls}px`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'
      lines.forEach((l, i) => ctx.fillText(l, W / 2, px * 0.1 + lh * (i + 0.5)))
      ctx.restore()
      const w = Math.min(TILE, W - tx)
      const h = Math.min(TILE, H - ty)
      const data = ctx.getImageData(0, 0, w, h).data
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) mask[(ty + y) * W + tx + x] = data[(y * w + x) * 4 + 3]
      }
    }
  }
  return pointsFromMask({ width: W, height: H, data: mask }, n, box, seed, 1, opts.fit ?? 'contain')
}
