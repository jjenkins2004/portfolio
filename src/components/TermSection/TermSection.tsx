import './TermSection.css';

export type TermItem = {
  name: string;
  href?: string; // whole entry (name row + line) becomes one link
  dim?: string; // muted suffix after the name (org on a role)
  badge?: { text: string; tone: 'pop' | 'soft' | 'line' }; // unused for now; label vocabulary is a later decision
  note?: string; // inline one-liner, muted (compact leaf rows)
  meta?: string; // right-aligned mono (stack, dates)
  line?: string; // one-line summary under the node
  hot?: boolean; // standout: its line number renders as a pink chip
  children?: TermItem[];
};

function Node({ item, nums }: { item: TermItem; nums: Map<TermItem, string> }) {
  const body = (
    <div className="tsec-hit">
      <div className="tsec-node">
        <span className={'tsec-name' + (item.children ? ' is-dir' : '')}>{item.name}</span>
        {item.dim && <span className="tsec-dim">· {item.dim}</span>}
        {item.badge && <span className={'tsec-badge ' + item.badge.tone}>{item.badge.text}</span>}
        {item.note && <span className="tsec-note">{item.note}</span>}
        {item.meta && <span className="tsec-meta">{item.meta}</span>}
      </div>
      {item.line && (
        <div className="tsec-kids">
          <p className="tsec-line">{item.line}</p>
        </div>
      )}
    </div>
  );
  return (
    <div className={'tsec-item' + (item.hot ? ' hot' : '')}>
      <span className="tsec-n">{nums.get(item)}</span>
      {item.href ? (
        <a className="tsec-link" href={item.href}>
          {body}
        </a>
      ) : (
        body
      )}
      {item.children && (
        <div className="tsec-kids">
          <div className="tsec-tree">
            {item.children.map((c) => (
              <Node key={c.name} item={c} nums={nums} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TermSection({ dir, items }: { dir: string; items: TermItem[] }) {
  // Line numbers count tree entries only; description lines hang unnumbered like wrapped output.
  const nums = new Map<TermItem, string>();
  let n = 1;
  const walk = (list: TermItem[]) => {
    for (const it of list) {
      n += 1;
      nums.set(it, String(n).padStart(2, '0'));
      if (it.children) walk(it.children);
    }
  };
  walk(items);
  return (
    <section className="tsec" aria-label={dir}>
      <div className="tsec-bar">
        <span className="tsec-lights">
          <i />
          <i />
          <i />
        </span>
        <span className="tsec-title">jjenkins/{dir} — zsh</span>
        <span />
      </div>
      <div className="tsec-body">
        <p className="tsec-cmd">
          <span className="tsec-prompt">$ </span>tree ~/jjenkins/{dir}
        </p>
        <p className="tsec-dir tsec-root">
          <span className="tsec-n">01</span>
          {dir}/
        </p>
        <div className="tsec-tree">
          {items.map((i) => (
            <Node key={i.name} item={i} nums={nums} />
          ))}
        </div>
      </div>
    </section>
  );
}
