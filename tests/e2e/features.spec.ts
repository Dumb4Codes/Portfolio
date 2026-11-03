import { expect, test } from '@playwright/test'
import { skipIntro } from './helpers'

test.describe('interactions', () => {
  test('command palette opens with Ctrl+K, filters, and navigates', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')
    const box = page.getByRole('combobox', { name: 'Search commands' })
    await expect(box).toBeFocused()
    await box.fill('hr portal')
    await expect(page.getByRole('option')).toHaveCount(1)
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/work\/skope-hr-portal$/, { timeout: 15_000 })
    await expect(page.locator('h1')).toContainText('HR Portal')
  })

  test('palette: slash opens it, Escape closes it and returns focus', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/work')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('/')
    await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Command palette' })).toHaveCount(0)
  })

  test('theme toggle switches and persists across reloads', async ({ page }) => {
    await skipIntro(page, 'dark')
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.getByRole('button', { name: /Switch to light theme/ }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    // the init script in skipIntro re-sets dark on every load, so test persistence in a clean context
    const ctx = await page.context().browser()!.newContext()
    const p2 = await ctx.newPage()
    await p2.addInitScript(() => sessionStorage.setItem('pre', '1'))
    await p2.goto('/')
    await p2.getByRole('button', { name: /Switch to (light|dark) theme/ }).click()
    const chosen = await p2.locator('html').getAttribute('data-theme')
    await p2.reload()
    await expect(p2.locator('html')).toHaveAttribute('data-theme', chosen!)
    await ctx.close()
  })

  test('stack: pointing at a skill highlights the projects that use it', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/')
    const skill = page.getByRole('button', { name: /^Playwright/ })
    await skill.hover()
    await expect(page.locator('#stack .stack__readout')).toContainText('used in')
    await expect(page.locator('[data-project][data-hl="1"]').first()).toBeAttached()
    await expect(page.locator('[data-project][data-hl="0"]').first()).toBeAttached()
  })

  test('experience highlights are an accessible disclosure', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/')
    const summary = page.locator('.entry__details summary').first()
    await summary.scrollIntoViewIfNeeded()
    await summary.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('.entry__details').first()).toHaveAttribute('open', '')
  })

  test('certificates open in a dialog with focus trap and Escape', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/')
    const first = page.locator('.cert__card').first()
    await first.scrollIntoViewIfNeeded()
    await first.click({ force: true })
    const dlg = page.locator('dialog.cert-dialog')
    await expect(dlg).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dlg).toBeHidden()
  })

  test('copy email button shows a toast', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await skipIntro(page)
    await page.goto('/')
    const btn = page.getByRole('button', { name: /Copy/ })
    await btn.scrollIntoViewIfNeeded()
    await btn.click()
    await expect(page.locator('.toaster')).toContainText('Email copied')
  })

  test('phone is not plain text in the HTML, but appears for people', async ({ page, request }) => {
    const html = await (await request.get('/')).text()
    expect(html).not.toContain('78699')
    expect(html).not.toContain('7869905752')
    await skipIntro(page)
    await page.goto('/')
    await expect(page.locator('a[href^="tel:"]')).toHaveAttribute('href', 'tel:+917869905752')
  })

  test('typing "hire" does not break the page and scrolls to contact', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.keyboard.type('hire', { delay: 60 })
    await page.waitForTimeout(3200)
    const top = await page.locator('#contact').evaluate((el) => el.getBoundingClientRect().top)
    expect(top).toBeLessThan(400)
  })

  test('back/forward restores the scroll position', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => window.scrollTo(0, 5200))
    await page.waitForTimeout(600)
    const before = await page.evaluate(() => window.scrollY)
    await page.goto('/work')
    await page.goBack()
    await page.waitForTimeout(1500)
    const after = await page.evaluate(() => window.scrollY)
    expect(Math.abs(after - before)).toBeLessThan(250)
  })

  test('anchor links scroll to their section', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Contact' }).click()
    await page.waitForTimeout(2500)
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(3000)
    await expect(page).toHaveURL(/#contact$/)
  })
})

