import { useEffect, useMemo, useState, type CSSProperties, type ReactElement } from 'react';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import Window from '../TermSection/Window';
import Snake from './Snake';
import WorkList from './WorkList';
import './ProjectPage.css';

hljs.registerLanguage('python', python);
hljs.registerLanguage('typescript', typescript);

const CMD_CHAR_MS = 20; // the command is ~6x longer than Home's `run info`, so it types faster
const BLOCK_MS: [number, number] = [120, 260]; // wait before each block prints

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const between = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type Run = { cmd: string; n: number }; // command typed so far; blocks printed so far

// Same run as Home: type the command, then print the blocks top-down with a random wait before each.
function useCat(cmd: string, count: number, still: boolean): Run {
  const [r, setR] = useState<Run>(() => (still ? { cmd, n: count } : { cmd: '', n: 0 }));
  useEffect(() => {
    if (still) return;
    let alive = true;
    (async () => {
      await sleep(250);
      for (let i = 1; i <= cmd.length; i++) {
        if (!alive) return;
        setR((s) => ({ ...s, cmd: cmd.slice(0, i) }));
        await sleep(CMD_CHAR_MS);
      }
      for (let i = 1; i <= count; i++) {
        await sleep(between(BLOCK_MS[0], BLOCK_MS[1]));
        if (!alive) return;
        setR((s) => ({ ...s, n: i }));
      }
    })();
    return () => {
      alive = false;
    };
  }, [cmd, count, still]);
  return r;
}

export type ChatTurn = { role: 'user' | 'ai'; text: string; tools?: string[] };

export type VideoClip = { src: string; cap?: string };

export type Media =
  // `tight` closes the line gaps so box drawing characters join into solid rules; only diagrams need it.
  | { kind: 'pre'; pre: string; caption?: string; lang?: 'python' | 'typescript'; tight?: boolean } // code (highlighted when lang set) or ascii diagram
  | { kind: 'anim'; frames: string[]; ms?: number; caption?: string; tight?: boolean } // looping ascii animation; frames share one fixed size
  | { kind: 'anim'; base: string; path: Cell[]; run?: number; ms?: number; caption?: string; tight?: boolean } // one diagram with a green pulse of `run` cells sliding along `path`
  | { kind: 'img'; src: string; alt: string; caption?: string }
  | { kind: 'chat'; turns: ChatTurn[]; caption?: string } // an example conversation: user bubbles right, ai dot-rows left
  | { kind: 'video'; clips: VideoClip[]; caption?: string }; // phone screen recordings in one row, muted loop, device bezel

// A photo on a snake chapter. `w`/`h` are the file's own pixels: the layout sizes from that aspect.
// `phone` frames app screenshots in a device bezel; real photos go without one.
// A spot on a diagram: row, then column counted on the rendered text (markers stripped).
export type Cell = [number, number];

export type Photo = { src: string; alt: string; w: number; h: number; cap?: string; phone?: boolean };

// A labelled block: a mono label naming the idea, then prose, then media. Media can sit in any block,
// so a diagram lands next to the paragraph it belongs to instead of at the bottom. `mediaFirst` puts it
// above the prose. The label is optional, for a block that is only a picture or only prose.
export type Block = { label?: string; body?: string; media?: Media[]; mediaFirst?: boolean };

// One titled sub-section; `when` is an optional period shown right of the title, `line` a one-line summary the snake and work layouts show.
// A sub may hold its own `subs` on a `layout`, so one section can split into parts (a timeline, then a work tree).
export type SubSection = { title: string; when?: string; line?: string; body?: string; blocks?: Block[]; media?: Media[]; photos?: Photo[]; subs?: SubSection[]; layout?: 'snake' | 'work' };

// One h2 block: prose (body splits on `\n\n`), labelled blocks, and/or a list of sub-sections. `layout: 'snake'` puts the subs on a
// winding path (date + title per dot) with the selected one below it; `layout: 'work'` puts them on a tree, each
// row showing its `line` as an overview until it is opened. Both beat stacking every sub at full height.
export type PageSection = { title: string; note?: string; body?: string; blocks?: Block[]; media?: Media[]; subs?: SubSection[]; mediaFirst?: boolean; layout?: 'snake' | 'work' };

