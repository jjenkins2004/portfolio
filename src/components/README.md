# components

Shared UI pieces, one folder each, with a colocated `*.stories.tsx`.

- `PalettePreview/` — renders `src/styles/theme.ts` as light + dark panes (hero, section title, card, swatches with contrast ratios). Reference for the locked palette, not a site section.
- `TermSection/` — `TermSection`: a terminal window running `tree ~/jjenkins/<dir>` with CSS-drawn tree rails; gutter line numbers on tree entries; renders `TermItem[]` (name/href, dim, badge, note, meta, line, hot — pink-chip number, children). Reused for Projects, Experience, Elsewhere. Story: `Sections/TermSection`.
- `TermSection/Window.tsx` — `Window`: shared mac-style terminal chrome (bar, lights, title) around a `tsec-body`; used by ProjectPage and App's not-found page.
- `ProjectPage/` — `ProjectPage`: a project's own page as one terminal window running `cat README.md` — header (name, dates, lede, concepts/stack/remote rows), problem (body splits on `\n\n` into paragraphs), features (`SubSection[]`, media rendered before body), difficulties (`SubSection[]`, body before media), `$ cd ..` back. Data: `ProjectPageData`. Story: `Pages/Project`.
