import { collection, config, fields, singleton } from '@keystatic/core'

/**
 * The admin form (`/admin` -> `/keystatic`). Content is stored as YAML in `content/`.
 * Dev: local files. Production: commits to GitHub (set KEYSTATIC_STORAGE=local to force local).
 */
const useGithub =
  process.env.KEYSTATIC_STORAGE === 'github' ||
  (process.env.NODE_ENV === 'production' && process.env.KEYSTATIC_STORAGE !== 'local')

const stringList = (label: string, description?: string, itemLabel = 'Item') =>
  fields.array(fields.text({ label: itemLabel, multiline: true }), {
    label,
    description,
    itemLabel: (p) => p.value || itemLabel,
  })

const IMG_HELP = 'Upload a WebP or JPG, 2,000px wide or less.'

export default config({
  storage: useGithub
    ? {
        kind: 'github',
        repo: {
          owner: process.env.NEXT_PUBLIC_GITHUB_OWNER ?? 'Dumb4Codes',
          name: process.env.NEXT_PUBLIC_GITHUB_REPO ?? 'portfolio',
        },
      }
    : { kind: 'local' },
  ui: {
    brand: { name: 'Youvraj · Portfolio' },
    navigation: {
      Site: ['profile', 'site', 'skills'],
      Work: ['projects', 'experience', 'certifications'],
    },
  },
  singletons: {
    profile: singleton({
      label: 'Profile',
      path: 'content/profile',
      format: { data: 'yaml' },
      schema: {
        name: fields.text({ label: 'Full name' }),
        shortName: fields.text({ label: 'Short name', description: 'Used in friendly places, e.g. "Youvraj".' }),
        role: fields.text({ label: 'Role', description: 'Shown under your name and in search results.' }),
        headline: fields.text({
          label: 'Headline',
          description: 'The big line on the home page. The word "runs" (or the last verb) is set in italic serif automatically.',
        }),
        subheadline: fields.text({ label: 'Subheadline', multiline: true }),
        availability: fields.object(
          {
            status: fields.select({
              label: 'Status',
              options: [
                { label: 'Open to work', value: 'open' },
                { label: 'Busy', value: 'busy' },
                { label: 'Closed', value: 'closed' },
              ],
              defaultValue: 'open',
            }),
            label: fields.text({ label: 'Label' }),
          },
          { label: 'Availability' },
        ),
        location: fields.text({ label: 'Location', description: 'City, state, country. No street address.' }),
        timezone: fields.text({ label: 'Time zone', description: 'IANA name, e.g. Asia/Kolkata. Drives the live clock.' }),
        email: fields.text({ label: 'Email' }),
        phone: fields.text({ label: 'Phone' }),
        socials: fields.object(
          {
            github: fields.url({ label: 'GitHub URL' }),
            linkedin: fields.url({ label: 'LinkedIn URL' }),
            leetcode: fields.url({ label: 'LeetCode URL' }),
            extra: fields.array(
              fields.object({
                label: fields.text({ label: 'Label' }),
                url: fields.url({ label: 'URL', validation: { isRequired: true } }),
              }),
              { label: 'Other links', itemLabel: (p) => p.fields.label.value || 'Link' },
            ),
          },
          { label: 'Links' },
        ),
        resume: fields.file({
          label: 'Résumé (PDF)',
          directory: 'public/resume',
          publicPath: '/resume/',
          description: 'Upload a new PDF here to replace the download everywhere.',
        }),
        photo: fields.image({
          label: 'Photo',
          directory: 'public/images/profile',
          publicPath: '/images/profile/',
          description: IMG_HELP,
        }),
        photoAlt: fields.text({ label: 'Photo description', description: 'For screen readers.' }),
        bio: fields.text({ label: 'Bio', multiline: true, description: 'Leave a blank line between paragraphs.' }),
        education: fields.object(
          {
            degree: fields.text({ label: 'Degree' }),
            school: fields.text({ label: 'School' }),
            years: fields.text({ label: 'Years' }),
          },
          { label: 'Education' },
        ),
      },
    }),

    site: singleton({
      label: 'Site settings',
      path: 'content/site',
      format: { data: 'yaml' },
      schema: {
        seoTitle: fields.text({ label: 'Page title (SEO)' }),
        seoDescription: fields.text({ label: 'Description (SEO)', multiline: true }),
        manifesto: fields.text({
          label: 'Big statement',
          multiline: true,
          description: 'Use {tests} where the total of automated checks (added up from your projects) should appear.',
        }),
        ogImage: fields.image({
          label: 'Share image (optional)',
          directory: 'public/images/site',
          publicPath: '/images/site/',
          description: 'Leave empty to use the generated one. 1200x630.',
        }),
        showPreloader: fields.checkbox({ label: 'Show the intro counter on first visit', defaultValue: true }),
        easterEgg: fields.checkbox({ label: 'Typing "hire" triggers the surprise', defaultValue: true }),
      },
    }),

    skills: singleton({
      label: 'Skills',
      path: 'content/skills',
      format: { data: 'yaml' },
      schema: {
        groups: fields.array(
          fields.object({
            name: fields.text({ label: 'Group name' }),
            items: fields.array(fields.text({ label: 'Skill' }), {
              label: 'Skills',
              itemLabel: (p) => p.value || 'Skill',
            }),
          }),
          { label: 'Groups', itemLabel: (p) => p.fields.name.value || 'Group' },
        ),
      },
    }),
  },

  collections: {
    projects: collection({
      label: 'Projects',
      path: 'content/projects/*',
      slugField: 'title',
      format: { data: 'yaml' },
      columns: ['kind', 'year', 'order'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        kind: fields.select({
          label: 'Kind',
          description: 'Internal = employer work: no links, no screenshots, shows a Confidential badge.',
          options: [
            { label: 'Personal', value: 'personal' },
            { label: 'Internal (confidential)', value: 'internal' },
          ],
          defaultValue: 'personal',
        }),
        company: fields.text({ label: 'Company', description: 'Optional. For internal work.' }),
        featured: fields.checkbox({
          label: 'Featured',
          description: 'Featured personal projects go in the big gallery; the rest go in the archive.',
          defaultValue: false,
        }),
        order: fields.integer({ label: 'Order', description: 'Smaller numbers come first.', defaultValue: 50, validation: { isRequired: true } }),
        year: fields.integer({ label: 'Year', validation: { isRequired: true } }),
        role: fields.text({ label: 'Your role' }),
        tagline: fields.text({ label: 'Tagline', description: 'One sentence.' }),
        summary: fields.text({ label: 'Summary', multiline: true }),
        problem: fields.text({ label: 'Problem', multiline: true }),
        approach: stringList('Approach', 'How it was designed. One point per item.', 'Point'),
        myWork: stringList('What I did', 'One point per item.', 'Point'),
        outcome: fields.text({ label: 'Outcome', multiline: true }),
        nextSteps: stringList('Next steps', 'What you would build next. Shown positively on the case study.', 'Step'),
        metrics: fields.array(
          fields.object({
            value: fields.text({ label: 'Value', description: 'e.g. 464, <400ms, ~30%, ₹0.00' }),
            label: fields.text({ label: 'Label' }),
          }),
          { label: 'Metrics', itemLabel: (p) => `${p.fields.value.value} ${p.fields.label.value}` },
        ),
        testsCount: fields.integer({ label: 'Automated checks', description: 'Optional. Adds to the big number on the home page.' }),
        stack: fields.array(fields.text({ label: 'Tech' }), { label: 'Stack', itemLabel: (p) => p.value || 'Tech' }),
        visual: fields.select({
          label: 'Illustration (internal only)',
          description: 'Which abstract animated diagram to show for internal work.',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Ledger', value: 'ledger' },
            { label: 'Payroll clock', value: 'payroll' },
            { label: 'Delivery route', value: 'route' },
          ],
          defaultValue: 'none',
        }),
        illustrativeExample: fields.text({ label: 'Illustrative example', multiline: true, description: 'Sample numbers only, never real data.' }),
        liveUrl: fields.url({ label: 'Live URL', description: 'Personal projects only. Ignored for internal.' }),
        repoUrl: fields.url({ label: 'Code URL', description: 'Personal projects only. Ignored for internal.' }),
        cover: fields.image({
          label: 'Cover image',
          directory: 'public/images/projects/{slug}',
          publicPath: '/images/projects/{slug}/',
          description: `${IMG_HELP} Leave empty to get a generated cover.`,
        }),
        gallery: fields.array(
          fields.object({
            src: fields.image({
              label: 'Image',
              directory: 'public/images/projects/{slug}',
              publicPath: '/images/projects/{slug}/',
              description: IMG_HELP,
              validation: { isRequired: true },
            }),
            alt: fields.text({ label: 'Describe the image', validation: { isRequired: true } }),
          }),
          { label: 'Gallery', itemLabel: (p) => p.fields.alt.value || 'Image' },
        ),
      },
    }),

    experience: collection({
      label: 'Experience',
      path: 'content/experience/*',
      slugField: 'company',
      format: { data: 'yaml' },
      columns: ['role', 'start', 'end'],
      schema: {
        company: fields.slug({ name: { label: 'Company' } }),
        companyNote: fields.text({ label: 'Company note', description: 'e.g. Multi-brand cloud kitchen' }),
        url: fields.url({ label: 'Company website' }),
        role: fields.text({ label: 'Role' }),
        location: fields.text({ label: 'Location' }),
        mode: fields.select({
          label: 'Mode',
          options: [
            { label: 'On-site', value: 'On-site' },
            { label: 'Remote', value: 'Remote' },
            { label: 'Hybrid', value: 'Hybrid' },
          ],
          defaultValue: 'On-site',
        }),
        start: fields.text({ label: 'Start (YYYY-MM)', validation: { isRequired: true } }),
        end: fields.text({ label: 'End (YYYY-MM)', description: 'Leave empty if you still work here. It then reads "Present".' }),
        order: fields.integer({ label: 'Order', description: '1 = top of the timeline and the status pill on the home page.', defaultValue: 1 }),
        summary: fields.text({ label: 'Summary', multiline: true }),
        highlights: stringList('Highlights', 'One achievement per item.', 'Highlight'),
        stack: fields.array(fields.text({ label: 'Tech' }), { label: 'Stack', itemLabel: (p) => p.value || 'Tech' }),
        projects: fields.array(fields.relationship({ label: 'Project', collection: 'projects' }), {
          label: 'Related projects',
          itemLabel: (p) => p.value ?? 'Project',
        }),
      },
    }),

    certifications: collection({
      label: 'Certifications',
      path: 'content/certifications/*',
      slugField: 'title',
      format: { data: 'yaml' },
      columns: ['issuer', 'date'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        issuer: fields.text({ label: 'Issuer' }),
        date: fields.date({ label: 'Date', validation: { isRequired: true } }),
        order: fields.integer({ label: 'Order', description: 'Smaller numbers come first.', defaultValue: 50 }),
        verifyUrl: fields.url({ label: 'Verification link' }),
        file: fields.file({ label: 'PDF', directory: 'public/certificates', publicPath: '/certificates/' }),
        image: fields.image({
          label: 'Certificate image',
          directory: 'public/certificates',
          publicPath: '/certificates/',
          description: IMG_HELP,
          validation: { isRequired: true },
        }),
      },
    }),
  },
})
