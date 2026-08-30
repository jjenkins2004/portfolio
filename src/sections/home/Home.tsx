import { useEffect, useState } from 'react';
import { profile } from '../../content/profile';
import { rows } from './rows';
import './Home.css';

const CMD = 'run info';
const JUMP = 'JUMP →';
const CMD_CHAR_MS = 35;
const LINE_MS: [number, number] = [180, 420]; // wait before each line prints

type Progress = {
  cmd: string;
  ms: number[]; // one entry per printed line: how long it waited to print
  total: number | null; // whole run, once finished
};

const empty: Progress = { cmd: '', ms: [], total: null };
const complete: Progress = { cmd: CMD, ms: rows.map(() => 0), total: 0 };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const between = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Name, identity, links left. Right: a terminal that prints the facts and a jump into each section, one line at a time, each stamped with how long it waited. */
export function Home() {
  const [still] = useState(prefersReducedMotion);
  const [p, setP] = useState<Progress>(() => (still ? complete : empty));

  useEffect(() => {
    if (still) return;
    let alive = true;
    const set = (f: (prev: Progress) => Progress) => alive && setP(f);

    (async () => {
      await sleep(250);
      for (const ch of CMD) {
        if (!alive) return;
        set((s) => ({ ...s, cmd: s.cmd + ch }));
        await sleep(CMD_CHAR_MS);
      }
      const t0 = performance.now();
      let last = t0;
      for (let i = 0; i < rows.length; i++) {
        await sleep(between(LINE_MS[0], LINE_MS[1]));
        if (!alive) return;
        const now = performance.now();
        const waited = Math.round(now - last);
        last = now;
        set((s) => ({ ...s, ms: [...s.ms, waited] }));
      }
      await sleep(200);
      set((s) => ({ ...s, total: Math.round(performance.now() - t0) }));
    })();

    return () => {
      alive = false;
    };
  }, [still]);

  const cmdDone = p.cmd.length === CMD.length;
  const printing = cmdDone && p.total === null;

  return (
    <div className="home">
      <nav className="home-nav mono">
        <span>~</span>
        <ul>
          {profile.sections.map((s) => (
            <li key={s.id}><a href={`#${s.id}`}>{s.id}/</a></li>
          ))}
        </ul>
      </nav>
      <main className="home-main">
        <div className="home-left">
          <h1 className="home-name">{profile.first}<br />{profile.last}</h1>
          <p className="home-identity todo">{profile.identity}</p>
          <ul className="home-links">
            {profile.links.map((l) => (
              <li key={l.label}><a href={l.href}>{l.label}</a></li>
            ))}
          </ul>
        </div>

        <div className="term" aria-live="polite">
          <div className="term-bar">
            <span className="term-lights" aria-hidden="true"><i /><i /><i /></span>
            <span className="term-title mono">jjenkins — zsh</span>
          </div>
          <div className="term-body mono">
            <p className="term-cmd">
              <span className="term-prompt">$</span> {p.cmd}
              {!cmdDone && <Cursor />}
            </p>
            <ol className="term-lines">
              {rows.map((r, i) => {
                if (p.ms[i] === undefined) return null;
                const n = String(i + 1).padStart(2, '0');
                const ms = still ? '—' : `${p.ms[i]}ms`;
                const level = r.kind === 'value' ? r.level : undefined;
                const todo = r.kind === 'value' && r.todo;
                return (
                  <li key={r.key} className={level ? `term-${level}` : undefined}>
                    <span className="term-n">{n}</span>
                    <span className={`term-level ${level ?? 'info'}`}>{(level ?? 'info').toUpperCase()}</span>
                    <span className="term-key">{r.key}</span>
                    <span className={todo ? 'term-value todo' : 'term-value'}>
                      {r.kind === 'jump' ? <a href={r.href}>{JUMP}</a> : r.value}
                    </span>
                    <span className="term-ms">{ms}</span>
                  </li>
                );
              })}
            </ol>
            {printing && (
              <p className="term-cmd">
                <Cursor />
              </p>
            )}
            {p.total !== null && (
              <p className="term-cmd term-done">
                <span className="term-ok">ok</span>
                {!still && <span className="term-ms"> {(p.total / 1000).toFixed(2)}s</span>}
              </p>
            )}
            {p.total !== null && (
              <p className="term-cmd">
                <span className="term-prompt">$</span> <Cursor />
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Cursor() {
  return <span className="term-cursor" aria-hidden="true" />;
}
