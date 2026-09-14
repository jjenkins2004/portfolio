# Portfolio

Personal site for Joshua Jenkins. React + TypeScript on Vite; components built and reviewed in Storybook.

## Run

```bash
npm run dev          # site on http://localhost:5173
npm run storybook    # Storybook on http://localhost:6006
npm run build        # tsc -b && vite build -> dist/, then scripts/prerender.mjs writes one HTML file per route (dist/projects/stepper.html) with its title, description and link-preview tags
npm run og           # screenshot the built Home into public/og/home.png, the link-preview image (commit it)
npm run og:pages     # the per-page link-preview cards into public/og/<slug>.png (commit them)
npm run lint         # oxlint
```

## Layout

```
src/main.tsx             entry
src/App.tsx              the one page: sections top to bottom (Home so far)
src/index.css            global styles; imports tokens first
src/styles/              tokens.css (site variables), theme.ts (same palette as data), contrast.ts
src/content/             typed content (profile.ts so far); sections render these
src/sections/            one component per page section; home/ is the shell-run home screen
src/components/          shared pieces, each with a colocated *.stories.tsx; PalettePreview so far
scripts/                 prerender.mjs (per-route HTML, run by build), og-home.mjs (the Home screenshot), og-pages.mjs (the per-page cards)
public/og/               link-preview images: home.png for every route; a <slug>.png wins for that page
public/<slug>/           a page's own images, its logo.svg among them
vercel.json              clean URLs serve the per-route HTML, every other path serves index.html
.storybook/              Storybook config (react-vite; a11y, docs, vitest addons)
```

## Page structure

Single route, sections stacked top to bottom on native scrolling: Home (name, identity, links; shell run with facts and
section jumps) · Projects · Experience · Elsewhere, the last three each a TermSection terminal window (tree ~/jjenkins/<dir>),
each starting its run when it first scrolls into view. A sticky mono header sits above them (App's SiteNav): the left path
tracks the section in view (`~`, `~/projects`, …) and that section's link lights up (App's useActiveSection, which also scrolls
to the hash's section on mount, so a deep link or `$ cd ..` from a page lands in the right place). A featured project opens its own page at #/projects/<slug> (ProjectPage; stepper, ticker, knowledgehub, clipirl), a role at #/experience/<slug> (ExperiencePage), and an Elsewhere entry at #/elsewhere/<slug> (ElsewherePage; gssc-korea), all rendered by PageView; unknown slugs get a terminal not-found.
Content lives in `src/content/` as data, never inline in a section.

## Palette

"Bubblegum". Barlow Condensed (uppercase) for headings, Barlow for body, DM Mono for metadata. Light ground `#f6f7fa`,
plum ink `#262040`, blue-violet accent `#5140b8`, pale-pink pop `#ffb3d1` with near-black text on it (status dot,
highlighted tag; fills only). Dark ground `#101114`, raised `#25262f`. Full set in `src/styles/tokens.css`.
