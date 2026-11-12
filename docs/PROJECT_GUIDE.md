# Project guide: everything about this portfolio

**Last updated:** 2026-11-03 · **Owner:** Youvraj Singh (GitHub `Dumb4Codes`)

> **How to use this file.** Paste or attach it to any AI assistant (Claude, ChatGPT, Gemini, Cursor...) and ask your question. It is written to be self-contained: it explains what the project is, how it works, how the admin works, where everything is hosted, what can break, and how to fix it. For the code itself, also give the AI the file(s) the question is about.
>
> **This repo is public, so this file is public.** It contains no passwords, keys or secret values, only the *names* of settings. Never add real secret values here.

---

## 1. What this is, in one minute

A personal portfolio website for Youvraj Singh, a full-stack developer in Bengaluru, India.

- **Live site:** https://youvraj-singh.vercel.app
- **Code:** https://github.com/Dumb4Codes/Portfolio (branch `main`)
- **Admin (edit content in a browser):** https://youvraj-singh.vercel.app/admin
- **Cost:** free (Vercel Hobby, GitHub, Web3Forms free tier, Keystatic open source). No database.

**The one idea.** A single WebGL particle field (about 40,000 dots) sits behind the whole page. As you scroll, the dots morph, and scrolling back reverses it: the name **YOUVRAJ**, then a network of connected parts behind the work grid, a drifting field, and finally a pin on Bengaluru. Each internal case study has its own shape (a stock ledger, a 24-hour payroll clock, a delivery route). On the first visit, four small labelled cursors fly in and "assemble" the hero in about a second. Everything else is calm, typographic HTML. It works with JavaScript off, respects "reduced motion", and falls back to a static SVG when WebGL is unavailable.

**What is on the site (since the 2026-11-12 redesign):** hero with calls to action (See the work, Résumé, Email), a range line with numbers, one "Selected work" grid that mixes internal employer projects (illustrated covers, no screenshots) with personal builds (screenshots, Live and Code links), an archive, experience timeline, stack (with cross-highlighting), certificate deck, about, contact form; plus a case-study page for each of the 13 projects (`/work/<slug>`), a `/work` index with filters, a styled 404, a Ctrl+K command palette, a light/dark theme with a circular transition, share images (Open Graph), a sitemap and structured data for search engines.

---

## 2. The big picture: how everything fits together

```
 You edit content                                   Visitors
 ───────────────                                    ────────
 /admin (Keystatic)  ──save──►  GitHub repo (main)  ──push──►  Vercel builds the site
 or edit YAML files             content/*.yaml                 (static pages)
 on your computer                                                    │
                                                                     ▼
                                                  https://youvraj-singh.vercel.app
                                                                     │
                                             contact form ──► Web3Forms ──► email to you
```

1. **Content is data.** All text, projects, jobs, skills, certificates and settings live as small YAML files in `content/`. No content is written inside React components.
2. **The admin writes those files.** Keystatic is a form-based editor. In production, pressing Save makes a **commit on GitHub** to `main`.
3. **GitHub notifies Vercel**, which rebuilds the site (about a minute) and publishes it.
4. **The build validates everything.** If a required field is missing or wrong, the build fails and **Vercel keeps the previous version live**. The error names the file and field.
5. **The site is static.** Pages are generated at build time. There is no server code running for visitors, except the admin and its API.

---

## 3. Accounts, services and where things live

| Thing | Where | Notes |
|---|---|---|
| Code + content | GitHub `Dumb4Codes/Portfolio`, branch `main` | Public repo. Default branch is `main`. An older `master` branch holds the previous (React + Vite) portfolio and may still exist. |
| Hosting | Vercel, team "Youvraj Singh's projects" (Hobby plan), project `youvraj-singh` | Auto-deploys on every push to `main`. |
| Production URL | `youvraj-singh.vercel.app` | The older `portfolio-one-inky-…vercel.app` address permanently redirects (308) here. |
| Admin sign-in | GitHub App **Dumb4Codes Keystatic** (slug `dumb4codes-keystatic`), installed on `Portfolio` only | Manage at github.com/settings/apps. |
| Contact form | Web3Forms, form "Portfolio contact" | Messages are emailed to the owner's address. The access key is public by design. |
| Analytics | Vercel Analytics + Speed Insights | Only active on Vercel. |
| Domain | Free `.vercel.app` name | A custom domain can be added under Vercel → Domains. If added, update `NEXT_PUBLIC_SITE_URL` and the GitHub App callback URL. |

