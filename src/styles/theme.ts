/** The site's palette and type, as data. `tokens.css` carries the same values for CSS; change both together. */
export type Theme = {
  bg: string;
  bgRaised: string;
  ink: string;
  inkMuted: string;
  line: string;
  accent: string;
  accentStrong: string;
  /** second, louder color: status dot, highlighted tag. Fill only, never body text. */
  pop: string;
  /** text color on a pop fill */
  popInk: string;
};

export type FontSet = {
  display: string;
  body: string;
  mono: string;
  displayWeight: number;
  displayTransform?: 'uppercase';
  displayTracking?: string;
  displayStretch?: string;
};

export type Palette = {
  id: string;
  name: string;
  note: string;
  defaultTheme: 'light' | 'dark';
  fonts: FontSet;
  light: Theme;
  dark: Theme;
};

export const theme: Palette = {
  id: 'bubblegum',
  name: 'Bubblegum',
  note: 'Barlow Condensed uppercase for headings, Barlow for body, DM Mono for data. Plum ink, blue-violet accent, pale pink pop with near-black text on it.',
  defaultTheme: 'light',
  fonts: {
    display: "'Barlow Condensed', system-ui, sans-serif",
    body: "'Barlow', system-ui, sans-serif",
    mono: "'DM Mono', ui-monospace, monospace",
    displayWeight: 700,
    displayTransform: 'uppercase',
    displayTracking: '0.01em',
  },
  light: { bg: '#f6f7fa', bgRaised: '#ffffff', ink: '#262040', inkMuted: '#605d72', line: '#d8dae3', accent: '#5140b8', accentStrong: '#3f3098', pop: '#ffb3d1', popInk: '#1a0710' },
  dark: { bg: '#101114', bgRaised: '#25262f', ink: '#e9e8f2', inkMuted: '#9f9eb3', line: '#34363f', accent: '#aaa2f4', accentStrong: '#c6c0f8', pop: '#ffb8d4', popInk: '#1a0710' },
};
