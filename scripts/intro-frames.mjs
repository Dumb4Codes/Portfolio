// Captures the first-visit build intro as a strip of frames: node scripts/intro-frames.mjs <outDir> [widthxheight]
// Expects `next start` on PORT (default 3100). A fresh context (no `pre` flag) so the intro runs.
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const out = process.argv[2] ?? 'shots/intro'
const [w, h] = (process.argv[3] ?? '1440x900').split('x').map(Number)
const base = `http://localhost:${process.env.PORT ?? 3100}`
fs.mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: 'dark' })
const page = await ctx.newPage()
await page.addInitScript(() => {
  try {
    localStorage.setItem('theme', 'dark')
  } catch {}
})
const t0 = Date.now()
let doneAt = null
await page.exposeFunction('__introDone', () => (doneAt = Date.now() - t0))
await page.addInitScript(() => window.addEventListener('intro:done', () => window.__introDone?.()))
await page.goto(base + '/', { waitUntil: 'commit' })
const marks = [120, 350, 600, 850, 1100, 1400, 1900]
for (const ms of marks) {
  const wait = ms - (Date.now() - t0)
  if (wait > 0) await page.waitForTimeout(wait)
  await page.screenshot({ path: path.join(out, `intro-${String(ms).padStart(4, '0')}.png`) })
}
const state = await page.evaluate(() => ({
  preload: document.documentElement.classList.contains('preload'),
  built: document.documentElement.classList.contains('built'),
  pending: document.querySelectorAll('[data-build]:not([data-built="true"])').length,
}))
console.log(JSON.stringify({ doneAt, ...state }))
await browser.close()
