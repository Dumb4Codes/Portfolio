import type { Experience, Project } from './schema'

/** Pure helpers derived from content. No I/O, safe to unit test and to run in the browser. */

// ---------- metrics ----------

export type ParsedMetric = {
  raw: string
  prefix: string
  suffix: string
  /** numeric part, when the value can count up */
  value: number | null
  decimals: number
}

/** "<400ms" -> prefix "<", 400, suffix "ms". "1–4" or "—" cannot count up and stay as written. */
export function parseMetric(raw: string): ParsedMetric {
  const m = /^([^\d]*)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(raw.trim())
  if (!m || /\d/.test(m[3])) return { raw, prefix: '', suffix: '', value: null, decimals: 0 }
  const [, prefix, num, suffix] = m
  const decimals = num.includes('.') ? num.split('.')[1].length : 0
  return { raw, prefix, suffix, value: Number(num.replace(/,/g, '')), decimals }
}

export function formatMetric(p: ParsedMetric, current: number): string {
  if (p.value === null) return p.raw
  const body = current.toLocaleString('en-US', { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals })
  return `${p.prefix}${body}${p.suffix}`
}

// ---------- manifesto ----------

export function testsTotal(projects: Pick<Project, 'testsCount'>[]): number {
  return projects.reduce((sum, p) => sum + (p.testsCount ?? 0), 0)
}

export function renderManifesto(template: string, total: number): string {
  return template.replace(/\{tests\}/g, total.toLocaleString('en-US'))
}

// ---------- stack aliases ----------

const ALIASES: Record<string, string> = {
  reactjs: 'react',
  nextjs: 'next',
  nodejs: 'node',
  expressjs: 'express',
  postgresql: 'postgres',
  tailwindcss: 'tailwind',
  mongodb: 'mongodb',
  framermotion: 'framermotion',
  threejs: 'threejs',
  reactthreefiber: 'r3f',
  awss3: 's3',
  s3: 's3',
  geminivercelaisdk: 'gemini',
  vercelaisdk: 'vercelaisdk',
  aws: 'aws',
}

/** "React 19" and "React.js" -> "react". "Tailwind CSS v4" and "Tailwind CSS" -> "tailwind". */
export function stackKey(name: string): string {
  const s = name
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\s+v?\d+(\.\d+)*\+?$/, '')
    .replace(/[\s.\-_/]+/g, '')
  return ALIASES[s] ?? s
}

/** A skill such as "Gemini / Vercel AI SDK" matches either half. */
export function skillKeys(name: string): string[] {
  return name.includes(' / ') ? name.split(' / ').map(stackKey) : [stackKey(name)]
}

export function projectsUsing(skill: string, projects: Pick<Project, 'slug' | 'stack'>[]): string[] {
  const keys = new Set(skillKeys(skill))
  return projects.filter((p) => p.stack.some((t) => keys.has(stackKey(t)))).map((p) => p.slug)
}

// ---------- sorting & dates ----------

export const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order

export function currentJob(jobs: Experience[]): Experience | undefined {
  return [...jobs].sort(byOrder).find((j) => !j.end)
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export function formatMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}
export function dateRange(start: string, end?: string): string {
  return `${formatMonth(start)} — ${end ? formatMonth(end) : 'PRESENT'}`
}

export function formatCertDate(iso: string): string {
  const [y, m] = iso.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

// ---------- headline accent ----------

/** Splits the headline so one word can be set in italic serif. Prefers a verb like "runs". */
export function splitHeadline(headline: string): { before: string; accent: string; after: string } {
  const words = headline.split(' ')
  let i = words.findIndex((w) => /^(runs|run|ships|builds|adds|ship)$/i.test(w.replace(/[.,]/g, '')))
  if (i < 0) i = Math.max(0, words.length - 2)
  const accent = words[i].replace(/[.,]$/, '')
  const trail = words[i].slice(accent.length)
  return {
    before: words.slice(0, i).join(' '),
    accent,
    after: (trail + ' ' + words.slice(i + 1).join(' ')).trim() ? (trail + ' ' + words.slice(i + 1).join(' ')).trimStart() : '',
  }
}

/** "Let's build *something* that adds up." -> text parts, with the starred word flagged for italic serif. */
export function splitEmphasis(text: string): { t: string; em: boolean }[] {
  return text
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((t) => (t.startsWith('*') && t.endsWith('*') ? { t: t.slice(1, -1), em: true } : { t, em: false }))
}

/** Deterministic 0..1 hash for generated covers. */
export function hashSlug(slug: string): number {
  let h = 2166136261
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}
