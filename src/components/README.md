# components

Shared UI pieces, one folder each, with a colocated `*.stories.tsx`.

- `PalettePreview/` — renders `src/styles/theme.ts` as light + dark panes (hero, section title, card, swatches with contrast ratios). Reference for the locked palette, not a site section.
- `TermSection/` — `TermSection`: a terminal window running `tree ~/jjenkins/<dir>` with CSS-drawn tree rails; gutter line numbers on tree entries; renders `TermItem[]` (name/href, dim, badge, note, meta, line, hot — pink-chip number, children). Reused for Projects, Experience, Elsewhere. Story: `Sections/TermSection`.
- `TermSection/Window.tsx` — `Window`: shared mac-style terminal chrome (bar, lights, title) around a `tsec-body`; used by ProjectPage and App's not-found page.
- `ProjectPage/` — `ProjectPage`: a project's own page as one terminal window running `cat README.md` — name/meta head, problem, optional ascii `flow` diagram, built bullets, decision, optional `replay` diagram, optional `shots` (screenshots as `imgcat` output), stack, `remote` GitHub link, `$ cd ..` back. Data: `ProjectPageData`. Story: `Pages/Project`.
