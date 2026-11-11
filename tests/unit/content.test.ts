import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'
import { describe, expect, it } from 'vitest'
import {
  dateRange,
  formatMetric,
  formatMonth,
  hashSlug,
  parseMetric,
  projectsUsing,
  renderManifesto,
  skillKeys,
  splitEmphasis,
  splitHeadline,
  stackKey,
  testsTotal,
} from '@/content/derive'
import { certificationSchema, experienceSchema, profileSchema, projectSchema, siteSchema, skillsSchema } from '@/content/schema'

const root = path.join(import.meta.dirname, '..', '..', 'content')
const read = (f: string) => YAML.parse(fs.readFileSync(path.join(root, f), 'utf8'))
const dir = (d: string) => fs.readdirSync(path.join(root, d)).map((f) => [f.replace('.yaml', ''), read(`${d}/${f}`)] as const)

describe('seed content validates against the zod schemas', () => {
  it('singletons', () => {
    expect(() => profileSchema.parse(read('profile.yaml'))).not.toThrow()
    expect(() => siteSchema.parse(read('site.yaml'))).not.toThrow()
    expect(() => skillsSchema.parse(read('skills.yaml'))).not.toThrow()
  })
  it.each(dir('projects'))('project %s', (_slug, data) => {
    expect(() => projectSchema.parse(data)).not.toThrow()
  })
  it.each(dir('experience'))('experience %s', (_slug, data) => {
    expect(() => experienceSchema.parse(data)).not.toThrow()
  })
  it.each(dir('certifications'))('certification %s', (_slug, data) => {
    expect(() => certificationSchema.parse(data)).not.toThrow()
  })
})

describe('project schema rules', () => {
  const base = { title: 'X', kind: 'personal', order: 1, year: 2026, role: '', tagline: '', stack: [], gallery: [], metrics: [], approach: [], myWork: [], nextSteps: [] }

  it('internal projects can never carry links, a cover or a gallery (CONTENT_RULES §1)', () => {
    const p = projectSchema.parse({
      ...base,
      kind: 'internal',
      visual: 'ledger',
      liveUrl: 'https://example.com',
      repoUrl: 'https://github.com/a/b',
      cover: '/images/x.webp',
      gallery: [{ src: '/images/x.webp', alt: 'x' }],
    })
    expect(p.liveUrl).toBeUndefined()
    expect(p.repoUrl).toBeUndefined()
    expect(p.cover).toBeUndefined()
    expect(p.gallery).toEqual([])
  })

  it('personal projects keep links and have no internal visual', () => {
    const p = projectSchema.parse({ ...base, visual: 'ledger', liveUrl: 'https://example.com' })
    expect(p.liveUrl).toBe('https://example.com')
    expect(p.visual).toBe('none')
  })

  it('treats empty strings from the admin as "not set"', () => {
    const p = projectSchema.parse({ ...base, liveUrl: '', cover: '', problem: '', testsCount: null })
    expect(p.liveUrl).toBeUndefined()
    expect(p.cover).toBeUndefined()
    expect(p.problem).toBeUndefined()
  })

  it('names the field when something is wrong', () => {
    const r = projectSchema.safeParse({ ...base, gallery: [{ src: '/a.webp', alt: '' }] })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].path.join('.')).toBe('gallery.0.alt')
  })

  it('experience: bad month fails with a readable message; empty end means Present', () => {
    const e = { company: 'A', role: 'B', location: 'C', mode: 'Remote', order: 1, start: '2026-13', highlights: [], stack: [], projects: [] }
    const bad = experienceSchema.safeParse(e)
    expect(bad.success).toBe(false)
    if (!bad.success) expect(bad.error.issues[0].message).toMatch(/YYYY-MM/)
    expect(experienceSchema.parse({ ...e, start: '2026-06', end: '' }).end).toBeUndefined()
    // typed in the admin: means "still in the role", must not break the build
    expect(experienceSchema.parse({ ...e, start: '2026-06', end: 'Present' }).end).toBeUndefined()
  })
})

describe('manifesto total', () => {
  it('adds testsCount across projects: 471 + 191 + 272 = 934', () => {
    const projects = dir('projects').map(([, d]) => projectSchema.parse(d))
    expect(testsTotal(projects)).toBe(934)
  })
  it('replaces {tests} with the formatted number', () => {
    expect(renderManifesto('{tests} checks. {tests}', 1234)).toBe('1,234 checks. 1,234')
  })
})