// One header fact row: pink label, mono text, optional link.
export type Fact = { label: string; text: string; href?: string };

export type PageViewProps = {
  dir: 'projects' | 'experience';
  slug: string;
  name: string;
  dates: string; // right of the name
  line: string; // same one-liner the tree shows
  facts: Fact[];
  sections: PageSection[];
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
const MARK = /(\{\{.*?\}\}|\[\[.*?\]\]|\(\(.*?\)\))/g;

function preContent(text: string) {
  const parts = text.split(MARK);
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

// Wrap the character at rendered column `c` of one source row in the green marker. The row's own
// marker delimiters are skipped when counting columns; a pulse never lands inside another marker.
function litCell(row: string, c: number): string {
  const parts = row.split(MARK);
  let src = 0;
  let col = 0;
  for (let i = 0; i < parts.length; i++) {
    const marker = i % 2 === 1;
    const len = parts[i].length - (marker ? 4 : 0);
    if (c < col + len) {
      const at = src + (marker ? 2 : 0) + (c - col);
      return row.slice(0, at) + '[[' + row[at] + ']]' + row.slice(at + 1);
    }
    src += parts[i].length;
    col += len;
  }
  return row + ' '.repeat(c - col) + '[[ ]]';
}

// The frames of a pulse: `run` lit cells sliding one cell per frame along `path` (vertices joined by
// straight legs), growing in from the start and draining off the end before the loop restarts.
function pulseFrames(base: string, path: Cell[], run: number): string[] {
  const cells: Cell[] = [];
  path.forEach(([r, c], i) => {
    if (i === 0) return cells.push([r, c]);
    const [pr, pc] = path[i - 1];
    const n = Math.max(Math.abs(r - pr), Math.abs(c - pc));
    for (let k = 1; k <= n; k++) cells.push([pr + Math.sign(r - pr) * k, pc + Math.sign(c - pc) * k]);
  });
  const rows = base.split('\n');
  const frames: string[] = [];
  for (let k = 0; k < cells.length + run - 1; k++) {
    const lit = cells.slice(Math.max(0, k - run + 1), Math.min(k + 1, cells.length));
    const out = rows.slice();
    // rightmost cell of a row first, so earlier insertions keep their columns
    for (const [r, c] of [...lit].sort((x, y) => x[0] - y[0] || y[1] - x[1])) out[r] = litCell(out[r], c);
    frames.push(out.join('\n'));
  }
  return frames;
}

function PulseBlock({ base, path, run = 12, ms, tight }: { base: string; path: Cell[]; run?: number; ms?: number; tight?: boolean }) {
  const frames = useMemo(() => pulseFrames(base, path, run), [base, path, run]);
  return <AnimBlock frames={frames} ms={ms} tight={tight} />;
}

function AnimBlock({ frames, ms = 450, tight }: { frames: string[]; ms?: number; tight?: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % frames.length), ms);
    return () => clearInterval(t);
  }, [frames.length, ms]);
  return <pre className={'pg-pre pg-anim' + (tight ? ' pg-pre-tight' : '')}>{preContent(frames[i])}</pre>;
}

