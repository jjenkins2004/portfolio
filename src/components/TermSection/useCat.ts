import { useEffect, useState } from 'react';

const CMD_CHAR_MS = 20; // faster than Home's `run info`: these commands are longer
const BLOCK_MS: [number, number] = [120, 260]; // wait before each block prints

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const between = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export type Run = {
  cmd: string; // command typed so far
  n: number; // blocks printed so far
  typing: boolean;
  printing: boolean; // command done, blocks still coming
};

/** Same run as Home: type the command, then print `count` blocks top-down with a random wait before
 * each. `go` false holds the run (a window that is not on screen yet). Skipped under prefers-reduced-motion. */
export function useCat(cmd: string, count: number, go = true): Run {
  const [still] = useState(prefersReducedMotion);
  const [r, setR] = useState(() => (still ? { cmd, n: count } : { cmd: '', n: 0 }));
  useEffect(() => {
    if (still || !go) return;
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
  }, [cmd, count, still, go]);
  const typing = r.cmd.length < cmd.length;
  return { ...r, typing, printing: !typing && r.n < count };
}
