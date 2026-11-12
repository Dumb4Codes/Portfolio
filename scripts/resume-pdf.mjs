// Renders an HTML résumé to an A4 PDF with Chromium: node scripts/resume-pdf.mjs <in.html> <out.pdf>
// Links stay clickable; @page rules in the HTML set the margins. Then copy the PDF to public/resume/ to publish it.
import { chromium } from '@playwright/test'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const [input, output] = process.argv.slice(2)
if (!input || !output) {
  console.error('usage: node scripts/resume-pdf.mjs <in.html> <out.pdf>')
  process.exit(1)
}
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(pathToFileURL(path.resolve(input)).href, { waitUntil: 'networkidle' })
await page.emulateMedia({ media: 'print' })
await page.pdf({ path: path.resolve(output), format: 'A4', printBackground: true, preferCSSPageSize: true })
const pages = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight / (297 * 3.7795)))
console.log(`wrote ${output} (~${pages} page${pages === 1 ? '' : 's'} of content)`)
await browser.close()
