import { expect, test } from '@playwright/test'
import { collectProblems, internalSlugs, projectSlugs, skipIntro } from './helpers'

test.describe('smoke', () => {
  test('home renders every section with real content and no console problems', async ({ page }) => {
    await skipIntro(page)
    const problems = collectProblems(page)
    const res = await page.goto('/')
    expect(res?.status()).toBe(200)

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText('Youvraj')
    await expect(page.locator('h1')).toContainText('Singh')
    for (const id of ['top', 'work', 'archive', 'experience', 'stack', 'certifications', 'about', 'contact']) {
      await expect(page.locator(`#${id}`), `#${id}`).toHaveCount(1)
    }
    // one mixed grid: internal and personal work side by side
    await expect(page.locator('.wcard')).toHaveCount(7)
    await expect(page.locator('.wcard--internal')).toHaveCount(3)
    await expect(page.locator('.wcard--personal')).toHaveCount(4)
    // the range line is filled from content: job count, project count, test total
    await expect(page.locator('.manifesto')).toContainText('Two internships')
    await expect(page.locator('.manifesto')).toContainText('Thirteen shipped projects')
    await expect(page.locator('.manifesto')).toContainText(/\d[\d,]*\+ automated tests/)
    // the header pill shows availability, not the job title
    await expect(page.locator('.status-pill').first()).toContainText('Open to full-time roles')
    // the hero names the current job (first job with no end date) and has the three calls to action
    await expect(page.locator('.hero__signals')).toContainText('Full Stack Developer Intern, SKOPE Kitchens')
    await expect(page.locator('.hero__cta .btn')).toHaveCount(3)
    // both jobs are shown, SKOPE as Present
    await expect(page.locator('.entry__date').first()).toContainText('PRESENT')
    await page.waitForTimeout(2500)
    expect(problems, problems.join('\n')).toEqual([])
  })

  test('home works without JavaScript: all content is in the HTML', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false })
    const page = await ctx.newPage()
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Youvraj')
    await expect(page.locator('#work')).toContainText('SKOPE')
    await expect(page.locator('#experience')).toContainText('HASVIK Technologies')
    await expect(page.locator('.wcard__title a').first()).toBeVisible()
    await expect(page.locator('.hero__headline')).toBeVisible()
    await ctx.close()
  })

  test('every project page returns 200 with its own h1', async ({ page }) => {
    await skipIntro(page)
    for (const slug of projectSlugs) {
      const res = await page.goto(`/work/${slug}`)
      expect(res?.status(), slug).toBe(200)
      await expect(page.locator('h1'), slug).toHaveCount(1)
    }
  })

  test('/work index lists everything and filters', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/work')
    await expect(page.locator('.workindex__item')).toHaveCount(projectSlugs.length)
    await page.getByRole('button', { name: 'Internal', exact: true }).click()
    await expect(page.locator('.workindex__item')).toHaveCount(internalSlugs.length)
  })

  test('unknown slug and unknown route give a 404 inside the site layout', async ({ page }) => {
    await skipIntro(page)
    const a = await page.goto('/work/does-not-exist')
    expect(a?.status()).toBe(404)
    const b = await page.goto('/nope/at/all')
    expect(b?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('does not add up')
    await expect(page.getByRole('link', { name: 'Back home' })).toBeVisible()
    await expect(page.locator('.site-header')).toBeVisible() // site chrome is present
  })

  test('sitemap, robots and manifest exist; admin is excluded', async ({ request }) => {
    const sm = await (await request.get('/sitemap.xml')).text()
    for (const s of projectSlugs) expect(sm).toContain(`/work/${s}`)
    expect(sm).not.toContain('keystatic')
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain('Disallow: /keystatic')
    expect(robots).toContain('Disallow: /admin')
    expect(robots).toContain('Disallow: /api')
    expect((await request.get('/manifest.webmanifest')).status()).toBe(200)
  })

  test('share images render for home and a project', async ({ request }) => {
    const og = async (path: string) => {
      const html = await (await request.get(path)).text()
      const m = /property="og:image" content="([^"]+)"/.exec(html)
      expect(m, `og:image tag on ${path}`).toBeTruthy()
      return request.get(new URL(m![1]).pathname)
    }
    for (const path of ['/', '/work/pulse', '/work/skope-hr-portal']) {
      const img = await og(path)
      expect(img.status(), path).toBe(200)
      expect(img.headers()['content-type']).toContain('image/png')
    }
  })
})

test.describe('build intro (first visit)', () => {
  test('cursors assemble the hero, then everything is visible and it never runs twice', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    await page.addInitScript(() => {
      window.addEventListener('intro:done', () => ((window as unknown as { __introDone?: number }).__introDone = performance.now()))
    })
    await page.goto('/')
    // the boot script decided before paint that the intro runs; the intro ends by marking <html> as built
    await expect(page.locator('html')).toHaveClass(/built/, { timeout: 6000 })
    const t = await page.evaluate(() => (window as unknown as { __introDone?: number }).__introDone)
    expect(t).toBeTruthy()
    // the intro itself is capped at 1.6 s; measured from navigation start it must still be quick
    expect(t!).toBeLessThan(4500)
    // nothing is left hidden and the overlay is gone
    const hidden = await page.locator('[data-build]').evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity === '0').length)
    expect(hidden).toBe(0)
    await expect(page.locator('.intro__cursor')).toHaveCount(0)
    expect(await page.evaluate(() => sessionStorage.getItem('pre'))).toBe('1')
    // second load in the same session: no intro
    await page.goto('/')
    await page.waitForTimeout(300)
    expect(await page.evaluate(() => document.documentElement.classList.contains('preload'))).toBe(false)
    await ctx.close()
  })

  test('a key press skips the intro immediately', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    await page.goto('/', { waitUntil: 'commit' })
    await page.waitForFunction(() => document.querySelector('.intro__cursor') !== null, null, { timeout: 5000 }).catch(() => {})
    await page.keyboard.press('Escape')
    await expect(page.locator('html')).not.toHaveClass(/preload/, { timeout: 1500 })
    await ctx.close()
  })
})
