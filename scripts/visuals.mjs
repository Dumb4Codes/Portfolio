// QA: element screenshots of the standalone internal visuals. node scripts/visuals.mjs <outDir> <WxH>
import { chromium } from '@playwright/test'
import fs from 'node:fs'
const out = process.argv[2] ?? 'shots/visuals'
const [w, h] = (process.argv[3] ?? '1440x900').split('x').map(Number)
fs.mkdirSync(out, { recursive: true })
const b = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] })
const ctx = await b.newContext({ viewport: { width: w, height: h } })
await ctx.addInitScript(() => { try { sessionStorage.setItem('pre', '1') } catch {} })
const page = await ctx.newPage()
for (const slug of ['skope-operations-platform', 'skope-hr-portal', 'mydeliveryboy']) {
  await page.goto(`http://localhost:3100/work/${slug}`, { waitUntil: 'load' })
  await page.waitForTimeout(1500)
  const el = page.locator('.cs__visual')
  await el.scrollIntoViewIfNeeded()
  await page.evaluate(() => { const e = document.querySelector('.cs__visual'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 90) })
  await page.waitForTimeout(7500)
  await page.screenshot({ path: `${out}/${slug}.png` })
}
await b.close()
