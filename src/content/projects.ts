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
    line: 'An MCP (Model Context Protocol) server that gives any agent my live market data and current positions: portfolio, quotes, option chains.',
  },
  {
    name: 'jobby',
    href: '#/projects/jobby',
    meta: 'Python · Playwright · Stepper · 2026',
    line: 'Scrapes LinkedIn and Indeed, ranks every posting against a CV — a Stepper pipeline end to end.',
  },
  {
    name: 'mcp-github-proxy',
    href: '#/projects/mcp-github-proxy',
    meta: 'TypeScript · MCP · 2026',
    line: 'Surgical markdown edits across GitHub repos over MCP — every change lands as exactly one commit.',
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
