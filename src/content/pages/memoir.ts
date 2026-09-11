import type { ExperiencePageData } from '../../components/ProjectPage/ExperiencePage';

// The four processes a photo passes through, a request down each hop and a result back up.
const pipeline = `┌─ {{app}} ────────────────────────────────────┐
│ react native, resizes the photo          │
│ and posts it                             │
└─────────────────────┬───────────────▲────┘
                      │ one photo     │ the caption, on
                      │               │ the websocket
┌─ {{api}} ───────────────▼───────────────┴────┐
│ fastapi, stamps the row, queues          │
│ the job, replies at once                 │
└─────────────────────┬───────────────▲────┘
                      │ task          │ result
                      │               │
┌─ {{redis}} ─────────────▼───────────────┴────┐
│ the task queue and the                   │
│ pub/sub channel                          │
└─────────────────────┬───────────────▲────┘
                      │ task          │ result
                      │               │ published
┌─ {{worker}} ────────────▼───────────────┴────┐
│ celery, five at a time: caption,         │
│ embed, encrypt, store, index             │
└──────────────────────────────────────────┘`;

// The upload request and the receipt it gets back. Values are synthetic.
const receipt = `post   {"local_id": "a1b2c3",
        "base64_image_optimized": "data:image/jpeg;base64,…"}

reply  {"message": "Image received. Processing started."}`;

// The message the worker publishes when a job ends, one for success and one for failure.
const update = `channel  processing_updates

success  {"user_id": "u_9f3", "local_id": "a1b2c3",
          "status": "success",
          "photo": {"short_caption": "Two friends on a pier",
                    "caption": "…", …}}

failed   {"user_id": "u_9f3", "local_id": "a1b2c3",
          "status": "failed", "photo": null}`;

// The rule the list endpoint applies to every photo it returns.
const requeue = `requeue = ((short_caption == "" or caption == "")
           and last_queued older than 5 minutes)
          or status == "failed"`;

export const memoir: ExperiencePageData = {
  slug: 'memoir',
  org: 'memoir photos',
  role: 'Full Stack Intern',
  dates: 'Feb - May 2025',
  line: "Photo album for visually impaired users, with a spoken caption and a longer description for every photo. I moved captioning into a background queue, so an upload returns at once and captions arrive over a WebSocket. The measured wait fell about 80%.",
  concepts: 'background job queues · push updates · failure recovery',
  stack: 'Python · FastAPI · Celery · Redis · React Native',
  sections: [
    {
      title: 'context',
      body: "Memoir uploads photos from the camera roll, a vision model writes a short caption and a longer description for each, and the app reads them aloud and searches over them. I joined in the spring of 2025 as a full stack intern to work on the pipeline behind that. Captioning then ran inside the upload request, one photo at a time, so a batch of new photos held the app on a progress screen for the whole run. I moved that work onto a job queue, pushed each finished caption back to the app over a WebSocket, and added recovery for jobs that never finish.",
    },
    {
      title: 'the caption pipeline',
      layout: 'work',
      body: "One upload is one photo: resized on the phone to at most 512 pixels, posted as base64, keyed by its camera roll id, the `local_id` in the panels below. Three changes to what happens after that post, in the order I made them.",
      subs: [
        {
          title: 'captions off the request path',
          line: "The upload endpoint no longer captions: it stamps the photo's row, hands the job to a Celery worker over Redis, and replies at once.",
          blocks: [
            {
              label: 'before',
              body: "The server captioned inline. For each photo it called the model for a description, called it again for a short caption, embedded the description for search, encrypted both, updated the row in Postgres, and upserted the vector into Pinecone, then returned. The app awaited each photo before sending the next, so a batch of n photos cost n full caption runs end to end.",
            },
            {
              label: 'after',
              body: "The endpoint checks the photo has no captions yet, records when it was queued, and enqueues a task carrying the user, the photo's id, and its bytes. The reply is a receipt. A Celery worker on a gevent pool runs five tasks at a time, rate limited to twenty a minute, with late acknowledgement so a task whose worker dies mid-run is delivered again. On the same batch the wait fell about 80%, and the app is usable during it.",
              media: [{ kind: 'pre', pre: receipt }],
            },
            {
              label: 'four processes',
              body: "Redis carries both directions: the queue the worker pulls tasks from, and the channel it publishes results to. The API is the only one of the four the app talks to.",
              media: [{ kind: 'pre', pre: pipeline, tight: true }],
            },
            {
              label: 'no launch screen',
              body: "Launch used to block on a screen that found new photos and uploaded them before showing the album. Now the app sends its camera roll ids, the server returns the ones it already holds, and the rest upload in the background while the album is open.",
            },
          ],
        },
        {
          title: 'push instead of polling',
          line: 'When a caption lands, the app learns it from a WebSocket message instead of asking the server again.',
          blocks: [
            {
              label: 'the channel',
              body: "The worker's last step publishes a JSON message on a Redis pub/sub channel. Polling would have every open app asking again and again whether anything changed, and most answers would be no. A push costs one open socket per user and no traffic while idle.",
              media: [{ kind: 'pre', pre: update }],
            },
            {
              label: 'one socket per user',
              body: "The API subscribes to the channel once at startup and keeps a map from user id to open socket. The socket endpoint authenticates with the same access token as the REST calls, then holds the connection open. A message for a user with no socket is dropped; the next list fetch returns the caption anyway.",
            },
            {
              label: 'in the app',
              body: "The list screen marks every photo with an empty caption as processing and opens the socket. Each message swaps the short caption into its row in place and drops the id from the processing set, so the list updates without a refetch. On connect it asks once for any processing ids that finished while the socket was closed.",
            },
          ],
        },
        {
          title: 'jobs that never finish',
          line: 'A queued job can fail at the model, or never report back, and leave a photo without a caption forever. The list endpoint notices, and the app re-sends.',
          blocks: [
            {
              label: 'two columns',
              body: "Enqueuing stamps the row with the time it was queued. The worker writes a status of success or failed when it ends, and publishes the failure on the pub/sub channel.",
            },
            {
              label: 'the rule',
              body: "Every list fetch computes a requeue flag per photo. The app re-sends any flagged photo through the normal upload path, which resizes and posts it again. The endpoint refuses to queue a photo that already has its captions, so a retry that races a slow success does nothing.",
              media: [{ kind: 'pre', pre: requeue }],
            },
          ],
        },
      ],
    },
    {
      title: 'lessons',
      subs: [
        {
          title: 'push long-running work to the background',
          body: "A request should return when the work is accepted, not when it is done. Anything that waits on a model or a third party, or runs longer than a spinner can hide, goes on a queue, and the caller gets a receipt and a way to hear the result. At Memoir that turned a progress screen into an album the user could use while captions filled in. The cost is that one request becomes three parts: a queue, a completion signal, and a recovery path, and each is its own place to get wrong.",
        },
        {
          title: 'assume a background job can fail silently',
          body: "Background work fails where no caller is waiting to see it: the worker restarts mid-task, the model call errors, the message reporting it reaches nobody. I now give every job a visible state, when it was queued and how it ended, and a rule that turns a stale state into a retry. The cost is two columns and a check on every read.",
        },
      ],
    },
  ],
};
