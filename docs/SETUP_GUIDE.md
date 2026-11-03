# Setup Guide (for Youvraj)

Everything here is free. Total time: about 20 minutes after Claude Code finishes.

## 1. Put the code on GitHub
1. Create a new repository on GitHub, e.g. `portfolio` (public or private, both work).
2. In the project folder: `git remote add origin https://github.com/Dumb4Codes/portfolio.git` then `git push -u origin main`.
   (Claude Code can do this for you if you ask.)

## 2. Deploy on Vercel (Hobby, free)
1. Go to vercel.com → sign in with GitHub → **Add New → Project** → import the repo → Deploy.
2. You get a free address like `youvraj-singh.vercel.app`. To choose the name: Project → Settings → Domains → edit the `.vercel.app` domain (any free name that isn't taken).
3. Project → Settings → Environment Variables, add:
   - `NEXT_PUBLIC_SITE_URL` = your `.vercel.app` address (with `https://`)
   - `NEXT_PUBLIC_GITHUB_OWNER` = `Dumb4Codes`
   - `NEXT_PUBLIC_GITHUB_REPO` = `portfolio`
   - `NEXT_PUBLIC_WEB3FORMS_KEY` = see step 4
4. Redeploy (Deployments → ⋯ → Redeploy).

## 3. Turn on the admin (Keystatic + GitHub)
1. On your computer, in the project folder, create a file called `.env.local` containing the two lines `NEXT_PUBLIC_GITHUB_OWNER=Dumb4Codes` and `NEXT_PUBLIC_GITHUB_REPO=portfolio` (use your repo's name). Then run `pnpm dev:github` (it starts the editor in GitHub mode) and open `http://localhost:3000/keystatic`.
2. Keystatic offers to **create a GitHub App**. Follow it: name it e.g. "youvraj-portfolio-cms" and install it on your portfolio repo only.
3. Keystatic writes four values into `.env`: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`. Copy all four into Vercel's Environment Variables and redeploy.
4. In the GitHub App's settings, add your live callback URL: `https://<your-site>.vercel.app/api/keystatic/github/oauth/callback`.
5. Done. Visit `https://<your-site>.vercel.app/admin` → sign in with GitHub → edit → Save. Vercel rebuilds in about a minute.

Only GitHub accounts with write access to the repo can save, so it's just you unless you invite someone.

Until step 3 is done the site still builds and deploys normally; `/admin` just says "not configured yet". For everyday local editing without GitHub, use plain `pnpm dev` and open `/keystatic` (it edits the files on your computer; commit and push them yourself).

## 4. Contact form (Web3Forms, free)
1. Go to web3forms.com, enter `youv2002@gmail.com`, and they email you an access key.
2. Put it in Vercel as `NEXT_PUBLIC_WEB3FORMS_KEY` and redeploy. (This key is designed to be public; it only lets people send messages *to* you.)

## 5. Everyday editing
| I want to… | In `/admin` |
|---|---|
| Add a project | Projects → Add. Pick **Personal** (links + screenshots) or **Internal** (no links, pick a visual). Tick *Featured* to put it in the big gallery. |
| Update a job | Experience → pick the job → edit highlights. Leave *End* empty for "Present". |
| Add a new job | Experience → Add. Set *Order* to 1 to put it on top (and in the hero status pill). |
| New certificate | Certifications → Add → upload the image (and PDF), paste the verify link. |
| Replace my résumé | Profile → Résumé → upload the new PDF. **Do this soon: the PDF that shipped with the kit is the older résumé and doesn't list SKOPE Kitchens.** |
| Change headline/bio/phone | Profile. |

## 6. Good to know
- The Vercel Hobby plan is for personal, non-commercial sites, which a portfolio is.
- If a save breaks the build (e.g. a required field left empty), Vercel keeps the previous version live and shows the error in the Deployments tab.