---

## 4. Technology (and why)

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, static generation), **React 19**, **TypeScript** (strict) |
| Styling | **Tailwind CSS 4** + design tokens as CSS variables (`src/app/globals.css`), plus `src/styles/` (chrome, home, pages) |
| Particles | **three.js** (plain, no React wrapper) with custom GLSL shaders. Lazy-loaded chunk (~130 KB gzip). |
| Scroll/animation | **GSAP + ScrollTrigger + Lenis**, wrapped in one lazy "motion engine" driven by `data-*` attributes |
| Admin | **Keystatic** (`@keystatic/core`, `@keystatic/next`), GitHub storage in production |
| Validation | **zod** (build fails with file + field on bad content) |
| Tests | **Vitest** (unit), **Playwright** (end-to-end, accessibility with axe) |
| Fonts | Archivo (variable width axis), JetBrains Mono, Instrument Serif |
| Package manager | **pnpm** (Node 20+) |

Notable decisions (details in `docs/BUILD_LOG.md`): plain three.js instead of React Three Fiber (smaller bundle); GSAP kept out of React hydration; plain `<a>` links and plain `<img>` instead of `next/link`/`next/image` client components (far less JavaScript on phones); the hero entrance is pure CSS so the headline never waits for JavaScript.

---

## 5. Repository map

```
content/                  THE DATA (YAML). Written by the admin. Source of truth.
  profile.yaml            name, headline, bio, links, résumé path, photo, contact
  site.yaml               SEO title/description, the big statement, contact headline, toggles
  skills.yaml             skill groups (drive the stack section and ticker)
  projects/*.yaml         13 projects (3 internal "SKOPE" + 10 personal)
  experience/*.yaml       jobs (2)
  certifications/*.yaml   certificates (7)
keystatic.config.ts       THE ADMIN FORM: which fields exist, labels, validation hints
public/                   images, certificate files, the résumé PDF (public/resume/)
src/
  app/                    routes: home, /work, /work/[slug], 404, admin (/keystatic), OG images,
                          sitemap, robots, manifest, icons
  content/                reader.ts (loads YAML), schema.ts (zod rules), derive.ts (computed values)
  sections/               the home-page sections + the three SKOPE illustrations (sections/visuals)
  components/             header, command palette, cursor, preloader, theme toggle, etc.
  gl/                     particle engine, scene director, shaders, shape generators, SVG fallback
  motion/                 the lazy motion engine (GSAP/Lenis)
  lib/                    small helpers (obfuscation of phone number, tweening, site constants)
  styles/                 CSS: chrome.css (header/footer/overlays), home.css, pages.css (case studies)
  app/globals.css         design tokens (colours, type, spacing) and base styles
tests/unit, tests/e2e     Vitest and Playwright tests
scripts/                  helper scripts (screenshots, Lighthouse, add-a-project check)
docs/                     ARCHITECTURE, CONTENT, SETUP_GUIDE, BUILD_LOG, this file
next.config.ts            Next config (admin redirect, security headers, dev origin for admin)
.env.example              the list of environment variable NAMES (no values)
```

Deeper reading: `docs/ARCHITECTURE.md` (rendering model, particle system, motion engine, performance and accessibility decisions), `docs/CONTENT.md` (every content field and the confidentiality rules), `docs/SETUP_GUIDE.md` (deploy + admin set-up), `docs/BUILD_LOG.md` (decisions, deviations, QA results).

---

## 6. The admin, in depth

### What it is
Keystatic is a content editor that runs **inside the site** at `/admin` (which redirects to `/keystatic`). It shows forms generated from `keystatic.config.ts` (Profile, Site settings, Skills, Projects, Experience, Certifications). It is just a friendly way to edit the YAML files in `content/` and upload images into `public/`.

