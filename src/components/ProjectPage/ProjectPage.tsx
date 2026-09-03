import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import Window from '../TermSection/Window';
import './ProjectPage.css';

hljs.registerLanguage('python', python);
hljs.registerLanguage('typescript', typescript);

export type ChatTurn = { role: 'user' | 'ai'; text: string; tools?: string[] };

export type Media =
  | { kind: 'pre'; pre: string; caption?: string; lang?: 'python' | 'typescript' } // code (highlighted when lang set) or ascii diagram
  | { kind: 'img'; src: string; alt: string; caption?: string }
  | { kind: 'chat'; turns: ChatTurn[]; caption?: string }; // an example conversation: user bubbles right, ai dot-rows left

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

function links(text: string, key: number) {
  const out: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <a key={`${key}-${m.index}`} href={m[2]}>
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// `code` spans in body text render as inline-code chips; [text](href) renders as a link.
function rich(text: string) {
  return text.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : links(part, i)));
}

// In an unhighlighted pre: {{text}} = accent span, [[text]] = green span, ((text)) = amber span.
function preContent(text: string) {
  const parts = text.split(/(\{\{.*?\}\}|\[\[.*?\]\]|\(\(.*?\)\))/g);
  if (parts.length === 1) return text;
  return parts.map((p, i) => {
    if (i % 2 === 0) return p;
    if (p.startsWith('{{') && p.endsWith('}}'))
      return (
        <span key={i} className="pg-hl">
          {p.slice(2, -2)}
        </span>
      );
    if (p.startsWith('[[') && p.endsWith(']]'))
      return (
        <span key={i} className="pg-hl-go">
          {p.slice(2, -2)}
        </span>
      );
    if (p.startsWith('((') && p.endsWith('))'))
      return (
        <span key={i} className="pg-hl-sun">
          {p.slice(2, -2)}
        </span>
      );
    return p;
  });
}

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
              <pre className="pg-pre">{preContent(m.pre)}</pre>
            )}
            {m.caption && <p className="pg-cap">{m.caption}</p>}
          </div>
        ) : m.kind === 'chat' ? (
          <div className="pg-media" key={i}>
            <div className="pg-chat">
              {m.turns.map((t, j) =>
                t.role === 'user' ? (
                  <div className="pg-chat-user" key={j}>
                    {t.text}
                  </div>
                ) : (
                  <div className="pg-chat-ai" key={j}>
                    <span className="pg-chat-row">
                      <span className="pg-chat-dot">●</span>
                      <span className="pg-chat-text">{t.text}</span>
                    </span>
                    {t.tools?.map((tool, k) => (
                      <span className="pg-chat-row" key={k}>
                        <span className="pg-chat-dot pg-chat-dot-go">●</span>
                        <span className="pg-chat-tool">{tool}</span>
                      </span>
                    ))}
                  </div>
                ),
              )}
            </div>
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

// mediaFirst: features read title → code → explanation; difficulties keep prose first.
function Subs({ items, mediaFirst = false }: { items: SubSection[]; mediaFirst?: boolean }) {
  return (
    <>
      {items.map((s) => (
        <div className="pg-dec" key={s.title}>
          <h3 className="pg-h3">{s.title}</h3>
          {mediaFirst && <MediaList media={s.media} />}
          {s.body && <p className="pg-prose">{rich(s.body)}</p>}
          {!mediaFirst && <MediaList media={s.media} />}
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
        <p className="pg-lede">{rich(p.line)}</p>
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
        {p.problem.body.split('\n\n').map((para, i) => (
          <p className="pg-prose" key={i}>
            {rich(para)}
          </p>
        ))}
        <MediaList media={p.problem.media} />
        <h2 className="pg-h">features</h2>
        <Subs items={p.features} mediaFirst />
        <h2 className="pg-h">difficulties</h2>
        <Subs items={p.difficulties} />
        <p className="pg-cd">
          <a href="#projects">$ cd ..</a>
          <span className="pg-cursor" />
        </p>
      </Window>
    </div>
  );
}