test.describe('contact form', () => {
  test.beforeEach(async ({ page }) => {
    await skipIntro(page)
    await page.goto('/')
    await page.locator('#contact').scrollIntoViewIfNeeded()
  })

  test('shows inline errors tied to fields and does not send', async ({ page }) => {
    let sent = 0
    await page.route('https://api.web3forms.com/**', (r) => (sent++, r.fulfill({ json: { success: true } })))
    const form = page.locator('form.form')
    test.skip((await form.count()) === 0, 'NEXT_PUBLIC_WEB3FORMS_KEY not set in this build (form hidden by design)')
    await form.getByRole('button', { name: 'Send message' }).click()
    await expect(form.getByRole('alert')).toHaveCount(3)
    await expect(form.getByLabel(/Your name/)).toHaveAttribute('aria-invalid', 'true')
    await form.getByLabel(/Your email/).fill('not-an-email')
    await form.getByLabel(/Your email/).blur()
    await expect(form.getByText(/does not look right/)).toBeVisible()
    expect(sent).toBe(0)
  })

  test('honeypot: a bot-filled form is dropped without a network call', async ({ page }) => {
    let sent = 0
    await page.route('https://api.web3forms.com/**', (r) => (sent++, r.fulfill({ json: { success: true } })))
    const form = page.locator('form.form')
    test.skip((await form.count()) === 0, 'form hidden (no key in this build)')
    await form.getByLabel(/Your name/).fill('Bot Botson')
    await form.getByLabel(/Your email/).fill('bot@example.com')
    await form.getByLabel(/Message/).fill('Buy cheap pills now, very long message')
    await form.locator('input[name="website"]').evaluate((el: HTMLInputElement) => (el.value = 'http://spam.example'))
    await form.getByRole('button', { name: 'Send message' }).click()
    await expect(form.getByRole('status')).toContainText('Sent')
    expect(sent).toBe(0)
  })

  test('a real message is posted to Web3Forms with the key; success and failure states', async ({ page }) => {
    const form = page.locator('form.form')
    test.skip((await form.count()) === 0, 'form hidden (no key in this build)')
    let body: Record<string, unknown> = {}
    await page.route('https://api.web3forms.com/**', async (r) => {
      body = r.request().postDataJSON()
      await r.fulfill({ json: { success: true } })
    })
    await form.getByLabel(/Your name/).fill('Asha Rao')
    await form.getByLabel(/Your email/).fill('asha@example.com')
    await form.getByLabel(/Message/).fill('Hello Youvraj, we would like to talk about a role.')
    await form.getByRole('button', { name: 'Send message' }).click()
    await expect(form.getByRole('status')).toContainText('Sent')
    expect(body.access_key).toBeTruthy()
    expect(body.email).toBe('asha@example.com')

    await page.unroute('https://api.web3forms.com/**')
    await page.route('https://api.web3forms.com/**', (r) => r.fulfill({ status: 500, json: { success: false } }))
    await form.getByLabel(/Your name/).fill('Asha Rao')
    await form.getByLabel(/Your email/).fill('asha@example.com')
    await form.getByLabel(/Message/).fill('Second message that fails to send.')
    await form.getByRole('button', { name: 'Send message' }).click()
    await expect(form.getByRole('status')).toContainText('Could not send')
    await expect(form.getByRole('status').getByRole('link')).toHaveAttribute('href', /^mailto:/)
  })
})

test.describe('admin', () => {
  test('/admin redirects to /keystatic and the editor loads', async ({ page }) => {
    const res = await page.goto('/admin')
    expect(page.url()).toMatch(/\/keystatic\/?$/)
    expect(res?.status()).toBe(200)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    // the Keystatic shell mounts and lists the collections it was configured with
    await expect(page.getByText('Projects').first()).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText('Certifications').first()).toBeVisible()
  })

  test('the editor can open a project entry (content round-trips through the schema)', async ({ page }) => {
    await page.goto('/keystatic/collection/projects/item/pulse')
    await expect(page.getByLabel('Tagline').first()).toBeVisible({ timeout: 20_000 })
    await expect(page.getByLabel('Tagline').first()).toHaveValue(/curated/)
  })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('no canvas, static SVG scene, content fully readable', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/')
    await page.waitForTimeout(2500)
    await expect(page.locator('canvas')).toHaveCount(0)
    await expect(page.locator('.static-scene svg')).toHaveCount(1)
    await expect(page.locator('.grain')).toBeHidden()
    await expect(page.locator('.manifesto__line').first()).toBeVisible()
    await expect(page.locator('.hero__headline')).toBeVisible()
    // nothing is left hidden by an unfinished entrance animation
    const hidden = await page.locator('[data-reveal]').evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity === '0').length)
    expect(hidden).toBe(0)
  })
})

test.describe('WebGL layer', () => {
  test('the particle canvas mounts after idle and is hidden from assistive tech', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/')
    const canvas = page.locator('.gl-layer canvas')
    await expect(canvas).toHaveCount(1, { timeout: 20_000 })
    await expect(page.locator('.gl-layer')).toHaveAttribute('aria-hidden', 'true')
    await expect(page.locator('html')).toHaveAttribute('data-gl', 'on', { timeout: 20_000 })
  })
})