### How saving works
- **Production (live site):** storage kind is `github`. You sign in with GitHub (via the GitHub App). Clicking Save creates a **commit on `main`** in `Dumb4Codes/Portfolio`. Vercel sees the push and redeploys. The change is live in about a minute.
- **Local development:** storage kind is `local`. Edits write straight to files on your computer. You must `git commit` and `git push` yourself.
- The mode is decided in `keystatic.config.ts`: `github` when `NODE_ENV=production`, or when `NEXT_PUBLIC_KEYSTATIC_STORAGE=github`; `local` otherwise or when set to `local`.

### Who can use it
Only people who can sign in with GitHub **and** have write access to the repo. In practice, only the owner. `/admin` and `/keystatic` are `noindex` and blocked in `robots.txt`.

### How crucial is it?
**Convenient, not essential.** The site runs fine without it.
- If the admin is broken or not configured, the public site is unaffected. `/admin` just shows an error or "not configured".
- You can always edit the YAML files in `content/` by hand (or ask an AI to), commit, and push. The admin does exactly that, with a form on top.
- Everything the admin offers that you cannot do by hand: image upload with a form, field hints, and the safety of required fields.

### The pieces the production admin needs
1. The **GitHub App** (Dumb4Codes Keystatic), installed on `Portfolio`, with callback URLs for local (`http://127.0.0.1:3000/api/keystatic/github/oauth/callback`) and live (`https://youvraj-singh.vercel.app/api/keystatic/github/oauth/callback`). If the site URL ever changes, add the new callback in the app's settings.
2. Four **Vercel environment variables** (names below). Without the secrets, the build still passes and `/admin` says "not configured yet".
3. The **API route** `src/app/api/keystatic/[...params]/route.ts` (already in the code).

### How the GitHub App was created (one-time)
`pnpm dev:github`, then open `http://127.0.0.1:3000/keystatic`, click Log in with GitHub, which leads to `/keystatic/setup` and "Create GitHub App". GitHub registers the app and Keystatic writes the generated values into the local `.env`, which were then copied to Vercel. (Locally the page must be opened on `127.0.0.1`, not `localhost`: Keystatic redirects there, and `next.config.ts` has `allowedDevOrigins: ['127.0.0.1']` so the dev page does not render blank.)

---

## 7. Environment variables (names and meaning only)

Set real values in **Vercel → project → Settings → Environment Variables**. For local work, copy `.env.example` to `.env.local`. Never commit `.env` or `.env.local` (they are git-ignored). `NEXT_PUBLIC_*` values are baked in at **build time**, so after changing one you must **redeploy**.

| Variable | Purpose | If missing |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical address (include `https://`, no trailing slash). Used by sitemap, robots, share images, structured data. Currently `https://youvraj-singh.vercel.app`. | Links in sitemap/OG point to the wrong place. |
| `NEXT_PUBLIC_GITHUB_OWNER`, `NEXT_PUBLIC_GITHUB_REPO` | Repo the production admin commits to: `Dumb4Codes` / `Portfolio` (match the name exactly). | Admin falls back to defaults in `keystatic.config.ts`. |
| `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET` | The GitHub App's OAuth identity. Client secret is a **secret**. | Admin login unavailable. |
| `KEYSTATIC_SECRET` | Encrypts the admin login cookie. A **secret**. Any long random string. | Admin login unavailable. |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | The app's public name (`dumb4codes-keystatic`). | Install link breaks. |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | Contact form key (public by design). | Form is hidden; the email button stays. |
| `NEXT_PUBLIC_KEYSTATIC_STORAGE` | Optional: force `local` or `github`. | Dev = local, production = github. |

**Secret hygiene.** In Vercel, mark the client secret and `KEYSTATIC_SECRET` as type **Secret** (hidden after saving). Do not paste secret values into chats, screenshots, commits or this file. If one leaks, rotate it: for the GitHub client secret, generate a new one in the GitHub App settings and delete the old one; for `KEYSTATIC_SECRET`, generate a new random string. Update both `.env` and Vercel, then redeploy.

---

## 8. Everyday tasks

