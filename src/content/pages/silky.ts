import type { ExperiencePageData } from '../../components/ProjectPage/ExperiencePage';

export const silky: ExperiencePageData = {
  slug: 'silky',
  org: 'silky',
  role: 'Technical Founder',
  dates: 'Jun 2026 - now',
  line: 'Automating listing creation from a factory spreadsheet and apparel photos for TikTok Shop. Deployed with a real client processing 900 SKUs a year, from the first message to a working tool in four versions over three months.',
  concepts: 'client discovery · AI-native pipelines · marketplace APIs',
  stack: 'Python · FastAPI · React · TypeScript · Supabase · Railway · Vercel',
  sections: [
    {
      title: 'context',
      body: "The client is a Chinese sweater factory selling through a fully managed TikTok Shop store, where the platform runs the storefront and the seller only supplies product data. Every style arrives as a factory spreadsheet and a folder of photos, and an operations assistant hand-fills every field on every platform. Silky takes the spreadsheet and the photos, builds one product record she reviews, and publishes it to TikTok Shop through its API. I started by talking with one client in June 2026 and recently deployed with them.",
    },
    {
      title: 'four versions',
      layout: 'snake',
      subs: [
        {
          title: 'understanding the problem',
          line: 'a factory, two platforms, every field by hand',
          body: "I started by talking with the owner, and he gave me a sub-account on the live shop so I could see the real operation. Roughly 900 SKUs a year go up on TikTok Shop and SHEIN. Their one listing tool had been cancelled because it could not reach a fully managed SHEIN store, so everything went in by hand, plus retyping errors. I wrote his process down as a list, get inventory, create SKUs, shoot and edit the photos, build a spreadsheet per platform, upload to each store, and he confirmed it. The ask was to take the product data once and fill every store.",
        },
        {
          title: 'v1, a browser agent',
          line: 'an agent filling the seller center',
          body: "The first version was an agent driving the seller center in a cloud browser: log in with saved cookies, walk the listing form section by section, fill it in, save as draft. It was the natural first step, since it let us work directly in the interface without applying for API access. After a couple of days of testing it clearly could not work: the UI was way too complicated and the agent could not navigate it, so I switched to the platform's API.",
        },
        {
          title: 'v2, over the API',
          line: 'built for the wrong store type, then blocked on the live store',
          body: "The second version built the whole listing through the API: title, category, attributes, SKUs, photos. It was a working demo, built against a POP test store, the standard kind of TikTok Shop store where the seller runs the storefront. Once we set up with his real store, we learned that they operate under the fully managed model, and access for that kind has to be applied for differently, so we were blocked for a while.",
        },
        {
          title: 'v3, preflight',
          line: 'spreadsheet in, a checked record out, no store access needed',
          body: "While we waited for authorization, I built preflight, which needed no store access. It took the factory spreadsheet and produced one clean record per style, every value in Chinese and English, with anything missing, inferred or inconsistent flagged beside it. She would read the record and copy the fields into the publish form. She ran it on a real style and even though it worked, it was not that useful to her. We learned that the real value was in filling the publish form automatically, and in a few hard steps like building the size chart from the grading template (one base size plus the offset for each size).",
        },
        {
          title: 'v4, auto-fill',
          line: 'spreadsheet and photos in, a product on the live store out',
          body: "The final version reads the spreadsheet and the photos, builds the record she reviews, and creates the product on TikTok Shop itself, which we knew was what the operations assistant was looking for. Once the store was authorized we ran it against the live store, and this is the version deployed with them now.",
        },
      ],
    },
    {
      title: 'lessons',
      body: "[Recallia](/experience/recallia) ended with three lessons: talk before you build, don't build what nobody asked for, ship fast. Silky was the first venture to apply them.",
      subs: [
        {
          title: 'work around the blocker',
          body: "The store authorization took a month to approve. Instead of waiting we built preflight, which tested a hypothesis and was blocked by nothing. It was not what she wanted, but we learned a lot from her running it and reused most of the idea in the next version.",
        },
        {
          title: 'understand the business before building',
          body: "I was eager to build, so I assumed a lot and jumped in as fast as I could. That led to two versions that were completely obsolete for the client. Moving fast on wrong assumptions was slower than not moving. I learned that I need to understand how the business actually runs before building.",
        },
        {
          title: 'talk directly to who the pain affects',
          body: "At first I only talked to the owner. He knew the business, but the pain was the operations assistant's, and she was the one who would use the tool. Once I talked to her, a lot of my assumptions were corrected and it was much clearer what we needed to build. The lesson was to talk directly to whoever the pain affects, not just whoever brought me in.",
        },
      ],
    },
  ],
};
