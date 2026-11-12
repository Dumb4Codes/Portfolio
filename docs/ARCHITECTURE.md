# Architecture

How the site is put together, and why. Written for whoever (including future Youvraj) has to change it.

## 1. Rendering model

- **Next.js App Router, statically generated.** Every page is built ahead of time from `content/`. There is no runtime data fetching. The only dynamic routes are the Keystatic admin and its API.
- **HTML first.** Every section is a React Server Component that renders plain HTML. The home page, every `/work/<slug>` page and the 404 are fully readable with JavaScript off (Playwright checks this).
- **Progressive enhancement, in layers:**
  1. HTML + CSS (readable, links work).
  2. React islands: header, command palette, stack highlighting, certificate dialog, gallery lightbox, contact form, the three illustrations.
  3. The **motion engine** (lazy chunk): scroll smoothing, pinning, entrances, counters.
  4. The **particle layer** (lazy chunk): WebGL canvas behind everything.
- Layers 3 and 4 load after hydration and an idle moment, so the LCP element is the HTML `h1`.

```
src/app/layout.tsx          html, fonts, theme boot script (no flash), preload flag
src/app/(site)/layout.tsx   persistent chrome: canvas, header, footer, palette, cursor, page wipe, build intro
src/app/(site)/page.tsx     home: hero, range line, work grid, archive, experience, stack, certificates, about, contact
src/app/keystatic/...       admin UI (own layout, no site chrome)
```

The canvas lives in the **(site) layout**, so it never remounts between routes.

## 2. Content

```
keystatic.config.ts ──► the admin form (what Youvraj edits)
content/**.yaml     ──► what the admin writes
src/content/reader.ts ─► Keystatic createReader (build time) ─► zod (schema.ts) ─► typed data
src/content/derive.ts ─► pure helpers: manifesto total, metric parser, stack aliases, dates
```