| I want to… | How |
|---|---|
| Change text, headline, bio, links | `/admin` → Profile (or Site settings) → edit → Save. |
| Add a project | `/admin` → Projects → Add. *Personal* = links + screenshots. *Internal* = employer work: no links or screenshots, shows a "Confidential" badge, pick an illustration. No code needed: the page, sitemap entry, search palette entry and stack counts are generated. |
| Update a job | `/admin` → Experience. Leave *End* empty for "Present". The first job (by *Order*) with no end date feeds the status pill in the header. |
| Add a certificate | `/admin` → Certifications → Add; upload the image (and PDF) and the verify link. |
| Replace the résumé | `/admin` → Profile → Résumé → upload the PDF. (Or replace `public/resume/youvraj-singh-resume.pdf` and push.) |
| Change the big statement under the hero | `/admin` → Site settings → "Big statement". It currently says **"1,300+ automated tests"** as plain typed text. The first number in the sentence is highlighted. Write `{tests}` instead to insert the computed total from all projects' `testsCount` (currently 934). |
| See changes locally first | `pnpm dev`, open `http://localhost:3000`, edit via `http://localhost:3000/keystatic`. |

**After using the admin on the live site**, GitHub's `main` has new commits that your computer does not. Before working locally, run `git pull`.

---

## 9. Running it on your computer

Prerequisites: Node 20+ and pnpm.

```bash
pnpm install
pnpm dev            # http://localhost:3000  (admin edits local files)
pnpm dev:github     # dev server with the admin in GitHub mode (open http://127.0.0.1:3000/keystatic)
pnpm build          # production build; validates all content
pnpm start          # serve the production build
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm test           # unit tests (Vitest)
pnpm test:e2e       # Playwright end-to-end tests (needs a production build)
```

For the e2e tests, `.env.local` needs `NEXT_PUBLIC_KEYSTATIC_STORAGE=local` and `NEXT_PUBLIC_WEB3FORMS_KEY=any-dummy`. Playwright starts `next start` itself, so run `pnpm build` first.

**Test status.** At hand-over: build passes, lint clean, `tsc` clean, 86 unit tests and 56 Playwright tests passed. After that, the homepage statement was changed to a typed "1,300+" and `tests/e2e/smoke.spec.ts` was updated to expect it; unit tests were re-run and pass, the e2e suite has **not** been re-run since. Run `pnpm build && pnpm test:e2e` to confirm.

---

## 10. Deploying and rolling back

- **Deploy** = push to `main`. Vercel builds automatically.
- **Check status:** Vercel → project → Deployments. Top entry should say **Ready**.
- **Roll back:** Deployments → pick an older Ready deployment → `⋯` → **Promote to Production** (or revert the commit in Git).
- **Build failed after an admin save:** the previous version stays live. Open the failed deployment's log; it names the content file and field (zod error). Fix it in the admin (or the YAML), save again.
- **Changed an environment variable:** it only takes effect after a **Redeploy**.

---

## 11. Rules about content

- **Internal (SKOPE) projects are employer work.** The schema strips `liveUrl`, `repoUrl`, `cover` and `gallery` from them even if typed. Public text may describe what the system does, how it is designed, what Youvraj did and the outcomes, exactly as in the content files. Never add links to the apps, staging addresses, repo names, real screenshots, security weaknesses, credentials, staff or customer data, costs, or anything not already written. See `docs/CONTENT.md`.
- **Illustrations use invented sample figures** and are labelled "Illustrative · sample data". Item codes such as `RM-101` / `SF-210` in the ledger illustration are generic placeholders.
- **No invented facts.** Do not add metrics, clients, awards or dates that are not true.
- **Personal data.** Email and phone are approved for display; the phone number is assembled in the browser, not plain text in the HTML. No home address.

---

## 12. Quality, performance, accessibility (summary)

- **Accessibility:** zero axe violations (WCAG 2.2 AA) on tested pages in both themes; keyboard and screen-reader friendly; reduced-motion honoured; works with JavaScript disabled.
- **Responsive:** no horizontal scroll from 320 px to 2560 px.
- **Lighthouse (production build, local):** desktop 99-100; mobile typically 90-97 but varies 86-99 run to run (main-thread contention); Accessibility, Best Practices, SEO 100. Mobile Total Blocking Time ranged 140-470 ms against a 200 ms target. Initial JavaScript is about 172-195 KB gzip; the GL chunk is about 130 KB.
- Full numbers and the work done: `docs/BUILD_LOG.md`.

---

## 13. Known limitations and open items

