import type { Fact, PageSection } from './PageView';
import PageView from './PageView';

export type { Media, PageSection, SubSection } from './PageView';

export type ExperiencePageData = {
  slug: string;
  org: string; // the page name
  role: string;
  dates: string; // right of the name
  line: string; // same one-liner the tree shows
  concepts?: string; // header row: the ideas at play
  stack: string;
  site?: string; // the org's site, host/path, no scheme
  sections: PageSection[]; // context → work → lessons by convention; a page may add its own
};

export default function ExperiencePage({ p }: { p: ExperiencePageData }) {
  const facts: Fact[] = [{ label: 'role', text: p.role }];
  if (p.concepts) facts.push({ label: 'concepts', text: p.concepts });
  facts.push({ label: 'stack', text: p.stack });
  if (p.site) facts.push({ label: 'site', text: p.site, href: 'https://' + p.site });
  return <PageView dir="experience" slug={p.slug} name={p.org} dates={p.dates} line={p.line} facts={facts} sections={p.sections} />;
}
