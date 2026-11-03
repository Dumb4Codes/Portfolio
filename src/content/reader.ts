import 'server-only'
import { createReader } from '@keystatic/core/reader'
import type { ZodType } from 'zod'
import keystaticConfig from '../../keystatic.config'
import {
  certificationSchema,
  experienceSchema,
  profileSchema,
  projectSchema,
  siteSchema,
  skillsSchema,
  type Certification,
  type Experience,
  type Profile,
  type Project,
  type SiteSettings,
  type Skills,
} from './schema'
import { byOrder, currentJob, testsTotal } from './derive'

/** Build-time content reader. A broken entry fails the build and names the file and field. */

const reader = createReader(process.cwd(), keystaticConfig)

function parse<T>(schema: ZodType<T>, file: string, data: unknown): T {
  const result = schema.safeParse(data)
  if (result.success) return result.data
  const lines = result.error.issues.map((i) => `  ${file} -> ${i.path.join('.') || '(root)'}: ${i.message}`)
  throw new Error(`Content error. Fix this in the admin or the YAML file:\n${lines.join('\n')}`)
}

export type SiteData = {
  profile: Profile
  site: SiteSettings
  skills: Skills
  projects: Project[]
  experience: Experience[]
  certifications: Certification[]
  testsTotal: number
  currentJob: Experience | undefined
}

let cache: Promise<SiteData> | undefined

async function load(): Promise<SiteData> {
  const [profileRaw, siteRaw, skillsRaw, projectsRaw, expRaw, certRaw] = await Promise.all([
    reader.singletons.profile.read(),
    reader.singletons.site.read(),
    reader.singletons.skills.read(),
    reader.collections.projects.all(),
    reader.collections.experience.all(),
    reader.collections.certifications.all(),
  ])
  if (!profileRaw) throw new Error('Content error: content/profile.yaml is missing')
  if (!siteRaw) throw new Error('Content error: content/site.yaml is missing')
  if (!skillsRaw) throw new Error('Content error: content/skills.yaml is missing')

  const profile = parse(profileSchema, 'content/profile.yaml', profileRaw)
  const site = parse(siteSchema, 'content/site.yaml', siteRaw)
  const skills = parse(skillsSchema, 'content/skills.yaml', skillsRaw)

  const projects = projectsRaw
    .map(({ slug, entry }) => ({ ...parse(projectSchema, `content/projects/${slug}.yaml`, entry), slug }))
    .sort((a, b) => byOrder(a, b) || b.year - a.year)
  const slugs = new Set(projects.map((p) => p.slug))

  const experience = expRaw
    .map(({ slug, entry }) => ({ ...parse(experienceSchema, `content/experience/${slug}.yaml`, entry), slug }))
    .sort(byOrder)
  for (const job of experience) {
    for (const ref of job.projects) {
      if (!slugs.has(ref)) {
        throw new Error(`Content error. content/experience/${job.slug}.yaml -> projects: "${ref}" is not a project`)
      }
    }
  }

  const certifications = certRaw
    .map(({ slug, entry }) => ({ ...parse(certificationSchema, `content/certifications/${slug}.yaml`, entry), slug }))
    .sort((a, b) => byOrder(a, b) || b.date.localeCompare(a.date))

  return {
    profile,
    site,
    skills,
    projects,
    experience,
    certifications,
    testsTotal: testsTotal(projects),
    currentJob: currentJob(experience),
  }
}

export function getSiteData(): Promise<SiteData> {
  cache ??= load()
  return cache
}

export async function getProject(slug: string) {
  const { projects } = await getSiteData()
  return projects.find((p) => p.slug === slug)
}
