# sections

One component per page section, rendering `src/content/` data.

- `home/` — `Home`: name, identity, links left; right, a terminal window running `run info`: work-status, location, education, concepts and stack (chip rows, each chip a link to the page that best shows it), favorite-activities, then a JUMP per section (`rows.ts`). Lines fade/slide in top-down on mount, each stamped with how long it waited; skipped under `prefers-reduced-motion`. Story: `Sections/Home`.

Projects, Experience and Elsewhere have no components here: `App.tsx` renders each as a `TermSection` (`src/components/TermSection/`) bound to its `src/content/` file.
