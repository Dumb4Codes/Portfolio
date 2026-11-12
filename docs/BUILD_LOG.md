# Build log

Built autonomously on 2026-11-03 from the brief in the kit (`PROMPT.md`, `DESIGN_BRIEF.md`, `CMS_SPEC.md`, `CONTENT_RULES.md`, `QUALITY_GATES.md`). This file records what was done, what changed from the brief and why, and the measured results.

## Phases (one commit each)

| # | Phase | Result |
|---|---|---|
| 1 | Foundation | Tokens, fonts, layout, Keystatic schema, seeded content, zod reader. Site complete and readable before any WebGL. |
| 2 | Particles | Six shape generators, scene director, shaders, SVG fallback. |
| 3 | Sections | Hero, manifesto, three pinned SKOPE chapters with illustrations, builds gallery, archive, experience, stack, certificates, about, contact. |
| 4 | Pages | Case studies (illustration or cover, lightbox gallery, next-project ring), `/work` index, 404. |
| 5 | Chrome | Command palette, circular theme transition, preloader, page wipe, OG images, sitemap/robots/manifest/icons, JSON-LD. |
| 6 | QA | Lint, 86 unit + 56 e2e tests, axe, responsive matrix, Lighthouse, three screenshot critique passes, a performance re-architecture (below). |

## Skills used

`superpowers:brainstorming` was invoked first; the user had asked for autonomous work, so its question flow was skipped (the skill allows opting out) and the design in the kit was taken as the spec. `ui-ux-pro-max` supplied the checklist used for accessibility, touch targets, contrast and motion rules. `superpowers:verification-before-completion` was used before the final report: every claim in the report was backed by a command run in the final state.

## Deviations from the brief (and why)

1. **Project location.** The kit sat in `d:\_kit` with unrelated folders next to it. The app is in `d:\portfolio` instead of being scaffolded into the drive root. `_kit/` is still in `.gitignore`.
2. **No `@react-three/fiber` / drei.** The GL chunk was 240 KB gzip with R3F (limit 220 KB). Plain three.js is 130 KB and removes a React reconciler from the hot path. Same shaders, same behaviour.
3. **No `@gsap/react`, no SplitText.** All scroll/animation code moved into one lazy, attribute-driven motion engine (see ARCHITECTURE §4) to keep GSAP out of the initial JavaScript and out of React hydration. The hero entrance is CSS, so the headline never waits for JavaScript. The "SplitText lines under masks" reveal from the brief is therefore not used; entrances are `rise`, `clip`, `rule` and the width-axis expansion (`wdth`). `Flip` was not needed.
4. **Hover distortion on build cards** uses the brief's allowed fallback: a clip-path/scale reveal plus a cursor-following highlight, not a WebGL displacement.
5. **The hero name no longer "breathes" with scroll velocity** (it would reflow the text and fight the particle alignment). Scroll velocity shears the particle word instead.
6. **Case-study titles and covers** animate with CSS only (opacity + lift), not the width-axis expansion, because they are the LCP element and an expanding heading would move content. The width axis is used for the manifesto and section headings, with their height locked while they animate.
7. **"Off-screen" fact in About** is omitted: there is no content for it and inventing one is not allowed. "Elsewhere" (links) is shown instead.
8. **Extra schema fields**: `nextSteps` on projects (positive "next steps" from the reference notes), `contactHeadline` on site settings.
9. **HASVIK dates.** `CONTENT_RULES` says HASVIK is "Present". The résumé Youvraj attached for this build says **Jun 2026 – Oct 2026**, so HASVIK ends 2026-10 and the bio says "after a software development internship with HASVIK". Editable in the admin if that is wrong.
10. **`NEXT_PUBLIC_KEYSTATIC_STORAGE`** (not in the brief) forces local/github storage. It has to be `NEXT_PUBLIC_` so the browser and the API route agree.
11. **Admin before secrets.** The Keystatic API route only creates its handler when the three GitHub secrets exist (or in dev), so a first deploy builds before the admin is set up.

## Content: what was verified, and what could not be

