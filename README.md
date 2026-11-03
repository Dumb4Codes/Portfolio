# Youvraj Singh, portfolio

A personal portfolio for a full-stack developer in Bengaluru. One idea carries the whole site:

> **The same 40,000 particles become every chapter of my work.**

A single WebGL particle field sits behind the page and morphs, as you scroll, from the name **YOUVRAJ** into a stock ledger, a 24-hour payroll clock, a delivery route, a drifting field, and finally a pin on Bengaluru. Everything else is quiet, type-led HTML. The site works without JavaScript, respects reduced motion, and runs on Vercel's free plan.

- **Stack:** Next.js 16 (App Router, static), React 19, TypeScript strict, Tailwind CSS 4, plain three.js (GLSL shaders), GSAP + Lenis (lazy), Keystatic admin, zod, Vitest, Playwright.
- **Admin:** `/admin` (Keystatic). Add a project, edit a job, swap the résumé, with no code. Saves are commits to this repo; Vercel redeploys.
- **Free to run:** Vercel Hobby, Keystatic, Web3Forms. No database.

Docs: [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md) (deploy + admin, for Youvraj) · [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) (how it works) · [`docs/CONTENT.md`](docs/CONTENT.md) (content model + rules) · [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md) (decisions, deviations, QA results) · [`PLAN.md`](PLAN.md).

---

## Run it locally

Node 20+ and pnpm.

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Edit content in the browser at **http://localhost:3000/keystatic** (writes straight to the YAML files in `content/` and uploads into `public/`). Or edit the YAML by hand.

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server. Admin uses local files. |
| `pnpm dev:github` | Dev server with the admin in **GitHub mode**. Used once to create the GitHub App (see SETUP_GUIDE step 3). |
| `pnpm build` / `pnpm start` | Production build and server. Content is validated at build time. |
| `pnpm lint` / `pnpm typecheck` | ESLint (zero errors) and `tsc --noEmit`. |
| `pnpm test` | Vitest: shape generators, zod schemas, metric parser, stack aliases, manifesto total, scene director. |
| `pnpm test:e2e` | Playwright against the production build (see below). |

### Environment variables

Copy `.env.example` to `.env.local`. Real values live in Vercel (Settings → Environment Variables). Nothing secret is committed.

| Variable | Needed for |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, share images (include `https://`) |
| `NEXT_PUBLIC_GITHUB_OWNER`, `NEXT_PUBLIC_GITHUB_REPO` | Which repo the production admin commits to |
| `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Admin sign-in with GitHub (written by Keystatic, copied to Vercel) |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | Contact form. Empty = form hidden, the email button stays |
| `NEXT_PUBLIC_KEYSTATIC_STORAGE` | Optional override: `local` or `github` (build-time) |

The production build **passes without any of the admin secrets**; `/admin` then answers "not configured yet" until you add them.

## Editing content

Everything on the site comes from `content/`: profile, site settings, skills, projects, experience, certifications. Pages are generated from it at build time, and a broken entry fails the build with the file and field named.

- **New project** → Projects → Add. Pick *Personal* (links + screenshots) or *Internal* (no links, choose an illustration). It gets its own `/work/<slug>` page, an entry in the command palette, the sitemap, the stack highlighting and either the featured gallery or the archive. No code change. (`scripts/dummy-project-check.sh` proves this.)
- **Update a job** → Experience. Leave *End* empty for "Present". The hero status pill uses the first job (by *Order*) with no end date.
- **Replace the résumé** → Profile → Résumé.

Full field guide and the confidentiality rules for employer work: [`docs/CONTENT.md`](docs/CONTENT.md).

## Deploy

Short version (details in [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md)):

1. Push to GitHub. 2. Import into Vercel (Hobby). 3. Add the env vars. 4. Create the Keystatic GitHub App (`pnpm dev:github`, once). 5. Add the Web3Forms key.

## Tests and QA

```bash
pnpm build          # needs .env.local with the two test values below
pnpm test           # 86 unit tests
pnpm test:e2e       # 56 Playwright tests (desktop + mobile smoke)
```

For the e2e run, `.env.local` should contain `NEXT_PUBLIC_KEYSTATIC_STORAGE=local` (so `/keystatic` loads without GitHub) and `NEXT_PUBLIC_WEB3FORMS_KEY=any-dummy` (so the contact form renders; its requests are mocked).

The Playwright suite covers: every section renders, no console errors, JS-off rendering, all project pages return 200, 404 inside the site layout, command palette (Ctrl+K, `/`, Escape), theme toggle persistence, stack cross-highlighting, disclosures, certificate dialog, copy-to-clipboard, contact form validation + honeypot + success/failure, `/admin` → `/keystatic`, the editor loading a real entry, reduced motion (no canvas), WebGL mount, back/forward scroll restoration, anchor links, axe (WCAG 2.2 AA, both themes, 5 page types), no horizontal scroll at 10 widths from 320 to 2560, mobile menu focus trap, and the confidentiality rules for internal projects.

Helper scripts in `scripts/` (screenshots, Lighthouse, lint summary) are described in `docs/BUILD_LOG.md`.

## Project layout

```
content/                 YAML written by the admin (source of truth)
keystatic.config.ts      the admin form (schema)
public/                  images, certificates, résumé
src/content/             zod schemas, Keystatic reader, derived data (manifesto total, stack aliases...)
src/gl/                  particle engine, scene director, GLSL, shape generators, static SVG fallback
src/motion/              lazy motion engine (GSAP, ScrollTrigger, Lenis), driven by data attributes
src/components/          header, palette, cursor, preloader, page wipe, theme, toast...
src/sections/            home sections and the SKOPE chapter illustrations
src/app/                 routes: home, /work, /work/[slug], 404, admin, OG images, sitemap...
tests/                   Vitest (unit) and Playwright (e2e)
```

## Performance (production build, Lighthouse)

| Page | Mobile (4x CPU, slow 4G) | Desktop |
|---|---|---|
| Home | 94-97 typical (LCP 0.9-1.1 s, TBT 140-240 ms, CLS 0) | 99 (LCP 0.3 s, TBT ~0, CLS 0.001) |
| Case study | 94-99 | 100 |
| Accessibility / Best Practices / SEO | 100 / 100 / 100 on every page tested | |

Mobile numbers vary run to run on a busy laptop (a minority of runs score 70-85 because of main-thread contention); see `docs/BUILD_LOG.md` for the full set and what was done about it.
