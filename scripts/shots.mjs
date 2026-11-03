// Screenshot harness: node scripts/shots.mjs <outDir> [widthxheight,...] [dark|light|both] [pageFilter]
// Expects `next start` on PORT (default 3100). Scrolls to each landmark and captures the viewport.
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const out = process.argv[2] ?? 'shots'
const sizes = (process.argv[3] ?? '390x844,768x1024,1440x900,1920x1080').split(',').map((s) => s.split('x').map(Number))
const themes = process.argv[4] === 'light' ? ['light'] : process.argv[4] === 'dark' ? ['dark'] : process.argv[4] ? ['dark', 'light'] : ['dark']
const only = process.argv[5]
const base = `http://localhost:${process.env.PORT ?? 3100}`

const homeStops = [
  ['01-hero', '#top', 0],
  ['02-manifesto', '.manifesto', 0.05],
  ['03-work-intro', '.work__intro', 0],
  ['04-chapter-ledger-a', '[data-scene=ledger]', 0.22],
  ['05-chapter-ledger-b', '[data-scene=ledger]', 0.55],
  ['06-chapter-clock', '[data-scene=clock]', 0.5],
  ['07-chapter-route', '[data-scene=route]', 0.5],
  ['08-builds', '.builds', 0.2],
  ['09-builds-pinned', '.builds__stage', 0.25],
  ['10-archive', '.archive', 0.05],
  ['11-experience', '.experience', 0.1],
  ['12-stack', '.stack', 0.05],
  ['13-certs', '.certs', 0.1],
  ['14-about', '.about', 0.1],
  ['15-contact', '.contact', 0.0],
  ['16-footer', '.site-footer', -0.5],
]
const pages = [
  ['home', '/', homeStops],
  ['case-internal', '/work/skope-operations-platform', [['a-top', 'body', 0], ['b-visual', '.cs__cover', 0], ['c-body', '.cs__body', 0.1], ['d-end', '.cs__next', 0]]],
  ['case-hr', '/work/skope-hr-portal', [['a-visual', '.cs__cover', 0]]],
  ['case-route', '/work/mydeliveryboy', [['a-visual', '.cs__cover', 0]]],
  ['case-personal', '/work/instantly', [['a-top', 'body', 0], ['b-body', '.cs__body', 0.1], ['c-gallery', '.cs__gallery', 0]]],
  ['work', '/work', [['a', 'body', 0]]],
  ['404', '/nope', [['a', 'body', 0]]],
]

const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] })
for (const [w, h] of sizes) {
  for (const theme of themes) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme, deviceScaleFactor: 1, hasTouch: w < 800, isMobile: w < 800 })
    await ctx.addInitScript(([t, w]) => { try { localStorage.setItem('theme', t); sessionStorage.setItem('pre', '1'); sessionStorage.setItem('particles', w < 800 ? '8000' : '40000') } catch {} }, [theme, w])
    const page = await ctx.newPage()
    const errors = []
    page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errors.push(`${m.type()}: ${m.text()}`) })
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
    for (const [name, url, stops] of pages) {
      if (only && !name.startsWith(only)) continue
      const dir = path.join(out, `${w}x${h}`, theme, name)
      fs.mkdirSync(dir, { recursive: true })
      await page.goto(base + url, { waitUntil: 'load' })
      await page.waitForTimeout(name === 'home' || name === '404' ? 3200 : 1500)
      for (const [label, sel, frac] of stops) {
        await page.evaluate(([sel, frac]) => {
          const el = document.querySelector(sel)
          if (!el) return
          const r = el.getBoundingClientRect()
          const y = window.scrollY + r.top + frac * Math.max(r.height - innerHeight * 0, 0) - (sel === 'body' ? 0 : 0)
          window.scrollTo(0, Math.max(0, y))
        }, [sel, frac])
        await page.waitForTimeout(1700)
        await page.screenshot({ path: path.join(dir, `${label}.png`) })
      }
    }
    if (errors.length) fs.writeFileSync(path.join(out, `${w}x${h}`, theme, 'console.txt'), [...new Set(errors)].join('\n'))
    await ctx.close()
  }
}
await browser.close()
console.log('done')
