import { expect, test } from '@playwright/test'
import { skipIntro } from './helpers'

const WIDTHS = [320, 360, 390, 414, 768, 1024, 1280, 1440, 1920, 2560]
const PAGES = ['/', '/work', '/work/skope-operations-platform', '/work/instantly', '/nothing-here']

test.describe('no horizontal scroll from 320px to 2560px', () => {
  for (const path of PAGES) {
    test(`${path}`, async ({ page }) => {
      await skipIntro(page)
      const bad: string[] = []
      for (const w of WIDTHS) {
        await page.setViewportSize({ width: w, height: w < 700 ? 800 : 900 })
        await page.goto(path)
        await page.waitForTimeout(500)
        // walk down the page so lazy sections and pinned layouts are all laid out
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += 900) {
            window.scrollTo(0, y)
            await new Promise((r) => setTimeout(r, 25))
          }
          window.scrollTo(0, 0)
        })
        const over = await page.evaluate(() => {
          const de = document.documentElement
          const wide = Array.from(document.querySelectorAll('body *')).filter((el) => {
            const r = (el as HTMLElement).getBoundingClientRect()
            const cs = getComputedStyle(el)
            return r.width > 0 && r.right > de.clientWidth + 1 && cs.position !== 'fixed' && !(el as HTMLElement).closest('.builds__track, .gallery__strip, .certs__stage, .ticker, .gl-layer, .cert, .palette, .cursor, .archive__preview, .wipe, .preloader, .grain, .about__photo, .site-header, [hidden]')
          })
          return { sw: de.scrollWidth, cw: de.clientWidth, culprit: wide[0]?.className?.toString().slice(0, 60) ?? '' }
        })
        if (over.sw > over.cw + 1) bad.push(`${w}px: scrollWidth ${over.sw} > ${over.cw}`)
      }
      expect(bad, bad.join('\n')).toEqual([])
    })
  }
})

test.describe('mobile layout is designed, not squeezed', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('hero name is one readable word that fills the width; touch targets are at least 44px', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/')
    const name = page.locator('.hero__first')
    await expect(name).toBeVisible()
    const box = await name.boundingBox()
    expect(box!.width).toBeGreaterThan(390 * 0.8)
    expect(box!.height).toBeLessThan(box!.width * 0.3) // one line, not two
    for (const sel of ['.menu-btn', '.icon-btn', '.btn']) {
      const b = await page.locator(sel).first().boundingBox()
      expect(b!.height, sel).toBeGreaterThanOrEqual(36) // 44 for primary controls, 36 for the small copy button
    }
    const menu = await page.locator('.menu-btn').boundingBox()
    expect(menu!.height).toBeGreaterThanOrEqual(44)
  })

  test('the menu opens, traps focus and closes with Escape', async ({ page }) => {
    await skipIntro(page)
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu' }).click()
    const dlg = page.getByRole('dialog', { name: 'Menu' })
    await expect(dlg).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dlg).toBeHidden()
    await expect(page.getByRole('button', { name: 'Menu' })).toBeFocused()
  })
})
