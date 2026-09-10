import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import './Snake.css';

// Narrow screens get two dots per row so the labels keep room to breathe.
const NARROW = '(max-width: 720px)';
function useNarrow() {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(NARROW).matches);
  useEffect(() => {
    const mq = window.matchMedia(NARROW);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return m;
}

export type SnakeItem = { title: string; when?: string; line?: string };

/** Brings the newly opened chapter into view, centered when it fits, so picking a dot never leaves
 * the reader scrolling to find what they opened. Stays put on first paint. */
function useScrollToDetail(sel: number) {
  const detail = useRef<HTMLDivElement>(null);
  const opened = useRef(false);
  useEffect(() => {
    const el = detail.current;
    if (!opened.current) {
      opened.current = true;
      return;
    }
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fits = el.getBoundingClientRect().height < window.innerHeight * 0.9;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: fits ? 'center' : 'start' });
  }, [sel]);
  return detail;
}

/**
 * A list on one path: rows of `perRow` numbered dots joined by a line, every row turning back the
 * other way through a half-circle at the edge, arrowheads on the line showing the way, so the whole
 * list is on screen at once. Each dot shows its date and title; the selected item's detail opens
 * under its own row, in a card, with prev/next. The path is tinted accent; the part already walked
 * (line, arrowheads, turns, dot rings) is solid accent.
 */
export default function Snake<T extends SnakeItem>({
  items,
  perRow = 4,
  renderDetail,
}: {
  items: T[];
  perRow?: number;
  renderDetail: (item: T) => ReactNode;
}) {
  const [sel, setSel] = useState(0);
  const detail = useScrollToDetail(sel);
  const narrow = useNarrow();
  if (narrow) perRow = Math.min(perRow, 2);
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += perRow) rows.push(items.slice(i, i + perRow));
  const center = (k: number) => ((k + 0.5) / perRow) * 100; // % from the row's visual left edge
  const activeRow = Math.floor(sel / perRow);
  const kSel = sel - activeRow * perRow;
  return (
    <div className="sn" style={{ '--per': perRow } as CSSProperties}>
      {rows.map((row, r) => {
        const rtl = r % 2 === 1;
        const first = r === 0;
        const last = r === rows.length - 1;
        const n = row.length;
        // Where the line starts and ends, as % from the visual left and right edges.
        let left = 0;
        let right = 0;
        if (!rtl) {
          if (first) left = center(0);
          if (last) right = 100 - center(n - 1);
        } else {
          if (first) right = center(0);
          if (last) left = 100 - center(n - 1);
        }
        // How much of this row's line has been walked, from the row's own start.
        const span = 100 - right - left;
        const walked = rtl ? center(kSel) - right : center(kSel) - left;
        const fill = r < activeRow ? 100 : r > activeRow ? 0 : span > 0 ? (walked / span) * 100 : 100;
        return (
          <div className={'sn-seg' + (rtl ? ' is-rtl' : '') + (r < activeRow ? ' is-done' : '')} key={r}>
            <div
              className="sn-row"
              style={{ '--l': left + '%', '--r': right + '%', '--fill': fill + '%' } as CSSProperties}
            >
              {Array.from({ length: n - 1 }, (_, j) => {
                // b = visual boundary index from the left; on a right-to-left row the items sit on the right.
                const b = rtl ? perRow - n + j : j;
                // steps walked past this boundary: boundary b is between items (b, b+1) left-to-right,
                // and between items (perRow-2-b, perRow-1-b) right-to-left
                const done = r < activeRow || (r === activeRow && (rtl ? perRow - 2 - b < kSel : b < kSel));
                return (
                  <span
                    className={'sn-arrow' + (done ? ' is-done' : '')}
                    style={{ '--x': ((b + 1) / perRow) * 100 + '%' } as CSSProperties}
                    aria-hidden
                    key={b}
                  />
                );
              })}
              {row.map((item, k) => {
                const i = r * perRow + k;
                return (
                  <button
                    className={'sn-step' + (i === sel ? ' is-active' : '') + (i < sel ? ' is-past' : '')}
                    type="button"
                    aria-pressed={i === sel}
                    onClick={() => setSel(i)}
                    key={item.title}
                  >
                    <span className="sn-dot" aria-hidden>
                      {i + 1}
                    </span>
                    {item.when && <span className="sn-when">{item.when}</span>}
                    <span className="sn-title">{item.title}</span>
                  </button>
                );
              })}
            </div>
            {r === activeRow && (
              <div className="sn-detail" ref={detail} key={sel}>
                {renderDetail(items[sel])}
                <div className="sn-nav">
                  <button type="button" className="sn-btn" disabled={sel === 0} onClick={() => setSel(sel - 1)}>
                    ← {sel > 0 ? items[sel - 1].title : 'start'}
                  </button>
                  <button type="button" className="sn-btn" disabled={sel === items.length - 1} onClick={() => setSel(sel + 1)}>
                    {sel < items.length - 1 ? items[sel + 1].title : 'end'} →
                  </button>
                </div>
              </div>
            )}
            {!last && <span className="sn-turn" aria-hidden />}
          </div>
        );
      })}
    </div>
  );
}
