# styles

- `tokens.css` — the site's CSS variables (palette light + dark, fonts, type scale, spacing). The only place a color or font is named for the site.
- `theme.ts` — the same palette and fonts as data, for Storybook's `Foundations/Palette` and anything that needs a hex at runtime. Change both files together.
- `contrast.ts` — WCAG contrast ratio, used by the preview.

Fonts (Barlow Condensed, Barlow, DM Mono) load from Google Fonts: `index.html` for the site, `.storybook/preview-head.html` for Storybook.
