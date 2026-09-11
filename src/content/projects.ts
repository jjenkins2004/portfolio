import type { TermItem } from '../components/TermSection/TermSection';

export const projects: TermItem[] = [
  {
    name: 'stepper',
    href: '#/projects/stepper',
    meta: 'Python · AsyncIO · Jul 2026 – now',
    line: 'Checkpointed, step-based execution for long-running Python pipelines. The execution framework behind a lot of my other projects.',
  },
  {
    name: 'ticker',
    href: '#/projects/ticker',
    meta: 'Python · Playwright · MCP · Aug 2026',
    line: 'Gives any agent a read-only view of my portfolio, quotes, and option chains, to evaluate and consult on my live positions.',
  },
  {
    name: 'knowledgehub',
    href: '#/projects/knowledgehub',
    meta: 'TypeScript · MCP · 2026',
    line: 'A shared knowledge base any AI agent can read and edit from anywhere. Includes enforced structure for fast knowledge retrieval and multi-user support.',
  },
  {
    name: 'clipirl',
    href: '#/projects/clipirl',
    meta: 'Swift · SwiftUI · May 2024 - Mar 2025',
    line: 'An iOS recorder that saves the moment after it already happened. It keeps the last few minutes of audio in memory, and one tap saves a clip of 5 seconds to 5 minutes.',
  },
  {
    name: 'more/',
    children: [
      { name: 'mista-tet', href: 'https://github.com/jjenkins2004/Mista-Tet', note: 'Tetris rebuilt from scratch in C++ — as a boss fight.' },
      { name: 'swiftquill', href: 'https://github.com/jjenkins2004/SwiftQuill', note: 'Native Swift library: Quill Deltas to NSAttributedString.' },
    ],
  },
];
