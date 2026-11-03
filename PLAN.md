# PLAN: Youvraj Singh portfolio

Idea: **"The same 40,000 particles become every chapter of my work."** One persistent WebGL particle field behind a quiet editorial site. It morphs name → ledger → clock → route → field → pin as you scroll.

Source of truth for requirements: `_kit/PROMPT.md`, `DESIGN_BRIEF.md`, `CMS_SPEC.md`, `CONTENT_RULES.md`, `QUALITY_GATES.md` (the kit is read-only reference and is git-ignored).

## 0. Project location (deviation)
The kit sat at `d:\_kit` with unrelated folders next to it on `d:\`. Scaffolding in the drive root would have mixed the app with them, so the app lives in **`d:\portfolio`**. `_kit/` is listed in `.gitignore` anyway, so if the kit is copied in later nothing leaks.

## 1. Stack (pinned, verified compatible on 2026-11-03)
next 16.4.4 · react 19.3.1 · tailwindcss 4.3.4 · @keystatic/core 0.6.9 + @keystatic/next 5.0.5 · three 0.187 · @react-three/fiber 9.8 · drei 10.7 · gsap 3.15 (+ @gsap/react 2.1) · lenis 1.3 · zod 4.6 · vitest 5 · @playwright/test 1.64 · TypeScript 5.9 (TS 7 skipped: tooling in Next/ESLint still targets 5.x).

## 2. Architecture

```
keystatic.config.ts        schema (single source for the admin form)
content/**                 YAML written by Keystatic (profile, site, skills, projects/, experience/, certifications/)
src/content/
  schema.ts                zod schemas, errors name file + field
  reader.ts                createReader + zod, cached; build-time only
  derive.ts                manifesto total, metric parser, stack aliases, sort, current job
  types.ts
src/gl/
  shapes/                  pure generators: text, ledger, clock, route, field, pin (+ mask sampler)
  shaders.ts               vertex/fragment (commented GLSL strings)
  Particles.tsx            THREE.Points + ShaderMaterial, uniforms, buffer swap
  director.ts              scene director (scroll → scene coordinate), overrides (404, HIRE?)
  GLRoot.tsx               lazy canvas, capability checks, fps probe, context-loss fallback
  StaticScene.tsx          SVG fallback (reduced motion / no WebGL / low power)
src/components/            Header, Footer, Cursor, Magnetic, Reveal, Palette, ThemeToggle, Lightbox, Preloader, Grain, Clock …
src/sections/              Hero, Manifesto, Work (3 chapters + visuals), Builds, Archive, Experience, Stack, Certs, About, Contact
src/app/
  layout.tsx               html, fonts, theme script
  (site)/layout.tsx        persistent canvas + chrome (survives route changes)
  (site)/page.tsx          home
  (site)/work/…            index + [slug]
  keystatic/…, api/keystatic/…   admin
  opengraph-image, sitemap, robots, manifest, not-found
tests/                     vitest (unit) + playwright (e2e/axe)
```

Server components render all content as HTML (works without JS). Client islands add motion. GL bundle is `dynamic()`-imported after idle, so the LCP element is the HTML `h1`.

## 3. Scene director (particles)
- Six shapes in fixed order: `hero(0) ledger(1) clock(2) route(3) field(4) pin(5)`.
- Sections (and case-study heroes) carry `data-scene="<shape>"`. On layout refresh the director measures each anchor.
- A continuous **scene coordinate `s ∈ [0,5]`** is computed from `scrollY`: between anchors the value ramps across a transition band, so the morph is **scrubbed** and reverses on scroll-up. A damped copy `sDamped` (critically-damped lerp) drives the shader: `from = floor(s)`, `to = from+1`, `progress = frac(s)`.
- Only two position buffers on the GPU (`aPosA`, `aPosB`); they are swapped when `floor(s)` changes. Per-particle stagger + pseudo-curl drift in the vertex shader.
- `uLocal` (0..1 progress through the active chapter) drives accent: ledger rows lighting, clock sweep, route rider pulse. DOM overlays read the same chapter progress, so they stay in sync.
- Overrides (`404`, `HIRE?`): director enters `override` mode with a text shape as `B`, animating `t` 0→1, then back.
- Shapes are generated for the current viewport box and aspect; regenerated on debounced resize.
- Fallbacks: reduced motion / no WebGL / context lost / low-power → `StaticScene` draws the same generators' points as a faint SVG per chapter.

## 4. Content schema
As in CMS_SPEC, plus one optional addition: **`nextSteps`** (array of text) on projects, used on case studies to present known trade-offs positively (CONTENT_RULES §2). Zod enforces: internal ⇒ no links/cover/gallery; dates `YYYY-MM`; gallery alt required.

## 5. Phases (commit after each)
1. Foundation: tokens, fonts, layout, Lenis+GSAP, Keystatic + seeded content + reader + zod, all routes with plain styling.
2. Particle system + director + fallbacks.
3. Home sections + interactions, one by one.
4. Case studies, internal visuals, archive, certs, contact.
5. Palette, theme transition, preloader, page transitions, 404, OG, SEO.
6. Performance, a11y, QA vs QUALITY_GATES; two critique-and-fix passes.

## 6. Content decisions recorded
- Résumé attached by Youvraj (latest) says **HASVIK ended Oct 2026**; CONTENT_RULES said "Present". The newer résumé wins: HASVIK = `2026-06 → 2026-10`. SKOPE = Present. Bio reworded accordingly. Editable in admin.
- Repo READMEs read for Pulse, Smart Bookmark, Finance Dashboard, Visual Workflow Playground (FlowForge), Typing Game (SpeedType), Nectar Grocery. Pipeline Builder has no README: tagline only.
- Project years verified from first-commit/created dates.
- `reference/` notes used only for "next steps" on Instantly, CarRental, QuickStay. Never copied or deployed.
