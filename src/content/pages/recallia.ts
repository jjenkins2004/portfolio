import type { ExperiencePageData } from '../../components/ProjectPage/ExperiencePage';

const reactorTree = `  ┌──────────────────────────────────────────────────────────┐
  │                     {{BaseEventReactor}}                     │
  ├──────────────────────────────────────────────────────────┤
  │ each child hooks onto one scheduled event,               │
  │ then defines                                             │
  │   1  which users that event affects                      │
  │   2  the work to do for one of them                      │
  │   3  what makes two events a duplicate                   │
  ├──────────────────────────────────────────────────────────┤
  │ shared logic                                             │
  │   does that work for every user at once                  │
  │   will not start again while one is running              │
  │   one user's failure does not stop the rest              │
  └─────────────────────────────△────────────────────────────┘
                ┌───────────────┴──────────────┐
                │                              │
  ┌───────────────────────────┐  ┌───────────────────────────┐
  │    {{SundayRevealService}}    │  │  {{TimelineEvolutionService}} │
  ├───────────────────────────┤  ├───────────────────────────┤
  │ 1  moment saved that week │  │ 1  moment saved that day  │
  │ 2  write their letter     │  │ 2  pick a moment, or none │
  │ 3  same week = duplicate  │  │ 3  same hours = duplicate │
  └───────────────────────────┘  └───────────────────────────┘
                ▲                              ▲
                │ sun 5pm                      │ midnights
  ══ {{event bus}} ═╧══════════════════════════════╧══════════════`;



const promptShape = `                          ┌────────────────────────────────┐
                          │        [[FlattenedMoment]]         │
                          │ every field has a description  │
                          ├────────────────────────────────┤
                          │ [[time]]                           │
                          │   when it happened             │
                          │ [[caption]]                        │
                          │   what you wrote               │
                          │ [[intensity]]                      │
                          │   0 to 5, how strong it felt   │
                          └────────────────────────┬───────┘
                                                   │
  ┌────────────────────────────────────────────────┼───────┐
  │ ((TimelineEvolution))({{Prompt}})                      │       │
  │ decides which new moments join the timeline    │       │
  │                                                │       │
  │ ┌────────────────────┐   ┌─────────────────────▼────┐  │
  │ │       {{Prompt}}       │   │ [[NewMoments]]([[LlmEntity]])    │  │
  │ ├────────────────────┤   ├──────────────────────────┤  │
  │ │ {{system_message}}     │   │ schema = [[FlattenedMoment]] │  │
  │ │   the instructions │   │ [[context_guide()]]          │  │
  │ │                    │◀──│   explains each field    │  │
  │ │ {{content}}            │   │ [[add_entity_data()]]        │  │
  │ │   the data         │   │   adds this call's data  │  │
  │ └──────────┬─────────┘   └──────────────────────────┘  │
  │            ▼                                           │
  │     {{to_messages()}}                                      │
  │ the compiled text the model reads                      │
  └────────────────────────────────────────────────────────┘`;

const filterParts = `  ┌──────────────────────────────────────────────────────┐
  │                   {{FilterResult<T>}}                    │
  ├──────────────────────────────────────────────────────┤
  │   1  the value picked, typed T                       │
  │   2  the text on the chip                            │
  │   3  sqlite predicate                                │
  │   4  table to join with                              │
  └──────────────────────────△───────────────────────────┘
               ┌─────────────┴──────────────┐
               │                            │
  ┌─────────────────────────┐  ┌─────────────────────────┐
  │       {{Date.month}}        │  │      {{Location.city}}      │
  ├─────────────────────────┤  ├─────────────────────────┤
  │ 1  month 3              │  │ 1  silver lake, ca, us  │
  │ 2  "March"              │  │ 2  "Silver Lake"        │
  │ 3  times.month = 3      │  │ 3  city+state+country   │
  │ 4  times                │  │ 4  location meta        │
  └─────────────────────────┘  └─────────────────────────┘`;

