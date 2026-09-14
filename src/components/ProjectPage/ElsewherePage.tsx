import type { Fact, PageSection } from './PageView';
import PageView from './PageView';

export type { Media, PageSection, SubSection } from './PageView';

export type ElsewherePageData = {
  slug: string;
  name: string; // the page name
  dates: string; // right of the name
  line: string; // same one-liner the tree shows
  role?: string;
  concepts?: string; // header row: the ideas at play
  stack?: string;
  sections: PageSection[];
};

export default function ElsewherePage({ p }: { p: ElsewherePageData }) {
  const facts: Fact[] = [];
  if (p.role) facts.push({ label: 'role', text: p.role });
  if (p.concepts) facts.push({ label: 'concepts', text: p.concepts });
  if (p.stack) facts.push({ label: 'stack', text: p.stack });
  return <PageView dir="elsewhere" slug={p.slug} name={p.name} dates={p.dates} line={p.line} facts={facts} sections={p.sections} />;
}
