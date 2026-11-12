// Console probe: node scripts/probe.mjs <baseUrl> home work work/instantly ...
// Prints the h1 and the first console errors / page errors per page. Paths are given without a
// leading slash because Git Bash rewrites "/work" into a Windows path.
import { chromium } from '@playwright/test'

const base = process.argv[2]
const paths = process.argv.slice(3).map((p) => (p === 'home' ? '/' : '/' + p.replace(/^\/+/, '')))
const browser = await chromium.launch()
for (const p of paths) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('pre', '1')
    } catch {}
  })
  const logs = []
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text().slice(0, 700))
  })
  page.on('pageerror', (e) => logs.push('pageerror: ' + (e.stack || e.message).slice(0, 900)))
  await page.goto(base + p, { waitUntil: 'networkidle' }).catch((e) => logs.push('goto: ' + e.message))
  await page.waitForTimeout(1500)
  const h1 = await page.locator('h1').first().textContent().catch(() => null)
  console.log('==', p, 'h1=', h1)
  logs.slice(0, 6).forEach((l) => console.log('  ', l))
  await page.close()
}
await browser.close()
