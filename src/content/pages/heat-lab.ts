import type { ExperiencePageData } from '../../components/ProjectPage/ExperiencePage';

// What the shell owns and what a type supplies.
const shellTree = `  ┌──────────────────────────────────────────────────────┐
  │                      {{test shell}}                      │
  ├──────────────────────────────────────────────────────┤
  │ a type says                                          │
  │   1  how an item is rendered and answered            │
  │   2  what an answer is                               │
  │   3  what it needs before the items                  │
  ├──────────────────────────────────────────────────────┤
  │ the shell owns                                       │
  │   fetching the questions by type and language        │
  │   instructions, practice, items, completion, submit  │
  │   the progress bar, reward breaks, language toggle   │
  └───────────────────────────△──────────────────────────┘
              ┌───────────────┴───────────────┐
              │                               │
  ┌────────────────────────┐    ┌────────────────────────┐
  │        {{matching}}        │    │       {{repetition}}       │
  ├────────────────────────┤    ├────────────────────────┤
  │ 1  tap one picture     │    │ 1  play, then record   │
  │ 2  an option index     │    │ 2  an audio location   │
  │ 3  nothing             │    │ 3  mic check, tutorial │
  └────────────────────────┘    └────────────────────────┘`;

// One submit envelope, one slot filled per type. Values are synthetic.
const payloads = `matching     { "participantId": "<participant id>",
               "submissionType": "matching",
               "isEN": true,
               "userAns": { "1": 3, "2": 1, "3": 4, ... },
               "audioSubmissionList": null }

repetition   { "participantId": "<participant id>",
               "submissionType": "repetition",
               "isEN": true,
               "userAns": null,
               "audioSubmissionList": { "1": "<recording url>",
                                        "2": "<recording url>",
                                        ... } }`;

export const heatLab: ExperiencePageData = {
  slug: 'heat-lab',
  org: 'usc heat lab',
  role: 'Product Engineer',
  dates: 'Aug 2024 - Feb 2025',
  line: "Web app for a USC lab's language tests of bilingual children, with every answer and recording collected for the researchers. I rebuilt it into a shell that a new task type plugs into, on a shared component set, and deployed it.",
  concepts: 'extensible flows · component library',
  stack: 'React · JavaScript · Java · AWS Lambda · PostgreSQL',
  site: 'heat-lab.github.io',
  sections: [
    {
      title: 'context',
      body: "The USC Heat Lab studies language in bilingual children, and MERLS is the React app its tests run in. When I joined in August 2024 it was one test component parameterized by language, break and completion screens inline, so each new test would have meant a copy of it. I rebuilt it as MERLS 3.0 between October 2024 and February 2025: a test shell parameterized by task type and language, a component set every screen is built from, the session flow from login to submit, and the backend's question endpoint and completion flags for the new types. The beta deployed to the lab's GitHub Pages site in November 2024.",
    },
    {
      title: 'merls 3.0',
      layout: 'work',
      body: 'Three task types instead of one, a shell two of them share, and the stages around a test: microphone check, instructions, guided tutorial, practice, reward breaks.',
      subs: [
        {
          title: 'the test shell',
          line: 'Picture matching and sentence repetition differ in three places and agree everywhere else, so everything they agree on is one shell and a task type supplies the rest.',
          blocks: [
            {
              label: 'what the shell owns',
              body: 'The shell fetches the questions for its type and language and runs the stages in one fixed order: instructions, a practice item, the items with a reward break at each quarter, completion, submit. It owns the progress bar, the language toggle, and the submit envelope. None of that knows which type is running.',
            },
            {
              label: 'what a type supplies',
              body: 'A type says three things. How an item is rendered and answered, as a renderer that gets the current question and a callback that records the answer and advances. What an answer is, an option index for matching or an audio location for repetition, which is the slot it fills in the envelope. What it needs before the items start, nothing for matching, a microphone check and a tooltip tutorial for repetition.',
              media: [{ kind: 'pre', pre: shellTree, tight: true }],
            },
            {
              label: 'adding a type',
              body: 'Sentence repetition was the first type added this way: the renderer, the slot, two routes, and a question table per language that the fetch maps the type to.',
              media: [{ kind: 'pre', pre: payloads }],
            },
          ],
        },
        {
          title: 'the component set',
          line: 'Five shared pieces. Four take both languages as props and a boolean that picks, and the fifth is the toggle that flips it on every screen.',
          blocks: [
            {
              label: 'bilingual by prop',
              body: "Four pieces take an English text and a Chinese text and render the one the boolean says: primary button, secondary button, tooltip with a pointer, confirmation modal. The fifth, the language toggle, sits in every screen's app bar and flips that boolean, and the choice rides a query parameter on every navigation, from the home page into the test. Item language is a separate prop, so UI language and item language are independent.",
            },
            {
              label: 'composition',
              body: 'The modal is the two buttons over a gray backdrop, and the tutorial is the tooltip on each control in turn with the primary button inside it to advance.',
            },
          ],
        },
        {
          title: 'collecting a session',
          line: "Answers and recordings go from the browser to the lab's database and bucket, and a researcher downloads one spreadsheet per participant per language.",
          blocks: [
            {
              label: 'the path',
              body: "Login is a participant id checked against the participants table and kept in local storage. The selection screen reads that participant's completion flags and disables any test already taken. Submit writes the answers and sets the flag, so a test runs once.",
            },
            {
              label: 'recordings',
              body: 'A repetition item plays the sentence after a three-second countdown, records from the moment it ends, and stops at 30 seconds or on tap. Each blob stays in memory until the end. On submit each is base64-encoded and posted to a Lambda that writes it to S3, and the returned locations enter the submission keyed by question id. A researcher downloads a server-built xlsx, one sheet of picks and one of recordings.',
            },
            {
              label: 'after the beta',
              body: "Beta build November 12, deploy to the lab's GitHub Pages site November 18, on a hash router so refreshing a test page does not 404. After it: dynamic screen sizing, new audio for both matching tests, and an alert when the browser refuses to play a question instead of a swallowed error.",
            },
          ],
        },
      ],
    },
    {
      title: 'lessons',
      subs: [
        {
          title: 'abstract similar modules',
          body: 'The old app had one test, so nothing was shared: break and completion screens inline, buttons styled in place, the language toggle pasted into three files, which I first normalized by hand. For the second type I pulled the shared spine into one shell and the repeated pieces into a set, so the new type became one renderer and a parameter. Now when a second module is going to look like the first, I pull out what they share before writing it, not after. The cost is that the abstraction is fixed on the cases you have seen and does not fit the one you have not.',
        },
        {
          title: 'abstract bottom up',
          body: "The shell went from picture matching to sentence repetition by one parameter, which I took as proof it was general. The third type's unit was a story, not an item, and it broke the shell. The leaves (buttons, modal, microphone check, completion screen) carried over because each did one thing behind a small interface. Now I make the leaves reusable first and let the frame grow from what they share, and I don't claim a frame generalizes until a third shape has hit it. The cost is a frame duplicated longer, and small pieces that take longer than inline markup and pay back only from the second use.",
        },
      ],
    },
  ],
};