- READMEs / `package.json` read from GitHub for Pulse, Smart Bookmark, Finance Dashboard, Visual Workflow Playground (FlowForge), Typing Game (SpeedType) and Nectar Grocery. Copy and stacks come only from those. Pulse's case study uses the README's feature list; no metrics were invented.
- **Pipeline Builder** has no README and an unreadable stack, so it keeps the tagline only (`stack: []`). Worth filling in through the admin.
- Years come from repo creation / first-commit dates (Instantly 2026, CarRental 2025, QuickStay 2025, the rest 2026).
- "Next steps" on Instantly, CarRental and QuickStay come from the "future improvements" sections of Youvraj's own notes, phrased as next steps. The notes themselves are not in the repo.
- **Résumé PDF:** replaced on 2026-11-03 with the latest résumé from Youvraj (`public/resume/youvraj-singh-resume.pdf`).
- The three SKOPE chapter illustrations use invented sample figures (clearly labelled "Illustrative · sample data"): ledger quantities, a payroll figure of ₹31,250.00, a tracking ID `MDB-4K7Q2X`. None are real data.

## QA results

### Automated

| Check | Result |
|---|---|
| `pnpm build` | passes, zero type errors |
| ESLint (`next/core-web-vitals` + TypeScript, React 19 compiler rules) | 0 errors, 0 warnings |
| Vitest | 86 tests passing (shape counts and bounds at 3 viewports, text sampling, zod schemas and the internal-project strip, seed content validity, metric parser, stack aliases, manifesto total = 934, scene director scrubbing/reversibility, override) |
| Playwright | 56 tests passing (desktop + mobile smoke) |
| axe (WCAG 2.2 AA + best practice) | 0 violations on home, personal case study, internal case study, 404, `/work`, both themes, and with the command palette open |
| Horizontal scroll | none at 320, 360, 390, 414, 768, 1024, 1280, 1440, 1920, 2560 on 5 page types |
| JS disabled | all content in the HTML; links work |
| Reduced motion | no canvas, static SVG scene, nothing left hidden |
| Console | no errors or warnings. One Chrome GPU driver message ("GPU stall due to ReadPixels") is printed once per browser process by headless Chrome on Intel/D3D11 on the first WebGL context; the tests ignore only that message. |
| Add-a-project check | `scripts/dummy-project-check.sh`: a new YAML file produced its `/work/<slug>` page, sitemap entry, archive row, `/work` row, palette entry and stack counts with no code change; removing it returned 404. |
| Confidentiality | Playwright confirms internal pages have no external links, no images, no repo/Vercel/Render/Supabase addresses, carry the badge, and every illustration carries the label |

### Lighthouse (production build, localhost, Lighthouse 13, mobile = Moto G Power class emulation with 4x CPU and slow 4G)

| Page | Mobile perf | Mobile LCP / TBT / CLS | Desktop perf | Desktop LCP / TBT / CLS |
|---|---|---|---|---|
| Home | 86-97, median ~91 (10 runs) | 0.9-1.1 s / 140-470 ms / 0 | 99 | 0.3 s / 0-30 ms / 0.001 |
| Case study (internal) | 89-99 | 0.8 s / 150-400 ms / 0 | 100 | 0.2 s / 10 ms / 0 |
| Case study (personal, with gallery) | 93-95 warm; first request after a build 56-72 | 0.8 s / 270-310 ms / 0 | 99-100 | 0.7 s / 10-40 ms / 0 |
| `/work` | 96-97 | 0.8 s / 210-230 ms / 0 | 100 | 0.2 s / 0 / 0 |
| Accessibility / Best Practices / SEO | 100 / 100 / 100 on every page measured | | | |

Gates: desktop ≥ 98 met; mobile ≥ 90 met on most runs, not all; LCP gates met everywhere warm; CLS gates met; TBT < 200 ms (mobile) met on the best runs and missed on others (140-470 ms); desktop TBT < 100 ms met. Bundle sizes (gzip): GL chunk 130 KB (limit 220 KB, met); initial JavaScript excluding GL and the lazy motion chunk is about 195 KB, slightly over the 180 KB target (React + Next router + the interactive islands).

Why mobile varies: it is the main thread. Hydrating a content-rich page under 4x CPU slowdown plus the one-off GL start-up is the cost. Single runs on this laptop vary by 10-20 points with background load (the same build scored 65-97). The first request after a build is also slower because the image optimiser cache is cold; on Vercel the CDN caches optimised images after the first hit.

### Performance work that mattered (in order of impact)

1. Moved GSAP/ScrollTrigger/Lenis out of React into a lazy motion engine (TBT 2.4 s → 1.2 s).
2. Replaced R3F with plain three.js (GL chunk 240 KB → 130 KB).
3. Replaced `next/link` with plain `<a>` + prefetch on intent (about 60 fewer client components; the single biggest hydration saving).
4. Replaced `next/image`'s client component with `getImageProps` rendered as `<img>` (12+ fewer client components, better LCP on pages with galleries).
5. Switched entrances and counters from one ScrollTrigger each to one IntersectionObserver (no layout reads at start-up).
6. Tried per-section Suspense hydration (mobile 95+): reverted, because React streams those boundaries as hidden blocks that need JavaScript, which broke the JS-off requirement.

