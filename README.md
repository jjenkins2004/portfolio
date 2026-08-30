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
src/App.tsx              the one page: sections top to bottom
src/index.css            global styles; imports tokens first
src/styles/              tokens.css (site variables), theme.ts (same palette as data), contrast.ts
src/content/             (planned) typed content: projects, experience, writing, links; sections render these
src/sections/            (planned) one component per page section
src/components/          shared pieces, each with a colocated *.stories.tsx; PalettePreview so far
.storybook/              Storybook config (react-vite; a11y, docs, vitest addons)
```

## Page structure

Single route, in this order: Nav · Hero (name, identity line, status, links) · About (short + skills) ·
Work (featured case-study cards, then a compact list) · Experience (timeline) · Writing · Elsewhere · Footer.
Content lives in `src/content/` as data, never inline in a section.

## Palette

"Bubblegum". Barlow Condensed (uppercase) for headings, Barlow for body, DM Mono for metadata. Light ground `#f6f7fa`,
plum ink `#262040`, blue-violet accent `#5140b8`, pale-pink pop `#ffb3d1` with near-black text on it (status dot,
highlighted tag; fills only). Dark ground `#101114`, raised `#25262f`. Full set in `src/styles/tokens.css`.
