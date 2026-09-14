import type { ElsewherePageData } from '../../components/ProjectPage/ElsewherePage';

export const gsscKorea: ElsewherePageData = {
  slug: 'gssc-korea',
  name: 'GSSC Korea',
  dates: 'May 2025',
  line: 'Represented USC with Dori, an AI dementia caregiving platform, and placed top 3 globally.',
  role: 'Full stack',
  concepts: 'agent loops · retrieval grounding',
  stack: 'React · FastAPI · LangGraph · OpenAI · Pinecone',
  sections: [
    {
      title: 'context',
      blocks: [
        {
          body: 'The Global Student Startup Competition ran at the Asian Leadership Conference in Seoul in May 2025, on the theme of human centered AI. Twenty USC teams competed for the one spot. We pitched Dori and got it.',
          media: [
            {
              kind: 'img',
              src: '/gssc/stage.jpg',
              alt: 'The team on stage at the Asian Leadership Conference, presenting Dori',
              caption: 'Pitching Dori on the conference stage in Seoul.',
            },
          ],
        },
        {
          body: 'Dori is for the family member looking after someone with dementia. They answer an onboarding questionnaire about the person they care for, and Dori turns those answers into a personal roadmap of tasks across three areas: medical, legal and financial. Navigating dementia care is time consuming, and what actually needs doing varies drastically from one situation to the next, which is why the tasks are generated per person instead of handed out as a fixed checklist.',
        },
        {
          body: 'This was one of my first tastes of a startup. We built for about two months, then pitched in Seoul. Teams came from everywhere with ideas I would never have thought of.',
          media: [
            {
              kind: 'img',
              src: '/gssc/team.jpg',
              alt: 'The team in front of the Global Student Startup Competition backdrop',
              caption: 'The team after the final round.',
              wrap: true,
            },
            {
              kind: 'img',
              src: '/gssc/banner.jpg',
              alt: 'The Global Student Startup Competition banner laid out before the event',
              caption: 'The competition ran on the theme of human centered AI.',
              wrap: true,
            },
          ],
        },
      ],
    },
    {
      title: 'the build',
      body: "I led the full stack and built the part that turns a caregiver's answers into tasks.\n\nBecause no two situations look alike, the tasks cannot come from a fixed list. Onboarding answers go through a context step that runs once per area. It writes a condensed summary of the patient's situation, under a prompt that forbids leaving out anything relevant or inventing anything the answers do not say, along with search queries the model is told to keep very general. Those queries run against a knowledge base we built by scraping a list of pages, cutting them into overlapping chunks and embedding them into a vector index, so a task is grounded in that material rather than whatever the model recalls.\n\nThe tasks come out of a graph of four agents. One proposes a title and priority, checking the titles already written so it does not repeat one. A second validates it for necessity, clarity and priority. A third expands the approved task into a detailed breakdown, and a fourth validates that for accuracy and completeness. Anything that fails a check goes back to the agent that produced it instead of forward, and a validator can edit a task in place rather than only passing or rejecting it. Every output is a typed object, so a malformed response fails at the parse step.",
    },
  ],
};
