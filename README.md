# Portfolio

Personal site for Joshua Jenkins. React + TypeScript on Vite; components built and reviewed in Storybook.

## Run

```bash
npm run dev          # site on http://localhost:5173
npm run storybook    # Storybook on http://localhost:6006
npm run build        # tsc -b && vite build -> dist/
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
.storybook/              Storybook config (react-vite; a11y, docs, vitest addons)
```

## Page structure

Single route as a stacked full-viewport slideshow — nothing moves between sections: Home (name, identity, links; shell run
with facts and section jumps) · Projects · Experience · Elsewhere — the last three each a TermSection terminal window
(tree ~/jjenkins/<dir>). On wide screens the document scrolls over invisible 25vh snap steps while the slides sit in a fixed
stack and fade through the background (outgoing gone by 30% of the step, incoming from 70% — never two slides overlaid) —
fade is a pure function of scroll position, gestures/momentum/settling are native scroll-snap physics
(App's useDeck; step height in index.css sets how much scroll a transition takes). Narrow or short screens (≤960px wide or
≤720px tall) render plain stacked sections with native scrolling instead (useFlatActive tracks the section for the nav).
A fixed mono header overlays both (App's SiteNav): the left path tracks the active slide (`~`, `~/projects`, …) and the
active section link lights up. A featured project opens its own page at #/projects/<slug> (ProjectPage; stepper, ticker, knowledgehub so far); unknown slugs get a terminal not-found.
Content lives in `src/content/` as data, never inline in a section.

## Palette

"Bubblegum". Barlow Condensed (uppercase) for headings, Barlow for body, DM Mono for metadata. Light ground `#f6f7fa`,
plum ink `#262040`, blue-violet accent `#5140b8`, pale-pink pop `#ffb3d1` with near-black text on it (status dot,
highlighted tag; fills only). Dark ground `#101114`, raised `#25262f`. Full set in `src/styles/tokens.css`.
