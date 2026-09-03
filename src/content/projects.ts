import type { TermItem } from '../components/TermSection/TermSection';

export const projects: TermItem[] = [
  {
    name: 'stepper',
    href: '#/projects/stepper',
    meta: 'Python · AsyncIO · Jul 2026 – now',
    hot: true,
    line: 'Typed execution framework for long-running AI pipelines — the engine under Silky, jobby, and investing-tools.',
  },
  {
    name: 'ticker',
    href: '#/projects/ticker',
    meta: 'Python · Playwright · MCP · Aug 2026',
    line: 'Gives any agent a read-only view of my portfolio, quotes, and option chains, to seamlessly evaluate and consult on my live positions.',
  },
  {
    name: 'jobby',
    href: '#/projects/jobby',
    meta: 'Python · Playwright · Stepper · 2026',
    line: 'Scrapes LinkedIn and Indeed, ranks every posting against a CV — a Stepper pipeline end to end.',
  },
  {
    name: 'knowledgehub',
    href: '#/projects/knowledgehub',
    meta: 'TypeScript · MCP · 2026',
    line: 'A shared knowledge base any AI agent can read and edit from anywhere. Includes enforced structure for fast knowledge retrieval and multi-user support.',
  },
  {
    name: 'more/',
    children: [
      { name: 'clipirl', href: '#/projects/clipirl', note: 'iOS background audio recorder — a circular buffer that saves the moment after it happens.' },
      { name: 'mista-tet', href: '#/projects/mista-tet', note: 'Tetris rebuilt from scratch in C++ — as a boss fight.' },
      { name: 'swiftquill', href: '#/projects/swiftquill', note: 'Native Swift library: Quill Deltas to NSAttributedString.' },
    ],
  },
];
