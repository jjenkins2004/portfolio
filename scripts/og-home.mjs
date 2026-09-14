// Screenshots the built Home at link-preview size into public/og/home.png (commit it). Run after `npm run build`.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { port: 4179, strictPort: true }, logLevel: 'error' });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 756 } }); // 1.91:1, the preview ratio, wide enough for the deck layout
await page.goto(server.resolvedUrls.local[0]);
await page.evaluate(() => document.fonts.ready);
await page.waitForSelector('.term-done'); // the run has printed every line
await page.waitForTimeout(400);
mkdirSync('public/og', { recursive: true });
await page.screenshot({ path: 'public/og/home.png' });
await browser.close();
await server.close();
console.log('og: public/og/home.png');
