# CLAUDE.md

Personal portfolio site of Horațiu-Gabriel Maier (data engineer, Cluj-Napoca).
Audience: hiring managers and engineers at US/EU companies hiring remotely.
Site copy is English only. The owner talks to Claude in Romanian; reply in
Romanian.

Design and code are adapted, with permission, from mihaicristian.dev. Keep that
look: one left-anchored column, no header or footer, light/dark from the system
only (no toggle), Inter plus Meslo mono, the custom cursor, Lenis smooth scroll,
the entrance stagger, the margin pattern.

## Stack rules

- Astro 7, static output, TypeScript strict, MDX content collections.
- No new dependencies without asking. No CSS frameworks, no UI kits, no React.
- Client JS stays limited to what exists: ClientRouter, Lenis, CustomCursor,
  PassionPattern, Shot's video controls.
- Deployed on Vercel: `main` is production, every other branch gets a preview URL.

## Commands

- `npm run dev` — local server on http://localhost:4321
- `npm run check` — type-check
- `npm run build` — build to `dist/`
- `bash scripts/guard.sh` — never-publish check (run after build)

The owner is the only person working here and pushes straight to `main`, which
deploys to production. So before every push to `main`: `npm run check`,
`npm run build`, `bash scripts/guard.sh`, all clean. If a push breaks the live
site, roll back with Vercel's Instant Rollback, then fix forward. For bigger or
riskier changes, push a branch first and check its Vercel preview URL.

## Where things live

- `src/data/site.ts` — name, role, links, the `showX` / `showCV` flags, and the
  approved employer paragraph (`work`). This is the ONLY place the employer is
  described.
- `src/content/projects/<slug>.mdx` — one file per project. Schema in
  `src/content.config.ts`: `group` (Products | Research), `order`, `featured`
  (shown on the home page, keep it to four), `homeOrder` (position there), `years`, `role`, `status`, `tech`,
  `links`, `features`, `shots`.
- `src/assets/projects/` — screenshots and recordings; see the README there.
  Every image needs real `alt` text. Videos: H.264 MP4, no audio, faststart,
  ideally under 4 MB, with a poster still beside it.
- `src/content/writing/<slug>.mdx` — posts. The Writing section and /writing/
  stay hidden from the home page and sitemap until the first post exists.

## Tone

Confident, plain, concrete, first person. Every claim carries a number, a link,
or a concrete noun. No "passionate", "cutting-edge", "leveraging", "seamless",
no emojis, no exclamation marks. Never round numbers up; if something was not
measured, say "designed for", not "handles". Use only numbers that come from a
source (the thesis, a benchmark CSV, the repo).

## Never publish

- Anything about Porsche Engineering beyond the approved paragraph in
  `site.ts`: no client names, internal numbers, internal project names, or
  screenshots of internal tools.
- Any claim that Perfect Shift was built at or for an employer. It is a
  personal project; it may be described as a proof of concept for in-vehicle
  infotainment.
- Client work that is not finished or not agreed by the client.
- Personal contact details beyond the email in `site.ts` (no phone, no address).
- Private keys, `.pem` files, `.env` contents, API keys.
- Inflated claims: no "enterprise-grade", no "production" unless it is live,
  no invented user counts.

`scripts/guard.sh` enforces part of this in CI; it does not replace judgment.

## Before pushing

- Links work (internal links are checked in CI; check external ones by hand).
- Alt text on every new image.
- Looks right at 375 px wide, in light and in dark.
