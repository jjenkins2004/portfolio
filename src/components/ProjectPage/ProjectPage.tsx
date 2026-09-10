import type { Media, SubSection } from './PageView';
import PageView from './PageView';

export type { ChatTurn, Media, SubSection, VideoClip } from './PageView';

export type ProjectPageData = {
  slug: string;
  name: string;
  dates: string; // right of the name
  line: string; // same one-liner the tree shows
  stack: string;
  github: string; // host/path, no scheme
  concepts: string; // header row: the ideas at play
  problem: { body: string; media?: Media[] };
  features: SubSection[]; // the surface, one high-level piece per entry
  difficulties: SubSection[];
};

// problem → features (media before body) → difficulties (body before media).
export default function ProjectPage({ p }: { p: ProjectPageData }) {
  return (
    <PageView
      dir="projects"
      slug={p.slug}
      name={p.name}
      dates={p.dates}
      line={p.line}
      facts={[
        { label: 'concepts', text: p.concepts },
        { label: 'stack', text: p.stack },
        { label: 'remote', text: p.github, href: 'https://' + p.github },
      ]}
      sections={[
        { title: 'problem', body: p.problem.body, media: p.problem.media },
        { title: 'features', subs: p.features, mediaFirst: true },
        { title: 'difficulties', subs: p.difficulties },
      ]}
    />
  );
}
