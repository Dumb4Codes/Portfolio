import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { internalSlugs, projectSlugs, skipIntro } from './helpers'

async function axe(page: Page) {
  return new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze()
}
const fmt = (r: Awaited<ReturnType<typeof axe>>) =>
  r.violations.map((v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n  ')}`).join('\n')

for (const theme of ['dark', 'light'] as const) {
  test.describe(`axe (${theme})`, () => {
    test('home has zero violations', async ({ page }) => {
      await skipIntro(page, theme)
      await page.goto('/')
      await page.waitForTimeout(2500)
      const r = await axe(page)
      expect(r.violations, fmt(r)).toEqual([])
    })
    test('a personal case study has zero violations', async ({ page }) => {
      await skipIntro(page, theme)
      await page.goto('/work/instantly')
      await page.waitForTimeout(1800)
      const r = await axe(page)
      expect(r.violations, fmt(r)).toEqual([])
    })
    test('an internal case study has zero violations', async ({ page }) => {
      await skipIntro(page, theme)
      await page.goto('/work/skope-hr-portal')
      await page.waitForTimeout(1800)
      const r = await axe(page)
      expect(r.violations, fmt(r)).toEqual([])
    })
    test('404 has zero violations', async ({ page }) => {
      await skipIntro(page, theme)
      await page.goto('/this-page-is-missing')
      await page.waitForTimeout(1800)
      const r = await axe(page)
      expect(r.violations, fmt(r)).toEqual([])
    })
    test('work index has zero violations', async ({ page }) => {
      await skipIntro(page, theme)
      await page.goto('/work')
      const r = await axe(page)
      expect(r.violations, fmt(r)).toEqual([])
    })
  })
}

test.describe('palette and dialogs are accessible when open', () => {
  test('command palette', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')
    await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible()
    const r = await axe(page)
    expect(r.violations, fmt(r)).toEqual([])
  })
})

test.describe('CONTENT_RULES: internal work stays confidential', () => {
  for (const slug of internalSlugs) {
    test(`/work/${slug}: no links, screenshots, repos or private details`, async ({ page, request }) => {
      const html = await (await request.get(`/work/${slug}`)).text()
      expect(html).toContain('Internal · Confidential')
      expect(html).not.toMatch(/github\.com\/Dumb4Codes\/[A-Za-z]/) // the profile link has no repo path
      expect(html.replace(/youvraj-singh\.vercel\.app/g, '')).not.toContain('vercel.app') // the portfolio's own address is fine
      expect(html).not.toContain('onrender.com')
      expect(html).not.toContain('supabase.co')
      expect(html).not.toContain('/images/projects/skope')
      expect(html).not.toMatch(/Live site|Code ↗/)
      await page.goto(`/work/${slug}`)
      // the only external links on the page are the site-wide social links in the footer / palette
      const external = await page.locator('main a[href^="http"]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href))
      expect(external, external.join(', ')).toEqual([])
      await expect(page.locator('main img')).toHaveCount(0)
    })
  }

  test('internal projects carry the illustrative label on every visual', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/')
    const tags = page.locator('.wcard--internal .vis-tag')
    await expect(tags).toHaveCount(3)
    for (const t of await tags.all()) await expect(t).toContainText('Illustrative · sample data')
    // internal cards carry the badge, never a Live or Code button or a screenshot
    await expect(page.locator('.wcard--internal .badge')).toHaveCount(3)
    await expect(page.locator('.wcard--internal a[target="_blank"]')).toHaveCount(0)
    await expect(page.locator('.wcard--internal img')).toHaveCount(0)
  })

  test('the archive lists internal rows without links', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/')
    for (const slug of internalSlugs) {
      const row = page.locator(`.archive__row[data-project="${slug}"]`)
      await expect(row).toHaveCount(1)
      expect(await row.locator('a[target="_blank"]').count()).toBe(0)
    }
  })

  test('the reference notes and the kit are never shipped', async ({ request }) => {
    for (const p of ['/_kit/PROMPT.md', '/_kit/reference/instantly-deep-dive.md', '/reference/carrental-notes.txt']) {
      expect((await request.get(p)).status(), p).toBe(404)
    }
    expect(projectSlugs.length).toBeGreaterThan(5)
  })
})
