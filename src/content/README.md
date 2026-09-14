# content

Typed site content. Sections render these; no copy lives in a component.

- `profile.ts` — name, identity line, work status, location, education, concept and stack chips (each with the href of the page that best shows it), favorite activities, links, section list (Projects · Experience · Elsewhere).
- `projects.ts` — featured four (badge, stack, one-line summary) + `more/` one-liners, as `TermItem[]`.
- `experience.ts` — roles (org, dates, one line), as `TermItem[]`.
- `elsewhere.ts` — Troy Labs, GSSC one-liners, as `TermItem[]`; GSSC links to its own page.
- Recallia's `work` section uses `layout: 'work'`: each sub carries a `line` (closed-state overview) and is written as `blocks` rather than a flat `body`, a labelled block per idea with its diagram inside the block it explains. Ascii diagrams only, animated where the point is a sequence; no code panels.
- `pages/` — one `ProjectPageData` per featured project (`stepper.ts`, `ticker.ts`, `knowledgehub.ts`, `clipirl.ts`) one `ExperiencePageData` per role (`handshake.ts`, `recallia.ts`, `silky.ts`, `tu-crete.ts`, `memoir.ts`, `heat-lab.ts`), and one `ElsewherePageData` (`gssc-korea.ts`); `index.ts` maps slug → page (`pages`, `experiencePages`, `elsewherePages`) for App's hash router. Page images live in `public/<slug>/`.
- `meta.ts` — `SITE_NAME`, `pageTitle(section, slug)` (tab and link-preview title), `routes()` (every path with its title and description; the prerender script reads it).