function VideoRow({ clips }: { clips: VideoClip[] }) {
  return (
    <div className="pg-vids">
      {clips.map((c) => (
        <figure className="pg-vid" key={c.src}>
          <div className="pg-vid-frame">
            <video src={c.src} muted autoPlay loop playsInline />
          </div>
          {c.cap && <figcaption className="pg-cap">{c.cap}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

function MediaList({ media }: { media?: Media[] }) {
  if (!media?.length) return null;
  return (
    <>
      {media.map((m, i) =>
        m.kind === 'anim' ? (
          <div className="pg-media" key={i}>
            {'frames' in m ? <AnimBlock frames={m.frames} ms={m.ms} tight={m.tight} /> : <PulseBlock base={m.base} path={m.path} run={m.run} ms={m.ms} tight={m.tight} />}
            {m.caption && <p className="pg-cap">{m.caption}</p>}
          </div>
        ) : m.kind === 'pre' ? (
          <div className="pg-media" key={i}>
            {m.lang ? (
              <pre className={m.tight ? 'pg-pre pg-pre-tight' : 'pg-pre'} dangerouslySetInnerHTML={{ __html: hljs.highlight(m.pre, { language: m.lang }).value }} />
            ) : (
              <pre className={m.tight ? 'pg-pre pg-pre-tight' : 'pg-pre'}>{preContent(m.pre)}</pre>
            )}
            {m.caption && <p className="pg-cap">{m.caption}</p>}
          </div>
        ) : m.kind === 'video' ? (
          <div className="pg-media" key={i}>
            <VideoRow clips={m.clips} />
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

function Blocks({ items }: { items: Block[] }) {
  return (
    <>
      {items.map((b, i) => (
        <div className="pg-blk" key={i}>
          {b.label && <span className="pg-blk-lab">{b.label}</span>}
          {b.mediaFirst && <MediaList media={b.media} />}
          <Prose body={b.body} />
          {!b.mediaFirst && <MediaList media={b.media} />}
        </div>
      ))}
    </>
  );
}

// A list of subs on the layout asked for: a snake, a work tree, or plain titled blocks. `nested` marks a
// list inside a sub, whose snake titles step down to h4.
function SubList({ subs, layout, mediaFirst, nested = false }: { subs: SubSection[]; layout?: 'snake' | 'work'; mediaFirst?: boolean; nested?: boolean }) {
  if (layout === 'snake') return <Snake items={subs} renderDetail={(s) => SnakeDetail(s, nested)} />;
  if (layout === 'work') return <WorkList items={subs} renderDetail={WorkDetail} />;
  return <Subs items={subs} mediaFirst={mediaFirst} />;
}

// mediaFirst: features read title → code → explanation; difficulties keep prose first.
function Subs({ items, mediaFirst = false }: { items: SubSection[]; mediaFirst?: boolean }) {
  return (
    <>
      {items.map((s) => (
        <div className="pg-dec" key={s.title}>
          {s.when ? (
            <div className="pg-dec-head">
              <h3 className="pg-h3">{s.title}</h3>
              <span className="pg-meta">{s.when}</span>
            </div>
          ) : (
            <h3 className="pg-h3">{s.title}</h3>
          )}
          {mediaFirst && <MediaList media={s.media} />}
          {s.body && <p className="pg-prose">{rich(s.body)}</p>}
          {s.blocks && <Blocks items={s.blocks} />}
          {!mediaFirst && <MediaList media={s.media} />}
          {s.subs && <SubList subs={s.subs} layout={s.layout} nested />}
        </div>
      ))}
    </>
  );
}

function PhotoFigure({ p }: { p: Photo }) {
  const img = <img src={p.src} alt={p.alt} />;
  return (
    <figure className="pg-photo" style={{ '--a': p.w / p.h } as CSSProperties}>
      {p.phone ? <div className="pg-photo-frame">{img}</div> : img}
      {p.cap && <figcaption className="pg-cap">{p.cap}</figcaption>}
    </figure>
  );
}

function Prose({ body }: { body?: string }) {
  return (
    <>
      {body?.split('\n\n').map((para, i) => (
        <p className="pg-prose" key={i}>
          {rich(para)}
        </p>
      ))}
    </>
  );
}

// An opened work item: its prose, then media. The title stays in the row's header. An item written as
// labelled blocks renders those instead, so its diagrams sit with the paragraphs they explain.
function WorkDetail(s: SubSection) {
  return (
    <>
      <Prose body={s.body} />
      {s.blocks && <Blocks items={s.blocks} />}
      <MediaList media={s.media} />
    </>
  );
}

// The selected snake item: title and period (h4 when the snake sits inside a sub), its one-liner, body paragraphs, then media.
// One photo sits beside the prose; two share a row under it, equal height, each as wide as its aspect
// makes it. `--sum` is the aspects added up, which caps how tall the row can get.
function SnakeDetail(s: SubSection, nested = false) {
  const photos = s.photos ?? [];
  const beside = photos.length === 1;
  return (
    <>
      <div className="pg-dec-head">
        {nested ? <h4 className="pg-h4">{s.title}</h4> : <h3 className="pg-h3">{s.title}</h3>}
        {s.when && <span className="pg-meta">{s.when}</span>}
      </div>
      {beside ? (
        // The photo floats from the one-liner down, so it sits under the date and the prose wraps it.
        <div className="pg-beside">
          <PhotoFigure p={photos[0]} />
          {s.line && <p className="sn-line">{s.line}</p>}
          <Prose body={s.body} />
        </div>
      ) : (
        <>
          {s.line && <p className="sn-line">{s.line}</p>}
          <Prose body={s.body} />
          {photos.length > 0 && (
            <div
              className="pg-photos"
              style={{ '--sum': photos.reduce((t, p) => t + p.w / p.h, 0) } as CSSProperties}
            >
              {photos.map((p) => (
                <PhotoFigure p={p} key={p.src} />
              ))}
            </div>
          )}
        </>
      )}
      {s.blocks && <Blocks items={s.blocks} />}
      <MediaList media={s.media} />
    </>
  );
}

// One section as the blocks the run prints: h2, note, each paragraph, each labelled block, each media,
// then the subs — one block per sub, or the whole snake / work tree as one.
function sectionBlocks(s: PageSection): ReactElement[] {
  const k = s.title;
  const subs = !s.subs
    ? []
    : s.layout
      ? [<SubList subs={s.subs} layout={s.layout} mediaFirst={s.mediaFirst} key={k + '/subs'} />]
      : s.subs.map((sub) => <Subs items={[sub]} mediaFirst={s.mediaFirst} key={k + '/' + sub.title} />);
  return [
    <h2 className="pg-h" key={k}>
      {s.title}
    </h2>,
    ...(s.note ? [<p className="pg-note" key={k + '/note'}>{rich(s.note)}</p>] : []),
    ...(s.body?.split('\n\n') ?? []).map((para, i) => <Prose body={para} key={`${k}/p${i}`} />),
    ...(s.blocks ?? []).map((b, i) => <Blocks items={[b]} key={`${k}/b${i}`} />),
    ...(s.media ?? []).map((m, i) => <MediaList media={[m]} key={`${k}/m${i}`} />),
    ...subs,
  ];
}

/** One terminal window running `cat README.md`: header, fact rows, then h2 sections. ProjectPage and ExperiencePage adapt their data to this.
 *  Runs like Home: the command types, then each block prints top-down with a fade; skipped under prefers-reduced-motion. */
export default function PageView({ dir, slug, name, dates, line, facts, sections }: PageViewProps) {
  const cmd = `cd ~/jjenkins/${dir}/${slug} && cat README.md`;
  const blocks: ReactElement[] = [
    <div className="pg-head" key="head">
      <span className="pg-name">{name}</span>
      <span className="pg-meta">{dates}</span>
    </div>,
    <p className="pg-lede" key="lede">
      {rich(line)}
    </p>,
    <div className="pg-facts" key="facts">
      {facts.map((f) => (
        <p className="pg-mono" key={f.label}>
          <span className="pg-lab">{f.label}</span>
          {f.href ? (
            <a className="pg-remote" href={f.href}>
              {f.text}
            </a>
          ) : (
            f.text
          )}
        </p>
      ))}
    </div>,
    ...sections.flatMap(sectionBlocks),
    <p className="pg-cd" key="cd">
      <a href={'#' + dir}>$ cd ..</a>
      <span className="pg-cursor" />
    </p>,
  ];
  const [still] = useState(prefersReducedMotion);
  const run = useCat(cmd, blocks.length, still);
  const typing = run.cmd.length < cmd.length;
  const printing = !typing && run.n < blocks.length;
  return (
    <div className="pg-page">
      <Window title={'jjenkins/' + dir + '/' + slug + ' — zsh'}>
        <p className="pg-cmd">
          <span className="pg-prompt">$ </span>
          {run.cmd}
          {typing && <span className="pg-cursor" />}
        </p>
        {blocks.slice(0, run.n).map((b) => (
          <div className="pg-b" key={b.key}>
            {b}
          </div>
        ))}
        {printing && (
          <p className="pg-cmd">
            <span className="pg-cursor" />
          </p>
        )}
      </Window>
    </div>
  );
}