### Screenshot critique passes

Playwright screenshots at 390×844, 768×1024, 1440×900 and 1920×1080, dark and light, were opened and reviewed after each phase. Three full passes at the end:

- **Pass 1** found: the particle field far too bright behind body text (added a per-shape brightness gain, field at 24%), SKOPE chapter titles breaking mid-word, the ledger overlay rows collapsing, the clock hand and labels colliding with the net-pay text, the route nodes blown out to white, certificate captions overlapping, the case-study summary squeezed into a narrow column, the mobile hero name too small (then stacked `YOU / VRAJ`; later reverted to one line, because a name split across two lines does not read as one word on a phone, and the stacked particles were centred per line while the HTML was left-aligned).
- **Pass 2** (light theme, 768, 1920) found: the HTML word and the particle word misaligned (text now measured with a Range and sampled with the same letter-spacing), the clock SVG margin shifting the overlay off the particles, the maroon accent in light mode, tablet chapters using the desktop shape box while the DOM was stacked (new `STACK_BREAKPOINT`), hero overflow at 320 and 2560 px.
- **Pass 3** (404, `/work`, standalone illustrations) found: the scattered 404 dust too bright over the heading (dimmed while scattered), `/work` titles wrapping to three lines (type size and columns adjusted).

## Known limitations

- Lighthouse mobile on this machine is noisy; expect scores anywhere from the high 80s to the mid 90s on a normal run.
- `lenis` smooth scroll is off for reduced motion, as required, so anchors and the back-to-top use native scrolling there.
- The Keystatic admin was tested end to end in local mode (it loads, lists collections and opens a real entry). GitHub-mode sign-in needs a real GitHub App and cannot be tested without Youvraj's GitHub account; `pnpm dev:github` was checked to start and serve the setup flow.
- Web3Forms was tested with mocked requests only (no real key).
- Safari/iOS and Firefox were not available here. Safari-sensitive features were coded defensively (`svh`, `color-mix` fallbacks are not needed for Safari 16.2+, View Transitions fall back to an instant switch) but have not been run in Safari.

## Helper scripts (`scripts/`)

| Script | Use |
|---|---|
| `rebuild.sh` | Stop the server on :3100, rebuild, restart, wait until it answers |
| `shots.mjs` | Screenshot every landmark: `node scripts/shots.mjs shots 390x844,1440x900 dark home` |
| `visuals.mjs` | Element screenshots of the three standalone illustrations |
| `lh.mjs` | One Lighthouse run with the gate metrics: `node scripts/lh.mjs <url> mobile|desktop <label>` |
| `lint-summary.mjs`, `pw-summary.mjs` | Compact ESLint / Playwright output |
| `dummy-project-check.sh` | Proves the add-a-project flow needs no code |
| `seed-convert.mjs` | One-off: converted the kit's seed YAML into Keystatic's format (kept for the record) |

---

# Redesign log, 2026-11-12: "well-rounded, fast, with an AI first load"

Spec: `docs/superpowers/specs/2026-11-12-portfolio-redesign-design.md`. Plan: `docs/superpowers/plans/2026-11-12-portfolio-redesign-plan.md`.

## Why

The owner's review of the 2026-11-03 site: it read as "the ledger person". The manifesto, the first four scroll-screens (three pinned SKOPE chapters), three of six particle scenes, the Experience heading ("The entries"), the About heading ("The person behind the ledger") and the bio all orbited one employer project. A recruiter saw one domain, "Intern" in the most prominent spot and confidential work they could not click. The brief for the redesign: present a well-rounded full-stack developer, feel clean and modern, be responsive on every screen, add one creative AI-flavoured moment on first load without being slow, add C++ to the languages, and document everything.

## What changed

