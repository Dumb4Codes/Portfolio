# Portfolio redesign: well-rounded, fast, with an AI-flavoured first load

**Date:** 2026-11-12 · **Status:** approved by the owner ("trusting your judgement"), building.

## 1. Intent

The current site presents Youvraj as "the ledger person": the manifesto, the first four scroll-screens, the particle scenes, the Experience heading, the About heading and the bio all orbit one employer project. A recruiter spending ten seconds sees one domain, the word "Intern" in the most prominent spot, and confidential work they cannot click. A normal visitor sees dense mono tables they do not understand.

The redesign presents a **well-rounded full-stack developer**: design → build → test → deploy, across front end, back end, data, cloud, on real products (an ERP, payroll, delivery, e-commerce, bookings, dashboards). SKOPE becomes one proof point among several. The site must feel clean, modern and fast, and the first load should carry one creative "AI" moment without slowing anything down.

## 2. Goals, non-goals, anti-goals

**Goals**

1. Range is visible in the first screen and a half: headline, CTAs, a range line, then a mixed work grid.
2. Every screen size from 320 px to 2560 px is designed, not squeezed; no horizontal scroll; 44 px targets.
3. A first-visit intro where several labelled cursors "assemble" the hero, done in about 1.2 s, skippable, once per session.
4. Keep the engineering qualities the site already has: static, works without JS, reduced-motion fallbacks, axe-clean, Lighthouse-grade performance, Keystatic-editable content.
5. Documentation: spec, plan, architecture and content docs updated; build log appended.

**Non-goals**

- No new content that is not already in the repo (no invented metrics, clients or testimonials).
- No framework change. Next.js 16, React 19, plain three.js, GSAP + Lenis (lazy), Keystatic stay.
- No change to the admin's storage or deploy flow.

**Anti-goals (would make it a failure even if it works)**

- A slow or blocking intro. Hard ceiling 1.6 s, target ~1.2 s, LCP element unchanged (the HTML `h1`).
- "AI purple gradient" cliché everywhere. The AI colours appear only in the intro cursors and a faint aurora.
- Losing the particle signature. The name-in-particles and the scroll-scrubbed morph stay.
- Breaking the confidentiality rules for internal work (no links, no screenshots, labelled illustrations).

## 3. The visitor's path (home)

| # | Section | What it says | Particle scene |
|---|---|---|---|
| 0 | Hero | Name (particles). "Full-stack developer who *ships* end to end." Sub-line on tools and current role. CTAs: See the work · Résumé · Email. Bottom row: location, availability. | `hero` |
| 1 | Range line + ticker | "Two internships. Thirteen shipped projects. 1,300+ automated tests. Figma to AWS, front to back." (numbers count up). Ticker of most-used tech. | (hero → graph) |
| 2 | [01] Selected work | Bento grid of featured projects, **mixed**: SKOPE Ops, Instantly, HR Portal, CarRental, mydeliveryboy, QuickStay, Pulse. Internal cards use procedural SVG covers labelled "Internal · illustrative"; personal cards use screenshots with Live/Code buttons. | `graph` (new) |
| 3 | [02] Archive | Everything else, as a table (kept). | (graph → field) |
| 4 | [03] Experience | "Where I've worked": SKOPE, HASVIK, education. Both jobs equal weight. | `field` |
| 5 | [04] Stack | "What I work with" (C++ added). Cross-highlight kept. | `field` |
| 6 | [05] Certifications | Deck (kept). | `field` |
| 7 | [06] About | "Hi, I'm Youvraj." Bio rewritten around range and how he works. Photo in colour by default. | `field` |
| 8 | [07] Contact | "Let's build something *together*." Email, phone, résumé, form. | `pin` |

Case-study pages for internal projects keep their full illustration (ledger / payroll clock / route) **and** get the matching particle scene as their backdrop, so the chapter craft is not lost, only moved to where a reader has chosen to go.

## 4. The intro: "agents assemble the page"

- Decided before paint by the existing boot script (`html.preload` on the first visit per session, never under reduced motion).
- No curtain. The hero renders immediately; elements marked `data-build` start at opacity 0 with a faint dashed placeholder box.
- Four cursors (SVG pointer + mono label: `layout`, `copy`, `motion`, `ship`), each in its own colour (violet, cyan, orange, bone), fly in from the edges on eased curves. Each visits targets in turn (monogram/nav, status pill, name, headline, sub, CTAs, footer row). On arrival the target gets `data-built="true"`: it fades/lifts in over 320 ms with a one-frame accent outline flash; the cursor does a small "click" scale.
- A mono status line (bottom-left) lists the agents and ticks them off.
- Choreography: start staggers 0/110/220/330 ms, flights 380–460 ms, hand-offs immediate. Total ≈ 1.2 s. Then cursors drift out and fade (240 ms), `html.preload` is removed, `intro:done` fires, `sessionStorage.pre = 1`.
- Skip: any key or pointer-down jumps to the end state. Failsafe: CSS removes all hiding at 2.5 s even if JS never runs.
- Implemented with the existing tiny `tween`/rAF helpers (no GSAP; the engine loads later). One small client component replaces `Preloader.tsx`. `site.showPreloader` keeps gating it (label updated in the admin).

