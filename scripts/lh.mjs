// Lighthouse runner: node scripts/lh.mjs <url> <mobile|desktop> [label]
// Prints the category scores and the gate metrics from QUALITY_GATES.md.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const [url = 'http://localhost:3100/', form = 'mobile', label = 'run'] = process.argv.slice(2)
fs.mkdirSync('.lighthouse', { recursive: true })
const out = `.lighthouse/${label}-${form}.json`
const cli = new URL('../node_modules/lighthouse/cli/index.js', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const args = [cli, url, '--output=json', `--output-path=${out}`, '--quiet', '--chrome-flags=--headless=new --no-sandbox', '--only-categories=performance,accessibility,best-practices,seo']
if (form === 'desktop') args.push('--preset=desktop')
const r = spawnSync(process.execPath, args, { encoding: 'utf8', env: { ...process.env, CHROME_PATH: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' } })
if (!fs.existsSync(out)) {
  console.log(r.stdout, r.stderr.slice(0, 2000))
  process.exit(1)
}
const j = JSON.parse(fs.readFileSync(out, 'utf8'))
const c = j.categories
const a = j.audits
const pick = (id) => a[id]?.displayValue ?? a[id]?.numericValue
console.log(`${label} ${form}: perf ${Math.round(c.performance.score * 100)}  a11y ${Math.round(c.accessibility.score * 100)}  best ${Math.round(c['best-practices'].score * 100)}  seo ${Math.round(c.seo.score * 100)}`)
console.log(`  FCP ${pick('first-contentful-paint')}  LCP ${pick('largest-contentful-paint')}  TBT ${pick('total-blocking-time')}  CLS ${pick('cumulative-layout-shift')}  SI ${pick('speed-index')}`)
const lcp = a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node
if (lcp) console.log(`  LCP element: ${lcp.selector} | ${String(lcp.snippet).slice(0, 80)}`)
for (const cat of ['performance', 'accessibility', 'best-practices', 'seo']) {
  for (const ref of c[cat].auditRefs) {
    const au = a[ref.id]
    if (au.score !== null && au.score < 1 && ref.weight > 0) console.log(`  [${cat}] ${au.id}: ${au.score} ${au.displayValue ?? ''} - ${au.title}`)
  }
}
