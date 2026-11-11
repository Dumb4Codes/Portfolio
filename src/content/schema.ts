import { z } from 'zod'

/**
 * Content schemas. Keystatic's reader gives us loosely-typed values (empty strings, nulls);
 * these schemas normalise them and fail the build with a message naming the file and field.
 */

const blank = (v: unknown) => (v === '' || v === null ? undefined : v)
const optString = z.preprocess(blank, z.string().trim().min(1).optional())
const optUrl = z.preprocess(blank, z.url().optional())
const optPath = z.preprocess(blank, z.string().startsWith('/').optional())
const stringList = z.preprocess((v) => (v == null ? [] : v), z.array(z.string().trim().min(1)))
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'must look like YYYY-MM, e.g. 2026-10')

export const profileSchema = z.object({
  name: z.string().min(1),
  shortName: z.string().min(1),
  role: z.string().min(1),
  headline: z.string().min(1),
  subheadline: z.string().min(1),
  availability: z.object({
    status: z.enum(['open', 'busy', 'closed']),
    label: z.string().min(1),
  }),
  location: z.string().min(1),
  timezone: z.string().min(1),
  email: z.email(),
  phone: z.string().min(5),
  socials: z.object({
    github: optUrl,
    linkedin: optUrl,
    leetcode: optUrl,
    extra: z.preprocess(
      (v) => (v == null ? [] : v),
      z.array(z.object({ label: z.string().min(1), url: z.url() })),
    ),
  }),
  resume: optPath,
  photo: optPath,
  photoAlt: z.string().default(''),
  bio: z.string().min(1),
  education: z.object({ degree: z.string(), school: z.string(), years: z.string() }),
})

export const siteSchema = z.object({
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
  manifesto: z.string().min(1),
  contactHeadline: z.string().default("Let's build *something* that adds up."),
  ogImage: optPath,
  showPreloader: z.boolean().default(true),
  easterEgg: z.boolean().default(true),
})

export const skillsSchema = z.object({
  groups: z.array(z.object({ name: z.string().min(1), items: stringList })),
})

const metricSchema = z.object({ value: z.string().min(1), label: z.string().min(1) })

export const projectSchema = z
  .object({
    title: z.string().min(1),
    kind: z.enum(['internal', 'personal']),
    company: optString,
    featured: z.boolean().default(false),
    order: z.number().int(),
    year: z.number().int().min(2015).max(2100),
    role: z.string().default(''),
    tagline: z.string().default(''),
    summary: optString,
    problem: optString,
    approach: stringList,
    myWork: stringList,
    outcome: optString,
    nextSteps: stringList,
    metrics: z.preprocess((v) => (v == null ? [] : v), z.array(metricSchema)),
    testsCount: z.preprocess(blank, z.number().int().nonnegative().optional()),
    stack: stringList,
    visual: z.enum(['none', 'ledger', 'payroll', 'route']).default('none'),
    illustrativeExample: optString,
    liveUrl: optUrl,
    repoUrl: optUrl,
    cover: optPath,
    gallery: z.preprocess(
      (v) => (v == null ? [] : v),
      z.array(z.object({ src: z.string().startsWith('/'), alt: z.string().trim().min(1, 'alt text is required') })),
    ),
  })
  .transform((p) => {
    // CONTENT_RULES §1: internal work never carries links, screenshots or a gallery.
    if (p.kind === 'internal') {
      return { ...p, liveUrl: undefined, repoUrl: undefined, cover: undefined, gallery: [] as typeof p.gallery }
    }
    return { ...p, visual: 'none' as const }
  })

export const experienceSchema = z.object({
  company: z.string().min(1),
  companyNote: optString,
  url: optUrl,
  role: z.string().min(1),
  location: z.string().min(1),
  mode: z.enum(['On-site', 'Remote', 'Hybrid']),
  start: month,
  // empty = still in the role; "Present" typed in the admin means the same thing
  end: z.preprocess((v) => (typeof v === 'string' && /^\s*(present|current|now)\s*$/i.test(v) ? undefined : blank(v)), month.optional()),
  order: z.number().int(),
  summary: z.string().default(''),
  highlights: stringList,
  stack: stringList,
  projects: z.preprocess(
    (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x) : []),
    z.array(z.string()),
  ),
})

export const certificationSchema = z.object({
  title: z.string().min(1),
  issuer: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be a date, YYYY-MM-DD'),
  order: z.number().int().default(50),
  verifyUrl: optUrl,
  file: optPath,
  image: z.string().startsWith('/'),
})

export type Profile = z.infer<typeof profileSchema>
export type SiteSettings = z.infer<typeof siteSchema>
export type Skills = z.infer<typeof skillsSchema>
export type Project = z.infer<typeof projectSchema> & { slug: string }
export type Experience = z.infer<typeof experienceSchema> & { slug: string }
export type Certification = z.infer<typeof certificationSchema> & { slug: string }