| Area | Before | After |
|---|---|---|
| Hero | Name + "I build the software that runs real businesses" + ledger/payroll/delivery sub-line; no CTAs | Name + "Full-stack developer who *ships* end to end" + tools sub-line + **See the work / Résumé / Email** buttons + a derived "Currently / Shipped / Across" signal panel + a soft violet/cyan aurora |
| Header | Job-title pill ("Intern @ SKOPE"), live clock, ⌘K hint | **Availability pill** ("Open to full-time roles"), **Résumé** button, theme toggle; clock and ⌘K note live in the footer |
| First load | 000→100 counter curtain ("Loading the ledger"), waited for WebGL | **Build intro**: four labelled cursors (`layout`, `copy`, `motion`, `ship`) fly in and snap the hero blocks into place, ~1 s, capped at 1.6 s, skippable, once per session, CSS failsafe at 2.5 s, off under reduced motion |
| Statement | "Three production systems. One month. 1,300+ automated tests…" (hard-coded) | Range line from content placeholders: "Two internships. Thirteen shipped projects. 934+ automated tests. From Figma to AWS, front to back." |
| Work | Three pinned, full-screen SKOPE chapters, then a horizontal gallery of personal builds | **One bento grid** of all featured work, interleaved (SKOPE Ops, Instantly, HR Portal, CarRental, mydeliveryboy, QuickStay, Pulse). Internal cards use **procedural SVG covers** (ledger / clock / route) labelled "Illustrative · sample data"; personal cards show screenshots with Live / Code buttons |
| Case studies | Internal illustrations only on the case-study page | Same, plus the matching **particle scene** (ledger / clock / route) anchored on that page, panel left-aligned on desktop so the particles stay visible |
| Particles | Scenes hero → ledger → clock → route → field → pin on home; director interpolated **scene ids**, so skipping a scene would flash through others | New **`graph`** scene (a network of connected parts) behind the work grid; director interpolates **anchor ordinals** and binds the scene ids on either side, so home goes hero → graph → field → pin directly |
| Copy | "The entries", "The person behind the ledger", "Let's build something that adds up", "Loading the ledger" | "Where I've worked", "Hi, I'm Youvraj.", "Let's build something together", no ledger wordplay anywhere |
| About | Duotone photo, tap for colour | Colour photo, bio rewritten around range and how he works |
| Skills | — | **C++** added to Languages |
| Theme | One accent | Same base and accent; added `--ai-1/--ai-2` (intro cursors, aurora, cover tints), `--surface`, `--radius-card`, card primitive; mono labels 11 → 12 px |
| Résumé | Addepto-tailored PDF served temporarily | Siemens-targeted PDF (`_applications/siemens/`), rendered from HTML with `scripts/resume-pdf.mjs` |

## Decisions worth knowing

1. **Chapters off the home page, not deleted.** The ledger / payroll / route illustrations and their particle shapes are the most crafted parts of the site; they now live on the case-study pages where a reader has chosen to go. Nothing was thrown away.
2. **Director model.** Interpolating anchor ordinals instead of scene ids was the smallest change that lets a page use any subset of scenes in any order. `shapeA/shapeB` are still plain ids for the shader. The 404 override and the static SVG fallback follow the same model.
3. **Intro has no curtain.** The hero HTML is painted immediately (it stays the LCP element); only the marked blocks wait, and the ghost boxes show where they will land. If the script never runs, CSS releases everything at 2.5 s.
4. **934+, not 1,300+.** The old statement hard-coded "1,300+ automated tests"; the content's per-project counts add up to 934. The range line now uses the derived number. If the 1,300 figure is right, add `testsCount` to the projects that are missing it (the personal projects have none) and the number follows.
5. **Procedural covers for confidential work.** No screenshots, no real data, server-rendered SVG, each labelled. The confidentiality Playwright checks were extended to the cards (no `img`, no external links, badge present).
6. **Hero "Across" line filters tooling.** The five most-used technologies are derived from project stacks, but styling and build tools (Tailwind, Vite, Radix, shadcn, Framer, Zod, JWT) are excluded so the line names languages, frameworks and data stores.
7. **Windows build quirk.** The native SWC binary is blocked by an Application Control policy on this machine, so builds use `next build --webpack`. Under Git Bash, Node reports the project as `d:\portfolio` while pnpm's paths are `D:\portfolio`; webpack then bundles two copies of Next's router context and the client crashes with "invariant expected layout router to be mounted". Build and serve from PowerShell (or any shell that reports `D:`). Vercel is unaffected.

## QA results

QA_RESULTS_PLACEHOLDER

## Helper scripts added

| Script | Use |
|---|---|
| `probe.mjs` | `node scripts/probe.mjs http://localhost:3100 home work work/instantly`: h1 and console errors per page (paths without a leading slash, Git Bash rewrites those) |
| `intro-frames.mjs` | Frames of the first-visit intro at 120…1900 ms plus its timing: `node scripts/intro-frames.mjs <outDir> 1440x900` |
| `resume-pdf.mjs` | HTML résumé → A4 PDF with clickable links: `node scripts/resume-pdf.mjs in.html out.pdf` |
| `shots.mjs` | Stops updated for the new home sections |