1. **Test count mismatch.** The homepage says "1,300+ automated tests" (matches the résumé), but the per-project counts in the case studies sum to **934** (471 + 191 + 272). The remaining counts have not been entered. When the real per-app totals are known, update each project's "Automated checks" field and then replace the typed statement with `{tests}` so the number stays computed.
2. **Pipeline Builder** has no README, so it shows only its tagline (`stack: []`). Fill it in through the admin.
3. **HASVIK dates:** set to Jun 2026 – Oct 2026 per the résumé (not "Present"). Edit in the admin if wrong.
4. **Not tested:** Safari, Firefox, Web3Forms edge cases beyond one real test message, the live admin beyond signing in and viewing the dashboard (saving an edit end to end has not been exercised).
5. **GitHub repo cosmetics:** one topic may have a typo (`tyepscript`) and the profile bio may be outdated; both are edited on GitHub, not in the code.
6. **Old history:** GitHub shows old failed "Production" deployments from the previous project in the repo's Deployments panel. They are stale and harmless.
7. **Résumé PDF** may carry an older portfolio link; check where the "Portfolio" link in the PDF points.
8. **Mobile performance** varies (see above). A cold image cache can make the first request after a deploy slower.

---

## 14. Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| Site shows old content after an admin save | Vercel is still building (check Deployments) or the build failed (read the log; previous version stays live). |
| Deployment failed | Open its log. A zod error names the content file and field. Fix and save again. |
| `/admin` says "not configured" | Missing `KEYSTATIC_*` variables in Vercel, or no redeploy after adding them. |
| Admin login errors | Callback URL missing in the GitHub App settings; app not installed on `Portfolio`; wrong `NEXT_PUBLIC_GITHUB_REPO` casing. |
| Admin page blank on localhost in GitHub mode | Use `http://127.0.0.1:3000/keystatic` (not `localhost`); `next.config.ts` must contain `allowedDevOrigins: ['127.0.0.1']`; restart the dev server after config changes. |
| Terminal says `run: command not found` | Type the command only (`pnpm dev:github`), not the word "run". |
| Contact form missing or not sending | `NEXT_PUBLIC_WEB3FORMS_KEY` missing (form hides) or not redeployed; check spam folder; check the Web3Forms dashboard. |
| Sitemap/share links show the wrong domain | `NEXT_PUBLIC_SITE_URL` wrong or no redeploy. |
| `git push` rejected | The admin committed to GitHub; run `git pull` first. |
| Variable shows "Needs Attention" in Vercel | It looks sensitive but is stored as plain; edit it and set type **Secret**. Warning only. |
| `.env` values visible in an editor tab/screenshot | Treat as exposed if shared; rotate (section 7). |

---

## 15. Glossary

- **Keystatic:** the open-source admin/editor used here.
- **GitHub App:** a registered GitHub integration that lets the admin sign you in and commit to the repo.
- **Vercel:** hosting platform; builds and serves the site; "Hobby" is the free plan.
- **Static generation:** pages are built once ahead of time; no server work per visit.
- **Zod:** library that validates content shape; fails the build on errors.
- **Scene director:** code that turns scroll position into a single number that decides which particle shape to show and how far along the morph is.
- **Motion engine:** one lazy module that attaches scrolling, pinning and entrance animations to the HTML via `data-*` attributes.
- **Internal / personal project:** content categories; internal = employer work with strict confidentiality rules.
- **HMR:** hot module reload in the dev server; the dev-origin setting affects it.
- **Redeploy:** rebuild with current settings; required after changing environment variables.

---

## 16. Prompt templates for AI assistants

Paste this file first, then one of:

- *"Using this guide, explain how to <task>."*
- *"Here is the error from Vercel's build log: <paste>. Using this guide, what is wrong and how do I fix it?"* (Redact secrets first.)
- *"I want to change <thing>. Which files in this repo control it? Show me the exact edits."* (Also attach those files.)
- *"Review this guide against the repo and tell me what is out of date."*

When asking an AI to change code, give it these constraints from this guide: keep internal projects confidential; do not invent facts or metrics; do not commit `.env` files; run `pnpm lint`, `pnpm typecheck`, `pnpm build` and `pnpm test` afterwards.

---

## 17. Keeping this guide current

Update this file when you change: hosting or accounts, environment variables, the admin set-up, the content rules, or the open items in section 13. Bump the "Last updated" date at the top. If it drifts from the repo, the repo wins.
