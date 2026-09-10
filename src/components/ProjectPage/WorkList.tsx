import { useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import './WorkList.css';

export type WorkItem = { title: string; line?: string };

/**
 * A list of work items on the same tree the home page draws: a rail with a tick out to each row,
 * numbered in a left gutter. Closed, a row shows its title and a short overview. Open, the overview
 * is replaced by the detail and the row pulls its own header to the top of the viewport; closing it
 * again recentres that row, so the reader keeps their place.
 *
 * One rule governs clicks anywhere in a row: a click toggles it, a drag never does. That leaves
 * selecting prose and scrolling a wide code panel sideways alone without carving out dead zones.
 * Only the header shows a pointer, so the row doesn't advertise itself as one big button.
 */
export default function WorkList<T extends WorkItem>({
  items,
  renderDetail,
}: {
  items: T[];
  renderDetail: (item: T) => ReactNode;
}) {
  const [open, setOpen] = useState(-1);
  const down = useRef({ x: 0, y: 0 });

  function toggle(i: number, isOpen: boolean, el: HTMLElement, moved: boolean) {
    if (moved) return;
    if (el.closest('a')) return;
    if (window.getSelection()?.toString()) return;
    const row = el.closest('.wk-row');
    setOpen(isOpen ? -1 : i);
    if (!row) return;
    // Opening puts the header at the top so the detail reads downward from there. Closing recentres
    // the same row, since collapsing pulls a screen or more of height out from under the reader.
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const block = isOpen ? 'center' : 'start';
    requestAnimationFrame(() =>
      requestAnimationFrame(() => row.scrollIntoView({ block, behavior: smooth ? 'smooth' : 'auto' })),
    );
  }

  return (
    <div className="wk">
      {items.map((item, i) => {
        const on = open === i;
        return (
          <div
            className={'wk-row' + (on ? ' is-on' : '')}
            onMouseDown={(e: MouseEvent<HTMLDivElement>) => {
              down.current = { x: e.clientX, y: e.clientY };
            }}
            onClick={(e: MouseEvent<HTMLDivElement>) => {
              const moved = Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) > 5;
              toggle(i, on, e.target as HTMLElement, moved);
            }}
            key={item.title}
          >
            <span className="wk-n" aria-hidden>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div
              className="wk-head"
              role="button"
              tabIndex={0}
              aria-expanded={on}
              onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                toggle(i, on, e.target as HTMLElement, false);
              }}
            >
              <span className="wk-mark" aria-hidden>
                {on ? '▾' : '▸'}
              </span>
              <span className="wk-title">{item.title}</span>
            </div>
            {on ? <div className="wk-open">{renderDetail(item)}</div> : <p className="wk-over">{item.line}</p>}
          </div>
        );
      })}
    </div>
  );
}
