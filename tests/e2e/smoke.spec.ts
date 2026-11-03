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
    for (const id of ['top', 'work', 'builds', 'archive', 'experience', 'stack', 'certifications', 'about', 'contact']) {
      await expect(page.locator(`#${id}`), `#${id}`).toHaveCount(1)
    }
    await expect(page.locator('.chapter-wrap')).toHaveCount(3)
    await expect(page.locator('.manifesto')).toContainText('1,300+')
    await expect(page.locator('.build')).not.toHaveCount(0)
    // status pill uses the first job with no end date
    await expect(page.locator('.status-pill').first()).toContainText('Full Stack Developer Intern @ SKOPE Kitchens')
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
    await expect(page.locator('.build__title a').first()).toBeVisible()
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
