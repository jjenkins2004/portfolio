# components

Shared UI pieces, one folder each, with a colocated `*.stories.tsx`.

- `PalettePreview/` — renders `src/styles/theme.ts` as light + dark panes (hero, section title, card, swatches with contrast ratios). Reference for the locked palette, not a site section.
- `TermSection/` — `TermSection`: a terminal window running `tree ~/jjenkins/<dir>` with CSS-drawn tree rails; gutter line numbers on tree entries; renders `TermItem[]` (name/href, dim, badge, note, meta, line, hot — pink-chip number, children). Reused for Projects, Experience, Elsewhere. Story: `Sections/TermSection`.
