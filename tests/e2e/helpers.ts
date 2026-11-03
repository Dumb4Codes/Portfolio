import fs from 'node:fs'
import path from 'node:path'
import type { Page } from '@playwright/test'

const content = path.join(import.meta.dirname, '..', '..', 'content', 'projects')
export const projectSlugs = fs.readdirSync(content).map((f) => f.replace('.yaml', ''))
export const internalSlugs = ['skope-operations-platform', 'skope-hr-portal', 'mydeliveryboy']

/** Skip the first-visit preloader so tests do not wait for it. */
export async function skipIntro(page: Page, theme?: 'dark' | 'light') {
  await page.addInitScript((t) => {
    try {
      sessionStorage.setItem('pre', '1')
      if (t) localStorage.setItem('theme', t)
    } catch {
      /* ignore */
    }
  }, theme)
}

/** Console messages that should never happen in production. */
export function collectProblems(page: Page) {
  const problems: string[] = []
  page.on('console', (m) => {
    // "GL Driver Message ... GPU stall due to ReadPixels" is printed once per browser process by the
    // ANGLE/D3D11 driver on the first WebGL context (headless Chrome, Intel). It is not from this code.
    if (/GL Driver Message/.test(m.text())) return
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`)
  })
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
  return problems
}
