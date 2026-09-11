# content

Typed site content. Sections render these; no copy lives in a component.

- `profile.ts` — name, identity line, work status, location, education, what-i-do, favorite activities, links, section list (Projects · Experience · Elsewhere).
- `projects.ts` — featured four (badge, stack, one-line summary) + `more/` one-liners, as `TermItem[]`.
- `experience.ts` — roles (org, dates, one line), as `TermItem[]`.
- `elsewhere.ts` — Troy Labs, GSSC, hackathons one-liners, as `TermItem[]`.
- Recallia's `work` section uses `layout: 'work'`: each sub carries a `line` (closed-state overview) and is written as `blocks` rather than a flat `body`, a labelled block per idea with its diagram inside the block it explains. Ascii diagrams only, animated where the point is a sequence; no code panels.
- `pages/` — one `ProjectPageData` per featured project (`stepper.ts`, `ticker.ts`, `knowledgehub.ts`, `clipirl.ts`) and one `ExperiencePageData` per role (`handshake.ts`, `recallia.ts`, `silky.ts`, `tu-crete.ts`, `memoir.ts` so far); `index.ts` maps slug → page (`pages`, `experiencePages`) for App's hash router. Page images live in `public/<slug>/`.
