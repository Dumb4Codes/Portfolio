# Plan: portfolio redesign (2026-11-12)

Spec: `docs/superpowers/specs/2026-11-12-portfolio-redesign-design.md`. Each step ends with a check. Commits are grouped by step.

## 0. Baseline
- [x] `pnpm typecheck && pnpm lint && pnpm test` green before touching anything (record counts).

## 1. Tokens and theme (globals.css)
- [x] Add `--ai-1/--ai-2`, `--surface/--surface-2`, radii, `--shadow-card`, light variants.
- [x] Mono label size 12px; `.card` primitive; `.aurora` keyframes with reduced-motion pause.
- Check: build passes, no visual regressions on unchanged sections.

## 2. Content
- [x] `profile.yaml` headline/sub/bio/availability; `site.yaml` manifesto/SEO/contact; `skills.yaml` + C++; project `order` interleave.
- [x] `derive.ts`: `renderManifesto(template, {tests, projects, jobs})`; keep `{tests}`.
- [x] Unit tests for the new placeholders.

## 3. Particles: `graph` scene + ordinal director
- [x] `shapes/graph.ts` generator; register in `shapes/index.ts`, `types.ts` SCENES; `sceneBox` for graph.
- [x] `shaders.ts`: shape ids shift (graph=1 … pin=6, override=7); `accentFor` / `gainFor` for graph.
- [x] `director.ts`: ordinal coordinate; `shapeA/B` from consecutive anchors; `currentScene` returns scene id; `defaultScene` field id.
- [x] `engine.ts`: `OVERRIDE_SHAPE`, SCENE_KEYS; `StaticScene` includes graph.
- [x] Unit tests: director (new model), shapes (graph).
- Check: `pnpm test`.

## 4. Home sections
- [x] `Hero.tsx`: new structure (`data-build` hooks, CTAs, signals), CSS.
- [x] `Manifesto.tsx`: multi-placeholder.
- [x] New `WorkGrid.tsx` (+ `InternalCover.tsx` procedural SVGs) replaces `WorkSection` + `BuildsSection` on home; `data-scene="graph"`.
- [x] `ExperienceSection`, `StackSection`, `AboutSection`, `ContactSection` heading copy; About photo colour-first.
- [x] `page.tsx` composition; remove `.chapter-wrap` from home; `field-zone` anchors.
- [x] `motion/engine.ts`: remove `builds` pin + `chapters` on home (keep for case-study if used); keep reveals.
- Check: build, screenshots at 390/1440 dark+light.

## 5. Case studies
- [x] Internal case study: `data-scene` for its visual; keep standalone visuals.
- [x] `/work` index unchanged except heading tone.

## 6. Chrome
- [x] Header: availability pill, Résumé button, drop clock, keep theme toggle + Menu; mobile menu gets Résumé + email.
- [x] Footer: keep clock + ⌘K note.
- [x] Replace `Preloader.tsx` with `Intro.tsx` (agents); CSS for placeholders, cursors, status line, failsafe; keystatic label.
- Check: intro ≤ 1.6 s in a Playwright timing test; skip works; second visit shows nothing.

## 7. Tests
- [x] Update smoke / features / a11y-confidential / responsive selectors and expectations; add intro timing test.
- [x] `pnpm build && pnpm test:e2e` green.

## 8. Docs
- [x] ARCHITECTURE.md (sections, director model, intro), CONTENT.md (placeholders, ordering), BUILD_LOG.md (redesign entry with QA results), README (one idea line), PROJECT_GUIDE §1.
- [x] Final screenshot critique pass (both themes, 320/390/768/1024/1440/1920) and fixes.

## 9. Verification before completion
- [x] typecheck, lint, unit, e2e, build all run in the final state; results recorded in BUILD_LOG.


All steps done on 2026-11-12; results in `docs/BUILD_LOG.md` ("Redesign log, 2026-11-12").
