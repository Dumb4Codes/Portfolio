# Content guide

Everything on the site is editable in the admin (`/admin`, or `/keystatic` locally). No content lives in components.

## What each part controls

| Admin section | Shows up as |
|---|---|
| **Profile** | Name, headline (one verb is set in italic serif), subheadline, availability, links, résumé, photo, bio, education, contact details |
| **Site settings** | Page title and description (SEO), the big statement (`{tests}` is replaced by the total of all projects' automated checks), contact headline (`*word*` = italic), intro counter on/off, "hire" easter egg on/off |
| **Skills** | The stack section and the scrolling strip. Counts ("used in 4 projects") are derived from projects |
| **Projects** | Home gallery/archive, `/work`, `/work/<slug>`, command palette, sitemap, share images |
| **Experience** | Timeline. The first job with no end date (by Order) is the hero status pill |
| **Certifications** | The 3D deck and its dialog |

## Projects

| Field | Notes |
|---|---|
| Kind | **Personal**: links and screenshots. **Internal**: employer work, no links, no screenshots, shows the Confidential badge |
| Featured | Featured *personal* projects go in the big horizontal gallery. Featured *internal* projects with an illustration become the three pinned chapters. Everything else is in the archive |
| Order / Year | Order ascending, then year descending |
| Metrics | `value` + `label`. Leading numbers count up; prefixes/suffixes (`<`, `~`, `%`, `ms`, `₹`) are kept. `1-4` and similar stay as written |
| Automated checks | Optional. Adds to the big number on the home page |
| Illustration | Internal only: Ledger, Payroll clock or Delivery route |
| Cover / Gallery | Upload WebP or JPG, 2,000 px wide or less. No cover = a typographic cover is generated. Every gallery image needs a description |
| Next steps | What you would build next. Shown positively on the case study |

## Rules for internal (SKOPE) projects

These are the employer's systems. The public pages may say **what the system does, how it is designed, what Youvraj did and the outcomes**, exactly as written in the content files, and nothing more.

Never publish: links to the apps, staging addresses, repo names; real screenshots or UI recreations (only the abstract illustrations); security weaknesses, open issues, credentials, env values; staff names, IDs, phone numbers, customer data, addresses; costs, pricing, vendor plans; anything not in the project's content file.

The schema enforces the technical half (internal projects drop `liveUrl`, `repoUrl`, `cover` and `gallery`). Every illustration is labelled "Illustrative · sample data". Playwright checks all of this on the built pages.

## Truthfulness

Do not invent metrics, clients, testimonials, awards or dates. Years come from the first commit or creation date of the project.

## Personal data

Email and phone are approved for display. The phone number is not plain text in the HTML (it is assembled in the browser). No home address. Location is "Bengaluru, Karnataka, India".
