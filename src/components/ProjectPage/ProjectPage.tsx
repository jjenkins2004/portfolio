import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import Window from '../TermSection/Window';
import './ProjectPage.css';

hljs.registerLanguage('python', python);
hljs.registerLanguage('typescript', typescript);

export type Media =
  | { kind: 'pre'; pre: string; caption?: string; lang?: 'python' | 'typescript' } // code (highlighted when lang set) or ascii diagram
  | { kind: 'img'; src: string; alt: string; caption?: string };

// One titled sub-section; features and difficulties are both lists of these.
export type SubSection = { title: string; body?: string; media?: Media[] };

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

function MediaList({ media }: { media?: Media[] }) {
  if (!media?.length) return null;
  return (
    <>
      {media.map((m, i) =>
        m.kind === 'pre' ? (
          <div className="pg-media" key={i}>
            {m.lang ? (
              <pre className="pg-pre" dangerouslySetInnerHTML={{ __html: hljs.highlight(m.pre, { language: m.lang }).value }} />
            ) : (
              <pre className="pg-pre">{m.pre}</pre>
            )}
            {m.caption && <p className="pg-cap">{m.caption}</p>}
          </div>
        ) : (
          <figure className="pg-shot" key={i}>
            <img src={m.src} alt={m.alt} />
            {m.caption && <figcaption className="pg-cap">{m.caption}</figcaption>}
          </figure>
        ),
      )}
    </>
  );
}

function Subs({ items }: { items: SubSection[] }) {
  return (
    <>
      {items.map((s) => (
        <div className="pg-dec" key={s.title}>
          <h3 className="pg-h3">{s.title}</h3>
          {s.body && <p className="pg-prose">{s.body}</p>}
          <MediaList media={s.media} />
        </div>
      ))}
    </>
  );
}

export default function ProjectPage({ p }: { p: ProjectPageData }) {
  return (
    <div className="pg-page">
      <Window title={'jjenkins/projects/' + p.slug + ' — zsh'}>
        <p className="pg-cmd">
          <span className="pg-prompt">$ </span>cd ~/jjenkins/projects/{p.slug} && cat README.md
        </p>
        <div className="pg-head">
          <span className="pg-name">{p.name}</span>
          <span className="pg-meta">{p.dates}</span>
        </div>
        <p className="pg-lede">{p.line}</p>
        <div className="pg-facts">
          <p className="pg-mono">
            <span className="pg-lab">concepts</span>
            {p.concepts}
          </p>
          <p className="pg-mono">
            <span className="pg-lab">stack</span>
            {p.stack}
          </p>
          <p className="pg-mono">
            <span className="pg-lab">remote</span>
            <a className="pg-remote" href={'https://' + p.github}>
              {p.github}
            </a>
          </p>
        </div>
        <h2 className="pg-h">problem</h2>
        <p className="pg-prose">{p.problem.body}</p>
        <MediaList media={p.problem.media} />
        <h2 className="pg-h">features</h2>
        <Subs items={p.features} />
        <h2 className="pg-h">difficulties</h2>
        <Subs items={p.difficulties} />
        <p className="pg-cd">
          <a href="#projects">$ cd ..</a>
        </p>
      </Window>
    </div>
  );
}