const busFan: string[] = [
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) [[─]]───▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └─────────┬─────────┘
                                           │
                       ┌───────────────────┼───────────────────┐
                       ▼                   ▼                   ▼
                  GalleryWeek           Recall           GalleryMoment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) [[────]]▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └─────────┬─────────┘
                                           │
                       ┌───────────────────┼───────────────────┐
                       ▼                   ▼                   ▼
                  GalleryWeek           Recall           GalleryMoment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) [[────▶│]]     event bus     │
                                 [[│]]  \\.momentDeleted  │
                                 └─────────┬─────────┘
                                           │
                       ┌───────────────────┼───────────────────┐
                       ▼                   ▼                   ▼
                  GalleryWeek           Recall           GalleryMoment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) [[────▶│]]     event bus     │
                                 [[│]]  \\.momentDeleted  │
                                 [[└──]]───────┬─────────┘
                                           │
                       ┌───────────────────┼───────────────────┐
                       ▼                   ▼                   ▼
                  GalleryWeek           Recall           GalleryMoment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ───[[─▶│]]     event bus     │
                                 [[│]]  \\.momentDeleted  │
                                 [[└─────]]────┬─────────┘
                                           │
                       ┌───────────────────┼───────────────────┐
                       ▼                   ▼                   ▼
                  GalleryWeek           Recall           GalleryMoment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 [[│]]  \\.momentDeleted  │
                                 [[└────────]]─┬─────────┘
                                           │
                       ┌───────────────────┼───────────────────┐
                       ▼                   ▼                   ▼
                  GalleryWeek           Recall           GalleryMoment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └─[[────────┬]]─────────┘
                                           [[│]]
                       ┌───────────────────┼───────────────────┐
                       ▼                   ▼                   ▼
                  GalleryWeek           Recall           GalleryMoment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └────[[─────┬]]─────────┘
                                           [[│]]
                       ┌─────────────────[[──┼──]]─────────────────┐
                       ▼                   [[▼]]                   ▼
                  GalleryWeek           [[R]]ecall           GalleryMoment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └───────[[──┬]]─────────┘
                                           [[│]]
                       ┌──────────────[[─────┼─────]]──────────────┐
                       ▼                   [[▼]]                   ▼
                  GalleryWeek           [[Reca]]ll           GalleryMoment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └─────────┬─────────┘
                                           [[│]]
                       ┌───────────[[────────┼────────]]───────────┐
                       ▼                   [[▼]]                   ▼
                  GalleryWeek           [[Recall]]           GalleryMoment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └─────────┬─────────┘
                                           │
                       ┌────────[[──────────]]─┼─[[──────────]]────────┐
                       ▼                   ▼                   ▼
                  GalleryWeek           [[Recall]]           GalleryMoment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └─────────┬─────────┘
                                           │
                       ┌─────[[──────────]]────┼────[[──────────]]─────┐
                       ▼                   ▼                   ▼
                  GalleryWeek           Rec[[all]]           GalleryMoment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └─────────┬─────────┘
                                           │
                       ┌──[[──────────]]───────┼───────[[──────────]]──┐
                       ▼                   ▼                   ▼
                  GalleryWeek           Recall           GalleryMoment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └─────────┬─────────┘
                                           │
                       [[┌─────────]]──────────┼──────────[[─────────┐]]
                       ▼                   ▼                   ▼
                  GalleryWeek           Recall           GalleryMoment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └─────────┬─────────┘
                                           │
                       [[┌──────]]─────────────┼─────────────[[──────┐]]
                       [[▼]]                   ▼                   [[▼]]
                  [[Ga]]lleryWeek           Recall           [[Ga]]lleryMoment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └─────────┬─────────┘
                                           │
                       [[┌───]]────────────────┼────────────────[[───┐]]
                       [[▼]]                   ▼                   [[▼]]
                  [[Galle]]ryWeek           Recall           [[Galle]]ryMoment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └─────────┬─────────┘
                                           │
                       [[┌]]───────────────────┼───────────────────[[┐]]
                       [[▼]]                   ▼                   [[▼]]
                  [[GalleryW]]eek           Recall           [[GalleryM]]oment
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └─────────┬─────────┘
                                           │
                       ┌───────────────────┼───────────────────┐
                       ▼                   ▼                   ▼
                  G[[alleryWeek]]           Recall           G[[alleryMome]]nt
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └─────────┬─────────┘
                                           │
                       ┌───────────────────┼───────────────────┐
                       ▼                   ▼                   ▼
                  Gall[[eryWeek]]           Recall           Gall[[eryMoment]]
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └─────────┬─────────┘
                                           │
                       ┌───────────────────┼───────────────────┐
                       ▼                   ▼                   ▼
                  Gallery[[Week]]           Recall           Gallery[[Moment]]
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └─────────┬─────────┘
                                           │
                       ┌───────────────────┼───────────────────┐
                       ▼                   ▼                   ▼
                  GalleryWee[[k]]           Recall           GalleryMom[[ent]]
                   ViewModel           ViewModel             Store`,
  `  MomentsRepository
                                 ┌───────────────────┐
  emit(\\.momentDeleted, id) ────▶│     event bus     │
                                 │  \\.momentDeleted  │
                                 └─────────┬─────────┘
                                           │
                       ┌───────────────────┼───────────────────┐
                       ▼                   ▼                   ▼
                  GalleryWeek           Recall           GalleryMoment
                   ViewModel           ViewModel             Store`,
];

const queryBuild = `  ╭───────╮  ╭─────────────╮  ╭──────────╮
  │ {{March}} │  │ {{Silver Lake}} │  │ {{"coffee"}} │
  ╰───────╯  ╰─────────────╯  ╰──────────╯

  sql is built dynamically based on chosen filters

  SELECT DISTINCT moments.id
    FROM moments
    JOIN Date.month<march>.table
    JOIN Location.city<silver lake>.table
    JOIN Content.contains<"coffee">.table
   WHERE Date.month<march>.filter
     AND Location.city<silver lake>.filter
     AND Content.contains<"coffee">.filter`;


export const recallia: ExperiencePageData = {
  slug: 'recallia',
  org: 'recallia',
  role: 'Technical Founder',
  dates: 'Jun 2025 - Jun 2026',
  line: 'AI reflection app on iOS. A Sunday Letter that connects a week of small moments. ~200 users, a year of founder lessons.',
  concepts: 'shipping fast · event-driven architecture · customer interviews',
  stack: 'Swift · SwiftUI · SQLite · FastAPI · Supabase · React',
  sections: [
    {
      title: 'context',
      body: "Recallia was a photo journaling app I started with my friend Charlie Wang and ran for a year. A moment is a photo from your day plus a short note on what made it worth keeping. Save a few through the week and on Sunday the app writes you a letter about it. I led product and built everything technical. Charlie co-founded it with me, owned the design and the brand, and we made the product calls together. About 200 users saved around 2,000 moments.",
    },
    {
      title: "Recallia's evolution",
      note: 'Told through my real Recallia moments.',
      layout: 'snake',
      subs: [
        {
          title: 'initial idea',
          line: "forgetting college, photos weren't enough",
          when: 'Apr 2025',
          photos: [
            {
              src: '/recallia/create-moment.jpg',
              alt: 'The create moment screen: a photo, a caption box, the date and the location',
              w: 393,
              h: 852,
              phone: true,
            },
          ],
          body: "I was having so many new experiences in college that I was literally forgetting my entire freshman year. I tried looking back at my photos and just saw pixels with no meaning behind them. My first idea was small. A caption next to the photo would put the meaning back. I asked Charlie to build it with me. We had years of memories together. I was the technical one and he was the designer.",
        },
        {
          title: 'building for who?',
          line: "four months of features, zero users",
          when: 'May - Aug 2025',
          photos: [
            {
              src: '/recallia/first-moment.jpg',
              alt: 'The first moment saved in Recallia, a photo of a dog with a caption under it',
              w: 368,
              h: 800,
              phone: true,
            },
          ],
          body: 'Day one we picked the flower logo, then spent four months in a building frenzy. Every moment got semantic recommended tags. Search let you stack filters for date, location, and caption text. Captions got bold, italics, and underline. We made all of it beautiful, with zero users. I kept thinking about what someone would want after a year of saved moments instead of whether anyone wanted to save one. The core idea sat there unvalidated the whole time.',
        },
        {
          title: 'launch',
          line: 'friends loved it, new moments every day',
          when: 'Sep 2025',
          photos: [
            {
              src: '/recallia/launch-moment.jpg',
              alt: 'A moment saved the night the App Store approved Recallia, showing the onboarding storyboard',
              w: 368,
              h: 800,
              phone: true,
            },
          ],
          body: 'We launched in September and the first users were our friends. About 50 people downloaded it in the first few weeks. Everyone said it was so cute and a great idea. Some people opened it and had no idea what was going on, so we built onboarding to explain the point of the core features. Every morning I opened the database and there were new moments from the night before. I took that as proof the idea worked. We were on a high.',
        },
        {
          title: 'everyone churned',
          line: 'users left, I built more features',
          when: 'Oct 2025 - Jan 2026',
          photos: [
            {
              src: '/recallia/churned-moment.jpg',
              alt: 'A moment from the day a Reddit thread tore the idea apart',
              w: 368,
              h: 800,
              phone: true,
            },
          ],
          body: 'The high faded as the weeks went on. Most people made one or two moments and never opened the app again. I wrongly believed more features would bring them back, so I kept building. Comments, reactions, and moment stats went in through the fall. Then I spent December and January splitting the app into service and repository layers and moving everything to dependency injection. I had made almost 200 commits, but none of it addressed why people were leaving.\n\nAs a founder that was the wrong path. As an engineer I learned how to structure a big codebase, keep the layers apart, and build every piece so it could be tested on its own.',
        },
        {
          title: 'troylabs',
          line: 'interview went great, we got rejected',
          when: 'late Jan 2026',
          photos: [
            {
              src: '/recallia/troylabs-moment.jpg',
              alt: 'A moment saved right after the TroyLabs interview',
              w: 368,
              h: 800,
              phone: true,
            },
          ],
          body: "In late January I pitched Recallia as a startup to TroyLabs, the startup club I'm in at USC. The interview went great and we got rejected. It sank in that this was still a hypothesis with a big MVP full of features nobody had asked for. More features weren't going to fix it. That was all I knew. For the first time since April I had no idea what to do next. For a couple of weeks I didn't build anything new.",
        },
        {
          title: 'investor talk',
          line: "30 minutes at Entrepreneurs First, I'd been doing it wrong",
          when: 'Feb 2026',
          photos: [
            {
              src: '/recallia/investor-moment.jpg',
              alt: 'A moment saved walking home after the Entrepreneurs First call',
              w: 368,
              h: 800,
              phone: true,
            },
          ],
          body: "In February I got 30 minutes with a talent investor at Entrepreneurs First, a fund that backs people before they have a company. I went in looking for what to do next and wanted to hear how people who do this for a living find ideas and iterate on them. Walking out, I realized I had been doing Recallia completely wrong. I treated it like my baby. I wasn't talking to people and I wasn't failing fast. If we wanted to take the idea seriously, it was time to stop building and start talking.",
        },
        {
          title: 'pokémon booth',
          line: 'strangers at a Pokémon event, hundreds of nos',
          when: 'Mar 2026',
          photos: [
            {
              src: '/recallia/booth-moment.jpg',
              alt: 'A moment saved leaving the event, carrying the booth away in a box',
              w: 368,
              h: 800,
              phone: true,
            },
          ],
          body: "In March we tabled at a Pok\u00e9mon event. We wanted reactions from strangers who didn't care about our feelings, not friends telling us it was cute. The goal wasn't users. I wanted to know whether people understood the idea and felt anything about it. We didn't add anything for it. We cleaned up the core loop and onboarding so the idea came through in one try. We ran a giveaway, and to enter you had to make a moment and show us. The booth was the first time I got rejected to my face, and it happened hundreds of times that day. Every 'no thank you' and confused glance felt like proof I was wasting my time. Every person who downloaded the app that day churned. A couple of people did get it, and said it helped them appreciate small moments. Those few showed me who the app was actually for, people who are sentimental about their memories but don't want to put effort into journaling. I needed to talk to more people like that next.",
        },
        {
          title: 'user interviews',
          line: 'the mom test, people like reflecting, hate the effort',
          when: 'Mar 2026',
          photos: [
            {
              src: '/recallia/interviews-moment.jpg',
              alt: 'A moment saved on the run where the interviews finally added up',
              w: 368,
              h: 800,
              phone: true,
            },
          ],
          body: "So I went and found five of them. I wanted to do it right, so I researched how to actually run an interview and found the mom test. The main rule is that you ask about what someone already did, not what they say they would do. I asked about the last time they looked back at old photos instead of asking whether they would use Recallia. All five said the same thing. People like reflecting. They don't want to put in the effort, which is why journaling fails for them. And reflection happens randomly, with no structure to it.",
        },
        {
          title: 'identity crisis',
          line: "our niche, sentimental but lazy people",
          when: 'Mar 2026',
          body: "We had been calling Recallia a lot of things. A journaling app, a photo app, a memory app. The interviews settled it. People wanted to reflect, and the work of journaling stopped them. So the app would ask for almost nothing, a photo and a sentence, and give people that feeling. The hypothesis was that the feeling would be the reason people came back. Recallia was a reflection app for sentimental but lazy people, and its job was to help them appreciate and learn from their daily moments.",
        },
        {
          title: 'sunday letter',
          line: "built from evidence, loved, still nobody came back",
          when: 'Mar - Apr 2026',
          photos: [
            {
              src: '/recallia/letter-moment.jpg',
              alt: 'A moment saved the night the Sunday letter shipped',
              w: 368,
              h: 800,
              phone: true,
            },
          ],
          body: "This time we started from evidence instead of what we thought would be cool. The letter was how we would deliver that feeling. Reflection had been happening to people at random, so we gave it a day. You save moments through the week, and on Sunday at 5pm the app writes you a letter about them. Nothing else is asked of you. A timeline in the app filled up as the week went on, and the letter ran six pages, an opener, the moment of the week, a synthesis, and an insight.\n\nWe ran it with four beta testers. They finished their week of moments with constant reminders, read their letter, and really liked it. A few days later one of them brought her letter up on her own, which was the best signal we got out of the whole test. Our metric was whether anyone came back in week two and made moments after reading their letter, and nobody did. That showed the problem was the daily loop, the steps you go through to save a moment, not the letter. The letter had to be the reward, not the motivator. After creating a moment the loop felt unfinished. You'd go through it and think, okay, so what? The effort had to go down and the reward had to come sooner. Promising a reward after a week of effort is an impossible expectation. We had also expected people to change their habits and open Recallia instead of the camera app. We needed to sit on top of habits people already had.",
        },
        {
          title: 'new loop',
          line: "guided questions, one-week web MVP, 40% felt something",
          when: 'late Apr 2026',
          photos: [
            {
              src: '/recallia/newloop-moment.jpg',
              alt: 'A moment saved after testing the new loop on ten strangers',
              w: 368,
              h: 800,
              phone: true,
            },
          ],
          body: "The goal was as much context on a memory as possible for as little effort as possible, thirty seconds and no thinking, with the reward right away. Guided questions did both. A first question about the moment with tappable answers takes far less effort than an empty text box. After the tap comes a follow-up question based on the answer, while the brain is already in that state of mind. And the photo is one you already took, so it adds to something you already do.\n\nThe Sunday Letter had taken way too long to reach users, so this time I built a basic web app in one week and we tested only the loop. We did it on the web because no stranger is going to install a beta app through TestFlight to try something. They scanned a QR code and were in, no account, no download. We tested on strangers so nobody would be nice to us. Roughly 40% of testers had an emotional response. We counted it when they understood what the loop was trying to do, kept talking about how they felt without us digging, or we could see it on their face.",
                  },
        {
          title: 'very last moment',
          line: "a signal, not enough, we stopped",
          when: 'Jun 2026',
          body: "We got the number and stopped. Forty percent is a signal, but not enough to justify continuing. Charlie and I both had better things to put the next year into, so we ended it there. I'll use what I learned here on whatever I build next.",
        },
      ],
    },
    {
      title: 'work',
      layout: 'work',
      body: "Plenty of this is more machinery than a hundred-user app needed. It is also the engineering I am proudest of from the year, so these are the pieces worth looking at.\n\nThe code is public, the iOS app in [recallia-client](https://github.com/jjenkins2004/recallia-client) and the server in [recallia-server](https://github.com/jjenkins2004/recallia-server).",
      subs: [
        {
          title: 'the event reactor',
          line: "The weekly letter and the nightly timeline rebuild are the same problem. One event has to reach every user, and no user can be handled twice.",
          blocks: [
            {
              label: 'what runs on a schedule',
              body: "Two things in Recallia happen on a schedule instead of when someone taps. The weekly letter goes out Sunday at five. Each timeline is rebuilt at midnight. An event fires, and it applies to a lot of users at once.",
            },
            {
              label: 'the shared base class',
              body: "The two jobs differ in three places and agree everywhere else, so everything they agree on went into one base class. A job that inherits it says which users the event affects, what work to do for one of them, and what makes two events a duplicate. The base class handles running that work for everyone, dropping duplicates, and collecting failures. A finished job can also put a new event back on the same bus it came off, which is how the rest of the app finds out a timeline changed.",
              media: [{ kind: 'pre', pre: reactorTree, tight: true }],
            },
            {
              label: 'what counts as a duplicate',
              body: "The key that marks two events as duplicates is built from the span of time the event covers rather than the name of the job. The letter job answers with the week it is writing about. The timeline job also runs on schedules other than midnight, so it answers with the range of hours covered by that run. Two events with the same key share a lock, so a copy that arrives while the first one is still running is dropped rather than queued. Two events with different keys run side by side.\n\nDuplicates do happen. A redeploy can restart the scheduler on the minute a job is due, and I added an admin route that fires either job by hand. That lock only lives in the memory of the running server, so it is gone on restart. Before the letter job writes anything it saves a row for that user and that week, and a later run finds that row and stops. The timeline job never got a row like that, so a repeat there is only stopped by the lock.",
            },
            {
              label: 'when one user fails',
              body: "The work for every user under one event runs in parallel, and failures are collected instead of thrown, so one person's letter can fail without stopping anyone else's. The failure itself is handled worse than I would handle it now. The letter row goes in either way, and the check that reads it does not look at whether the last attempt worked. If that week is run again the user is skipped instead of retried.",
            },
          ],
        },
        {
          title: 'typed prompts',
          line: "Different LLM calls all needed different data explained in different ways. Each piece now defines what it holds and how to read it in one place, and a prompt is assembled from those pieces.",
          blocks: [
            {
              label: 'every call needs different data',
              body: "The letter needs every moment from the week it covers along with the summary and tags generated for each one. The timeline pick needs what is already on the timeline, the new batch of moments, and how many runs are left before Sunday. The photo read needs the image itself. Nothing about those three overlaps.",
            },
            {
              label: 'each piece explains itself',
              body: "A moment, a timeline entry and a photo analysis are each defined once, with a description on every field. The model reads those descriptions to know what each field means. The same definition also produces the data the model is handed. Change a field and both move, so the explanation cannot drift away from the values it describes.",
              media: [{ kind: 'pre', pre: promptShape, tight: true, caption: "One piece, feeding both halves of one call." }],
            },
            {
              label: 'a prompt is assembled, not written',
              body: "Each prompt adds the sections it needs instead of building one blob of text. A section carries a header and its own block of data, and an empty one is skipped rather than left as a hole. A debug print dumps the finished message with the image data cut out, so I can read exactly what was sent.",
            },
            {
              label: 'the model points instead of naming',
              body: "A model asked to name a moment by its id will eventually invent one that was never there, so the moments go in numbered and the model answers with a position. The position is bounds-checked before it becomes a moment again. A timeline run drops an answer that points at nothing. The letter treats that same answer as a failed generation, which is harsher than it needed to be.",
            },
          ],
        },
        {
          title: 'the weekly timeline',
          line: "Every week the app picks a handful of your moments and lays them out as the story of that week. It looks at how far into the week it is and what is already on the timeline before it adds anything.",
          blocks: [
            {
              label: 'what the timeline is',
              body: "You save a moment whenever something is worth keeping, a photo and a caption. By Sunday you might have thirty. The timeline is the short version, four to six of them, and it fills in as the week goes.\n\nThe job of the timeline is selecting moments relative to that week, which meant the same photo worth keeping in a quiet week could be dropped in a vacation week.",
            },
            {
              label: 'what it looks at',
              body: "A model chooses at certain times through the week whether a moment should be added. Each time it sees four things.\n\nThe moments already on the timeline, each with the short line the model wrote for it and a private note on why it was picked. The new moments since it last looked. A 0 to 5 intensity score that's determined at moment creation time. And how much of the week is left.\n\nThe notes are how a week builds to tell a specific story. It can see that Tuesday was kept because the week started badly, and choose a moment that can complement it.",
            },
            {
              label: 'when a moment gets on',
              body: "Early in the week, with nothing on the timeline yet, the bar is low and something ordinary can go on to set the scene. After that it prefers a moment that builds on what is already up over one that is only good on its own. Something similar to what is up counts only if it takes the story further.\n\nIf the week has a thread, the job is to follow it. If not, the timeline is a recap.",
            },
            {
              label: 'when it gets left off',
              body: "It adds one moment at most each time it looks, so a day with ten moments still gets one and one loud day cannot take over the week. Once five are up the timeline is treated as full, and the answer is no unless the new one clearly beats something already on it. Late in a quiet week the bar drops again.\n\nSaying no is an answer, and usually the right one.",
            },
            {
              label: 'the caption, not the photo',
              body: "The model inventing a story to justify a boring moment took longest to fix. It would rather make something up than come back with nothing. It stopped once the rule was based on the caption written instead of the photo.",
            },
            {
              label: 'how I checked it',
              body: "I built timelines out of moments modelled on real ones, each with the score and caption it would have had. An empty timeline early in the week, three decent moments in the middle, five strong ones with the week nearly over. For each one I wrote down the right call and why, then ran the real prompt against it and read what came back. This is how I tuned the bar.",
            },
          ],
        },
        {
          title: 'self-describing filters',
          line: "Every search filter carries its own piece of appendable SQL and the table it needs to reach to filter for moments. This allows a new kind of filter to be added without touching the code that runs the search, and any mix of filters to build one query with no case for each combination.",
          blocks: [
            {
              label: 'what search does',
              body: "Your moments live in a copy of the database on the phone, so search works with no signal. As you type, the app suggests filters in three families: Date for when something happened, Location for where, and Content for what you wrote about it. Each one you pick becomes a chip, and a moment has to match every chip you stack.",
            },
            {
              label: 'what a filter is',
              body: "A filter is a value with four parts, and only the last two ever change.\n\nThe times table stores each moment's day, month, year and day of week in their own columns, so narrowing to March is one equality check instead of date math over timestamps. A city has to match city, state and country together so two cities with the same name stay apart. Content goes to an FTS5 index, which is SQLite's full text search.\n\nA generic wrapper erases the type of the value picked, so all three families sit in one array.",
              media: [{ kind: 'pre', pre: filterParts, tight: true }],
            },
            {
              label: 'building the query',
              body: "Running a search walks that array twice. One pass reads each filter's table and joins it, once no matter how many filters name it. The other collects the predicates. It switches on the table a filter names, never on the filter itself.",
              media: [{ kind: 'pre', pre: queryBuild, tight: true }],
            },
            {
              label: 'what it costs to add a filter',
              body: "A new filter on a table the search already joins costs two things: the filter and the function that suggests it. Nothing in search changes. Every family implements that same function, which takes what you typed and returns its best matches.\n\nA new table does change search, by one more case in the join switch. The switch has three cases, and ten kinds of filter are built on them.",
            },
          ],
        },
        {
          title: 'a type-safe event bus',
          line: "Every event the app can raise is a property on one struct, and you subscribe by naming the property. That name is how the compiler knows what the event carries, so a handler with the wrong type does not compile.",
          blocks: [
            {
              label: 'what screens have to react to',
              body: "Screens have to react to things that happen somewhere else in the app. A moment gets deleted while you are looking at it, tags change on a moment in a grid you are scrolling, or the session ends. The usual way to wire that up is a notification with a name and a bag of untyped data at the other end, which fails quietly the first time someone changes what is in the bag.",
            },
            {
              label: 'one struct of events',
              body: "Every event the app can raise is a stored property on a struct called `AppEvents`, and you subscribe by naming one. A generic constraint resolves your handler's parameter from the event you named.\n\nNaming a different event changes what the handler gets. `\\.momentTagsUpdated` gives a set of ids, `\\.reflectionCreated` a named tuple of the moment id and the reflection id. A handler that takes anything else is a compile error rather than a crash at the other end.",
              media: [{ kind: 'anim', frames: busFan, ms: 150, tight: true }],
            },
            {
              label: 'signals and state',
              body: "Two kinds of event sit behind the same protocol. A signal fires and is gone, so a screen that appears afterwards sees nothing. A state holds its current value, so a screen reads it the instant it subscribes and has nothing to fetch before it can draw itself.\n\nA deleted moment is a signal. The auth status, the session, and how many moments you have are state.",
            },
            {
              label: 'clearing state on sign out',
              body: "Signing out has to put every piece of state back to its default. Rather than a list of what to clear, the service reflects over the struct and resets every property that holds state. An event opts out by being built with `resettable: false`, which is how the app version and the auth status survive a sign out while the moment count goes back to zero.\n\nThis only works because the events are properties on a struct. Nothing has to register itself.",
            },
            {
              label: 'where the type safety stops',
              body: "A screen that wants to refresh when any one of several unrelated events fires passes a list of them. That list is typed as `PartialKeyPath`, which drops the value type, so the merge falls back to a runtime cast and an assertion if something in the list is not an event. It is the one place in the bus where a mistake is caught while running instead of by the compiler.",
            },
          ],
        },
      ],
    },
    {
      title: 'lessons',
      subs: [
        {
          title: 'talk before you build',
          body: 'We built for ten months before asking anyone whether the problem was real. The TroyLabs interview and the Entrepreneurs First talk both said the same thing, that we were still guessing.',
        },
        {
          title: "don't build features nobody asked for",
          body: 'Every feature came from us, not from a user. Semantic tags on every moment, stackable search filters, rich text in captions, a weekly timeline. In May we cut every feature that users had not asked for or used. That was most of what we had built.',
        },
        {
          title: 'test on strangers',
          body: "Friends lie nicely, so we went to people who had no reason to be kind. For the web MVP we said it was for a class project so it didn't look like a pitch, let the product explain itself, waited three seconds after they finished, and asked whether it felt worth doing. It took a week to build and the answer came in a week too, while the Sunday Letter had taken months to reach a single tester.",
        },
      ],
    },
  ],
};
