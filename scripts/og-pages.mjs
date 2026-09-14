// Writes one link-preview image per page that has a mark, into public/og/<slug>.png (commit them).
// prerender.mjs picks a <slug>.png up on its own; a page without one falls back to home.png.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { createServer } from 'vite';

// The picture each card leads with. A page absent from here keeps the home screenshot.
const marks = {
  stepper: { src: '/stepper/logo.svg' },
  ticker: { src: '/ticker/logo.svg' },
  knowledgehub: { src: '/knowledgehub/logo.svg' },
  clipirl: { src: '/clipirl/logo.png', clip: 'circle(43.8%)' }, // the app icon, minus its white antialias rim
  'gssc-korea': { src: '/gssc/stage.jpg', cover: true, foot: 'Seoul · May 2025' },
};

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const { pages, elsewherePages } = await vite.ssrLoadModule('/src/content/pages/index.ts');
await vite.close();

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const card = (page, mark) => {
  const lede = page.line.split('. ')[0].replace(/\.$/, '') + '.'; // the first sentence; the rest is page copy, too long for a card
  const style = mark.cover ? 'object-fit: cover; border-radius: 2rem;' : mark.clip ? `clip-path: ${mark.clip};` : '';
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap">
<style>
  html { font-size: calc(100vh / 756 * 16); }
  body { margin: 0; width: 100vw; height: 100vh; background: #262040; color: #e9e8f2;
         display: flex; align-items: center; justify-content: center; gap: 5rem; font-family: Barlow, sans-serif; }
  .mark { width: 22rem; height: 22rem; flex: none; ${style} }
  .text { max-width: 44rem; }
  h1 { margin: 0 0 0.6rem; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 9.5rem;
       line-height: 0.9; text-transform: uppercase; letter-spacing: 0.01em; }
  p { margin: 0 0 1.6rem; font-size: 2rem; line-height: 1.3; font-weight: 500; color: #9f9eb3; text-wrap: balance; }
  code { font-family: 'DM Mono', monospace; font-size: 1.35rem; color: #aaa2f4; }
</style></head>
<body><img class="mark" src="${mark.src}" alt="" />
  <div class="text"><h1>${esc(page.name)}</h1><p>${esc(lede)}</p><code>${esc(mark.foot ?? page.github)}</code></div>
  <script>
    // a long name (KnowledgeHub) would run off the card at the full size: shrink it until it fits on one line
    document.fonts.ready.then(() => {
      const h1 = document.querySelector('h1'), box = document.querySelector('.text');
      for (let px = 152; h1.scrollWidth > box.clientWidth && px > 40; px -= 2) h1.style.fontSize = px + 'px';
    });
  <\/script>
</body></html>`;
};

const server = await (await import('vite')).preview({ preview: { port: 4180, strictPort: true }, logLevel: 'error' });
const origin = server.resolvedUrls.local[0].replace(/\/$/, ''); // serves public/, so a mark's absolute src resolves
const browser = await chromium.launch();
mkdirSync('public/og', { recursive: true });
for (const [slug, mark] of Object.entries(marks)) {
  const page = pages[slug] ?? elsewherePages[slug];
  if (!page) throw new Error(`og: no page for slug ${slug}`);
  const tab = await browser.newPage({ viewport: { width: 1440, height: 756 } }); // 1.91:1, same size as home.png
  await tab.goto(`${origin}/__og.html`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await tab.setContent(card(page, mark).replace(/src="\//g, `src="${origin}/`));
  await tab.evaluate(() => document.fonts.ready);
  await tab.waitForTimeout(300);
  await tab.screenshot({ path: `public/og/${slug}.png` });
  await tab.close();
  console.log(`og: public/og/${slug}.png`);
}
await browser.close();
await server.close();
