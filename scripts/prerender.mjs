// Runs after `vite build`: writes one HTML file per route into dist/, each with its own title, description and
// link-preview (Open Graph) tags, so a crawler that never runs the app still sees the right page.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createServer } from 'vite';

const dist = 'dist';
const site =
  process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '');
if (!site) console.warn('prerender: SITE_URL unset, og:image and og:url are written relative (crawlers want them absolute)');

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const { routes } = await vite.ssrLoadModule('/src/content/meta.ts');
await vite.close();

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const shell = readFileSync(join(dist, 'index.html'), 'utf8');
const all = routes();
for (const r of all) {
  // a page with its own picture in public/og/ wins over the home screenshot
  const image = existsSync(join('public', 'og', `${r.slug}.png`)) ? `/og/${r.slug}.png` : '/og/home.png';
  const meta = [
    `<meta name="description" content="${esc(r.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(r.title)}" />`,
    `<meta property="og:description" content="${esc(r.description)}" />`,
    `<meta property="og:image" content="${site}${image}" />`,
    `<meta property="og:url" content="${site}${r.path}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].join('\n    ');
  const html = shell.replace(/<title>.*?<\/title>/, `<title>${esc(r.title)}</title>`).replace('</head>', `    ${meta}\n  </head>`);
  const out = r.path === '/' ? join(dist, 'index.html') : join(dist, r.path + '.html'); // /projects/stepper.html: served clean by vercel and vite preview
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}
console.log(`prerender: ${all.length} pages`);