describe('metric parser', () => {
  const cases: [string, Partial<ReturnType<typeof parseMetric>>][] = [
    ['464', { prefix: '', suffix: '', value: 464 }],
    ['<400ms', { prefix: '<', suffix: 'ms', value: 400 }],
    ['~30%', { prefix: '~', suffix: '%', value: 30 }],
    ['−25%', { prefix: '−', suffix: '%', value: 25 }],
    ['₹0.00', { prefix: '₹', value: 0, decimals: 2 }],
    ['14+', { suffix: '+', value: 14 }],
    ['20s', { suffix: 's', value: 20 }],
    ['1–4', { value: null }],
    ['1,300+', { value: 1300, suffix: '+' }],
  ]
  it.each(cases)('parses %s', (raw, want) => {
    expect(parseMetric(raw)).toMatchObject(want)
  })
  it('formats mid-count values keeping prefix, suffix and decimals', () => {
    expect(formatMetric(parseMetric('<400ms'), 123.7)).toBe('<124ms')
    expect(formatMetric(parseMetric('₹0.00'), 0)).toBe('₹0.00')
    expect(formatMetric(parseMetric('1,300+'), 1300)).toBe('1,300+')
    expect(formatMetric(parseMetric('1–4'), 2)).toBe('1–4')
  })
})

describe('stack alias matcher', () => {
  it.each([
    ['React 19', 'react'],
    ['React.js', 'react'],
    ['Next.js 16', 'next'],
    ['Node.js', 'node'],
    ['Express 5', 'express'],
    ['Express.js', 'express'],
    ['Tailwind CSS v4', 'tailwind'],
    ['Tailwind CSS 4', 'tailwind'],
    ['PostgreSQL', 'postgres'],
    ['AWS S3', 's3'],
    ['JavaScript (ES6+)', 'javascript'],
  ])('%s -> %s', (name, key) => expect(stackKey(name)).toBe(key))

  it('React 19 and React.js are the same skill', () => {
    expect(stackKey('React 19')).toBe(stackKey('React.js'))
  })
  it('"Gemini / Vercel AI SDK" matches either half', () => {
    expect(skillKeys('Gemini / Vercel AI SDK')).toHaveLength(2)
    expect(projectsUsing('Gemini / Vercel AI SDK', [{ slug: 'a', stack: ['Gemini'] }, { slug: 'b', stack: ['Vercel AI SDK'] }, { slug: 'c', stack: ['Zod'] }])).toEqual(['a', 'b'])
  })
  it('counts projects per skill using aliases', () => {
    const projects = [
      { slug: 'a', stack: ['React 19', 'Vite'] },
      { slug: 'b', stack: ['React.js'] },
      { slug: 'c', stack: ['Vue'] },
    ]
    expect(projectsUsing('React 19', projects)).toEqual(['a', 'b'])
  })
})

describe('text helpers', () => {
  it('splitHeadline picks the verb for italic serif', () => {
    expect(splitHeadline('I build the software that runs real businesses.')).toEqual({ before: 'I build the software that', accent: 'runs', after: 'real businesses.' })
  })
  it('splitHeadline falls back to the second-to-last word', () => {
    expect(splitHeadline('Quiet software for loud kitchens').accent).toBe('loud')
  })
  it('splitEmphasis flags starred words', () => {
    expect(splitEmphasis("Let's build *something* that adds up.")).toEqual([
      { t: "Let's build ", em: false },
      { t: 'something', em: true },
      { t: ' that adds up.', em: false },
    ])
  })
  it('formats dates the ledger way and says PRESENT when there is no end', () => {
    expect(formatMonth('2026-10')).toBe('OCT 2026')
    expect(dateRange('2026-10')).toBe('OCT 2026 — PRESENT')
    expect(dateRange('2026-06', '2026-10')).toBe('JUN 2026 — OCT 2026')
  })
  it('hashSlug is stable and in 0..1', () => {
    expect(hashSlug('pulse')).toBe(hashSlug('pulse'))
    expect(hashSlug('pulse')).toBeGreaterThanOrEqual(0)
    expect(hashSlug('pulse')).toBeLessThan(1)
  })
})