## 5. Particles

- Scenes become `hero, graph, ledger, clock, route, field, pin` (+ override text). `graph` is a new generator: ~60 nodes on a loose grid with jitter, edges to 2–3 nearest neighbours as dotted lines, a few "hub" nodes; `attr` marks hubs (lit in accent) and edge t (a pulse travels along edges with `uLocal`).
- **Director change:** the scroll coordinate becomes *anchor-ordinal* (0..anchors−1) instead of scene-ordinal, so going from `graph` to `field` on the home page morphs directly instead of flashing through ledger/clock/route. `shapeA/B` are the scene ids of consecutive anchors. Static fallback and override logic follow.
- Home anchors: `hero` (hero), `graph` (work), `field` (the long zone), `pin` (contact). Internal case studies anchor their own scene; other pages default to `field`.

## 6. Theme

Tokens stay in `globals.css`, dark default, light via `[data-theme=light]`.

- Keep `--bg #0a0a0b`, `--fg #ede8df`, `--accent #ff5a1f`, bone paper in light.
- Add: `--ai-1 #8b7cff` (violet), `--ai-2 #35d6ff` (cyan); light: `#6a5cff`, `#0aa8d6`. Used only by the intro cursors, the aurora and tiny AI badges.
- Add surfaces: `--surface` (fg 4 % mix), `--surface-2` (6 %), `--radius-card 16px`, `--radius-pill 999px`, `--shadow-card`.
- Hero aurora: two large blurred radial gradients (`--ai-1`, `--ai-2`) at ~14 % opacity in dark, ~22 % of peach/sky in light, drifting slowly (CSS keyframes, 28 s, paused under reduced motion). Sits under the particle layer's z-index so particles stay crisp.
- Cards: `--surface` fill, 1 px `--line` border, `--radius-card`, cover with 16:10 aspect, hover lifts 2 px and sharpens the border; no heavy shadows.
- Typography unchanged (Archivo wdth, Instrument Serif italic accents, JetBrains Mono), but hero headline a step smaller and tighter to the name, and the mono label size raised to 12 px for readability.

## 7. Responsiveness rules

Breakpoints 320 / 390 / 768 / 1024 / 1440 / 1920 / 2560 (the existing Playwright matrix).

- Work grid: 1 column < 768; 2 columns ≥ 768; 12-column bento ≥ 1024 (first card spans 7, second 5, then 4/4/4, then 6/6). Covers always 16:10.
- Hero: name one line at every width (existing clamp); CTAs wrap to a column < 480; the right-hand signals column stacks under the headline < 1024.
- Header: desktop shows nav + availability pill + Résumé + theme; tablet drops the pill; phone shows monogram, theme, Menu.
- Everything else keeps its current responsive behaviour; the screenshot pass checks all of it at 390 and 1440 in both themes, plus 320/768/1920 dark.

## 8. Copy (content files)

- `profile.yaml`: headline, subheadline, bio (3 short paragraphs: what I do; how I work; where I am), availability label "Open to full-time roles".
- `site.yaml`: manifesto template gains `{projects}` and `{jobs}` placeholders; contact headline "Let's build something *together*."; SEO title/description reworded for range.
- `skills.yaml`: add **C++** to Languages.
- Projects: `order` values interleave internal and personal (1 Ops, 2 Instantly, 3 HR, 4 CarRental, 5 mydeliveryboy, 6 QuickStay, 7 Pulse). No other project text changes.
- Section headings: "Selected work", "Everything else", "Where I've worked", "What I work with", "Proof of coursework", "Hi, I'm Youvraj."

## 9. Constraints

- All CONTENT_RULES stay enforced by schema and Playwright (internal: no links/images; illustrations labelled).
- JS-off: every section readable; the intro's hidden state only applies under `html.js.preload`.
- Reduced motion: no intro, no aurora drift, no particles (static SVG), nothing left hidden.
- Bundle: no new dependencies. Intro ≈ 3 KB; graph generator ≈ 1.5 KB.
- Tests: unit (director ordinal model, graph shape bounds, manifesto placeholders, schema) and e2e (smoke, features, a11y, responsive) updated to the new structure and all passing before the final report.

## 10. Left to the builder

Exact cursor paths and colours per agent, the procedural cover compositions, the bento spans at 1024–1279, micro-copy of the intro status line, and the aurora's exact opacities (tuned from screenshots in both themes).