- zod normalises what the admin stores (empty strings, nulls) and **fails the build with the file and field** when something is wrong.
- `projectSchema` strips `liveUrl`, `repoUrl`, `cover` and `gallery` from `kind: internal` entries, so employer work cannot leak links even if someone types one.
- The range line ("Two internships. Thirteen shipped projects. 934+ automated tests.") is a template in `site.yaml`: `{jobs:words}`, `{projects:words}` and `{tests}` are filled from the content (job count, project count, sum of every project's `testsCount`). Nothing is hard-coded.
- The hero's "Currently / Shipped / Across" signals are derived too: the first job without an end date, the project and job counts, and the five technologies that appear in the most projects (styling and build tools filtered out).
- The stack section's "used in N projects" comes from projects' `stack` arrays through an alias map (`React 19` = `React.js`).

## 3. The particle system (`src/gl/`)

One draw call: `THREE.Points` with a custom `ShaderMaterial` (plain three.js, no React wrapper, to keep the lazy chunk at ~130 KB gzip).

**Shapes** (`shapes/*.ts`) are pure functions returning `{ pos: Float32Array, attr: Float32Array }` in screen pixels:

| Shape | Notes |
|---|---|
| `hero` | `textShape`: the real hero word is rasterised in tiles (CPU canvas), opaque pixels are sampled, fitted to the measured width of the HTML word |
| `graph` | a loose network behind the work grid: ~72 nodes on a jittered grid, each joined to its two nearest neighbours by a dotted edge, 7 hubs lit in accent; `attr` carries edge `t` so a pulse travels along every edge with scroll |
| `ledger` | 6 columns x 14 rows of dashes; `attr` = row, rows light up in accent as you scroll |
| `clock` | ring, ticks, three shift arcs (07:00-17:00, 09:00-18:30, 16:30-02:30 crossing midnight); the night arc sweeps in accent |
| `route` | Catmull-Rom curve through Area, Stop 1-4, Home; nodes light once the "rider" has passed |
| `field` | wide shallow undulating volume (very dim, so body text stays readable) |
| `pin` | dotted hemisphere with graticule and a pin at 12.97N 77.59E |

Boxes come from `sceneBox()`: right-hand 7 columns on desktop, centred behind the text when chapters stack (< 1024px).

**Scene director** (`director.ts`): sections carry `data-scene="<shape>"`. The director measures them into document coordinates and turns the scroll position into one continuous **anchor coordinate** `s` in [0, anchors − 1]: whole numbers inside an anchor, fractional in the gap between two. `shapeA` and `shapeB` are the scene ids of the anchors on either side of `s`, so the home page morphs hero → graph → field → pin directly, without passing through the chapter shapes that sit between those ids. Because it is a pure function of scroll, the morph is **scrubbed and reverses**. A damped copy of `s` drives the shader so it feels fluid. `uLocalA/B` (progress through the anchor, same curve as the DOM overlays via `lib/chapter.ts`) drive the accent. Overrides (`404`, `HIRE?`) swap shape B for text. Pages without anchors show the `field`.

Where the scenes appear: home has `hero` (hero), `graph` (work grid), `field` (archive → about) and `pin` (contact). Each internal case study anchors its own illustration's scene (`ledger`, `clock` or `route`), so the chapter shapes now live where the reader has chosen to go rather than on the home page.

**Shader** (`shaders.ts`): two position buffers (A, B) blended per particle with a stagger (`aRand`), a curl-like drift mid-morph, a resting breath, cursor repulsion, a touch ripple, scroll-velocity shear on the hero word, and a per-shape brightness gain.

**Engine** (`engine.ts`): owns the renderer and loop. It renders only while something moves (scroll, morph, pointer, theme change), rests on a still frame after ~3.5 s of calm, and a one-off FPS probe halves the count on slow GPUs (40k desktop, 24k weak desktop, 8k phones). `webglcontextlost` hands over to the SVG fallback.

**Fallbacks** (`StaticScene.tsx`): reduced motion, no WebGL, context loss. The same generators draw a faint SVG of dots per chapter, cross-faded by scroll. No animation loop.

## 4. The motion engine (`src/motion/`)

`Boot.tsx` (tiny, in the layout) imports `engine.ts` after hydration + idle, and again on every route change. The engine is **imperative and attribute-driven**: the server-rendered HTML carries hooks (`data-reveal`, `data-metric`, `.ticker__track`, `.certs__stage`, `.timeline__line`, `.about__photo`, `[data-next-ring]`) and the engine attaches behaviour. It contains Lenis (synced to ScrollTrigger and the GSAP ticker), entrances and counters (one `IntersectionObserver`, no layout reads at start-up), hero scroll-out, the ticker, the timeline line, the about-photo parallax and the certificate deck. (The pinned chapters and the horizontal gallery were removed in the 2026-11-12 redesign; the work grid is a plain CSS grid with per-card entrances.)

Why this shape: GSAP + ScrollTrigger + Lenis is ~55 KB gzip. Keeping it out of React keeps hydration cheap and out of the initial JavaScript. If the chunk fails to load, `html[data-motion="failed"]` releases every element the CSS hid for an entrance.

Pieces that must exist before the engine (cursor, magnetic buttons, the build intro, page wipe, archive preview) use tiny rAF / Web Animations helpers in `lib/tween.ts` instead of GSAP.

### The build intro (`components/Intro.tsx`)

First visit per session only (the boot script sets `html.preload` before paint; never under reduced motion). Hero blocks and the header row carry `data-build`; under `html.js.preload` they are hidden until they get `data-built="true"`. The intro measures those blocks, draws a dashed ghost box for each, and sends four labelled cursors (`layout`, `copy`, `motion`, `ship`, each in its own colour) flying in from the corners. Each arrival marks a block built (320 ms fade/lift, a one-off outline flash in the cursor's colour) and the cursor does a small click. A mono status line ticks the agents off. Total about 1 s of motion; a hard cap at 1.6 s, any key or tap skips to the end, and a CSS failsafe (`build-release` at 2.5 s) shows everything even if the script never runs. On repeat visits a plain CSS entrance (`hero-in`) plays instead; `html.built` prevents it from replaying right after the intro.

## 5. Performance decisions

- Fonts: Archivo (variable, `wdth` axis) and JetBrains Mono preloaded, Instrument Serif lazy; `display: swap` with size-adjusted fallbacks (CLS ~ 0).
- Images: `getImageProps` rendered as plain `<img>` (`components/Img.tsx`): AVIF/WebP, srcset, blur placeholders computed at build. Not the `<Image>` client component, because each instance costs hydration time on phones.
- Internal links are plain `<a>`; `PageWipe` prefetches on hover/touch and navigates with the router. (`next/link` made ~60 client components.)
- The hero entrance is CSS (never waits for JS). Entrance states are hidden only when `html.js` is set and the engine has not failed; the first-visit intro's hidden state only applies under `html.js.preload` and releases itself at 2.5 s.
- `Palette` and Vercel analytics are loaded on demand / only on Vercel.

## 6. Accessibility decisions

- One `h1` per page, ordered headings, skip link, landmarks, visible focus ring (accent, 2 px offset).
- Native `<dialog>` for the certificate and gallery viewers (focus trap, Esc, focus return). The menu and palette trap focus themselves; the palette is an ARIA combobox.
- The canvas is `aria-hidden`. Every internal illustration is `role="img"` with a full text description.
- `prefers-reduced-motion`: no Lenis, no particles (static SVG instead), no parallax, no marquee, no entrance animations, no grain, no build intro, and the hero aurora is still.
- Internal (confidential) projects never render an `<img>`: their covers are procedural SVGs (`sections/InternalCover.tsx`) labelled "Illustrative · sample data", and the schema strips any link or image an editor might add.
- The custom cursor (`components/Cursor.tsx`) is the same arrow the intro's agents use, snapped to the mouse with no lag, with an accent tag that names the action over `data-cursor` targets (View, Open ↗, Copy…). It never replaces the I-beam over text fields, comes back to the system cursor on any keyboard navigation, and does not exist for touch or reduced-motion users.
- Light theme uses a darker accent for small text (AA on bone paper and the raised panel).

## 7. Admin

Keystatic in `local` storage in development and `github` storage in production. `/admin` redirects to `/keystatic`; both are `noindex` and disallowed in `robots.txt`. Only GitHub users with write access to the repo can save. The API route is only wired up when the three GitHub secrets exist, so the first deploy builds before the secrets are added.
