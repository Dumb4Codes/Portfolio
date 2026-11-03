// One-off: converts the kit's seed YAML into Keystatic's on-disk shape (content/**).
// Applied edits: drop the slug key (filename is the slug), drop `reference`, turn "" / null
// into the empty values Keystatic expects, fill the "CLAUDE CODE:" notes from public READMEs.
import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'

const KIT = process.argv[2]
const OUT = process.argv[3]

const overrides = {
  pulse: {
    problem: 'One place for news, movie picks and social posts, shaped by what each reader chooses to follow.',
    approach: [
      'Readers pick categories and hashtags in Settings; the choices persist across reloads.',
      'News and movie data come through server routes, and every source falls back to seeded mock data, so the app runs with no API keys.',
      'Redux Toolkit and RTK Query manage feed state; the infinite feed interleaves the sources and cards can be dragged into your own order.',
      'A keyboard-driven command palette searches everything, with light and dark themes and three languages.',
      'New items stream in live over Server-Sent Events.',
    ],
    outcome: 'A working dashboard that a fresh clone can demo in about a minute, backed by unit and browser tests.',
    metrics: [
      { value: '3', label: 'languages: English, Hindi, Spanish' },
      { value: '7', label: 'content categories' },
    ],
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Redux Toolkit', 'RTK Query', 'Tailwind CSS 4', 'Framer Motion', 'react-i18next', 'Vitest', 'Playwright', 'MSW', 'Vercel'],
    nextSteps: [],
  },
  'smart-bookmark': {
    year: 2026,
    summary: 'A private bookmark manager. Sign in with Google, save links, and see changes sync in real time across tabs and devices, with each user seeing only their own bookmarks.',
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Google OAuth', 'Vercel'],
  },
  'finance-dashboard': {
    year: 2026,
    summary: 'A finance dashboard for income, expenses and spending patterns, with searchable and sortable transactions, CSV and JSON export, and an Admin / Viewer role switch.',
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn/ui', 'Recharts', 'Framer Motion'],
  },
  'visual-workflow-playground': {
    year: 2026,
    summary: 'FlowForge: drag, drop and connect nodes into a workflow, then validate and run it with animated feedback. A FastAPI backend checks the graph.',
    stack: ['React', 'React Flow', 'Zustand', 'Tailwind CSS', 'Python', 'FastAPI', 'Pydantic'],
  },
  'pipeline-builder': { year: 2026 },
  'typing-game': {
    year: 2026,
    summary: 'SpeedType: a distraction-free typing test with 30-second, 60-second and 5-minute modes, live WPM and accuracy, and five themes.',
    stack: ['React 19', 'TypeScript', 'Vite'],
  },
  'nectar-grocery': {
    year: 2026,
    summary: 'A grocery shopping app with a product grid, filters, a cart and a checkout sheet.',
    stack: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS 4', 'React Router', 'Zustand'],
  },
  instantly: {
    year: 2026,
    nextSteps: [
      'Add rate limiting to the login and register endpoints.',
      'Scope the S3 IAM policy down to the single bucket.',
      'Add a resize and format pipeline for uploaded product images.',
      'Wire the integration tests into CI.',
    ],
  },
  carrental: {
    nextSteps: [
      'Verify tokens with jwt.verify instead of jwt.decode.',
      'Add a payment gateway at booking time.',
      'Let owners edit a car after listing it, and let renters cancel pending bookings.',
      'Push real-time availability updates to anyone viewing a car.',
    ],
  },
  quickstay: {
    nextSteps: [
      "Verify Clerk tokens with jwt.verify against Clerk's public keys instead of jwt.decode.",
      'Replace the fixed wait after Stripe checkout with polling for booking status.',
      'Pass check-in and check-out dates into search, and count only paid bookings in revenue.',
      'Real star ratings from guests, and room editing for owners.',
    ],
  },
}

const URL_KEYS = ['liveUrl', 'repoUrl', 'url', 'verifyUrl']
const OPT_KEYS = ['cover', 'file', 'image', ...URL_KEYS, 'problem', 'outcome', 'illustrativeExample', 'testsCount']

function clean(o) {
  for (const k of Object.keys(o)) {
    if (o[k] === '' && OPT_KEYS.includes(k)) delete o[k]
    if (o[k] === '' && k === 'problem') delete o[k]
  }
  return o
}

function dump(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, YAML.stringify(data, { lineWidth: 100 }))
}

for (const f of fs.readdirSync(path.join(KIT, 'projects'))) {
  const slug = f.replace('.yaml', '')
  const d = YAML.parse(fs.readFileSync(path.join(KIT, 'projects', f), 'utf8'))
  delete d.slug
  delete d.reference
  Object.assign(d, overrides[slug] ?? {})
  if (!d.summary) delete d.summary
  if (d.kind === 'internal') { delete d.liveUrl; delete d.repoUrl; delete d.cover; d.gallery = [] }
  d.nextSteps ??= []
  d.approach ??= []; d.myWork ??= []; d.metrics ??= []; d.stack ??= []; d.gallery ??= []
  dump(path.join(OUT, 'projects', f), clean(d))
}
for (const f of fs.readdirSync(path.join(KIT, 'experience'))) {
  const d = YAML.parse(fs.readFileSync(path.join(KIT, 'experience', f), 'utf8'))
  d.end = d.end ?? ''
  if (f.startsWith('hasvik')) d.end = '2026-10' // per the latest résumé (Jun 2026 – Oct 2026)
  dump(path.join(OUT, 'experience', f), clean(d))
}
for (const f of fs.readdirSync(path.join(KIT, 'certifications'))) {
  const d = YAML.parse(fs.readFileSync(path.join(KIT, 'certifications', f), 'utf8'))
  dump(path.join(OUT, 'certifications', f), clean(d))
}
for (const f of ['profile.yaml', 'skills.yaml', 'site.yaml']) {
  const d = YAML.parse(fs.readFileSync(path.join(KIT, f), 'utf8'))
  dump(path.join(OUT, f), d)
}
