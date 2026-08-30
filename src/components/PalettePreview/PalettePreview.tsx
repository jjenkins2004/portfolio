import type { CSSProperties } from 'react';
import type { Palette, Theme } from '../../styles/theme';
import { contrast } from '../../styles/contrast';
import './PalettePreview.css';

type Props = { palette: Palette };

/** The palette, both themes side by side, each pane pinned to its own colors regardless of the viewer's theme. */
export function PalettePreview({ palette }: Props) {
  const f = palette.fonts;
  const fontVars = {
    '--font-display': f.display,
    '--font-body': f.body,
    '--font-mono': f.mono,
    '--display-weight': f.displayWeight,
    '--display-transform': f.displayTransform ?? 'none',
    '--display-tracking': f.displayTracking ?? '-0.02em',
    '--display-stretch': f.displayStretch ?? '100%',
  } as CSSProperties;
  return (
    <div className="pp" style={fontVars}>
      <div className="pp-head">
        <h2>{palette.name}</h2>
        <p>{palette.note}</p>
        <p className="pp-fonts">
          {family(f.display)} / {family(f.body)} / {family(f.mono)}
        </p>
      </div>
      <div className="pp-panes">
        <Pane theme={palette.light} label="light" isDefault={palette.defaultTheme === 'light'} />
        <Pane theme={palette.dark} label="dark" isDefault={palette.defaultTheme === 'dark'} />
      </div>
    </div>
  );
}

/** first family name out of a font stack */
function family(stack: string): string {
  return stack.split(',')[0].replace(/'/g, '').trim();
}

function Pane({ theme, label, isDefault }: { theme: Theme; label: string; isDefault: boolean }) {
  const vars = {
    '--bg': theme.bg,
    '--bg-raised': theme.bgRaised,
    '--ink': theme.ink,
    '--ink-muted': theme.inkMuted,
    '--line': theme.line,
    '--accent': theme.accent,
    '--accent-strong': theme.accentStrong,
    '--pop': theme.pop,
    '--pop-ink': theme.popInk,
  } as CSSProperties;

  return (
    <div className="pane" style={vars}>
      <div className="pane-label">
        {label} {isDefault && <b>· default</b>}
      </div>
      <div className="hero">
        <p className="name">Joshua Jenkins</p>
        <p className="id">I build deterministic pipelines around LLMs.</p>
        <p className="status">MS CS · USC ’27 · open to founding / FDE roles</p>
        <div className="links">
          <a href="#">GitHub</a>
          <a href="#">LinkedIn</a>
          <a href="#">Email</a>
          <a href="#">Resume</a>
        </div>
      </div>
      <p className="section-title">Selected work</p>
      <div className="card">
        <b>Stepper</b>
        <p>
          A flow is a step made of steps. Wiring errors raise at import; runs resume mid-loop from disk.{' '}
          <a href="#">Read the case →</a>
        </p>
        <div className="tags">
          <span className="on">python</span>
          <span>asyncio</span>
          <span>pydantic</span>
          <span>2026 —</span>
        </div>
      </div>
      <Swatches theme={theme} />
    </div>
  );
}

const roles: Array<[keyof Theme, string]> = [
  ['bg', 'bg'],
  ['bgRaised', 'raised'],
  ['ink', 'ink'],
  ['inkMuted', 'muted'],
  ['line', 'line'],
  ['accent', 'accent'],
  ['pop', 'pop'],
];

function Swatches({ theme }: { theme: Theme }) {
  return (
    <div className="swatches">
      {roles.map(([key, name]) => {
        const hex = theme[key];
        // text roles are measured on the ground; pop as a fill under its own ink; raised as a fill on the ground
        const ratio = key === 'pop' ? contrast(theme.popInk, hex) : contrast(hex, theme.bg);
        const show = key !== 'bg' && key !== 'line';
        const pass = key === 'bgRaised' ? ratio >= 1.12 : ratio >= 4.5;
        return (
          <div className="sw" key={key}>
            <i style={{ background: hex }} />
            <em>{name}</em>
            <span>{hex}</span>
            {show && <span className={pass ? 'cr ok' : 'cr'}>{ratio.toFixed(1)}:1</span>}
          </div>
        );
      })}
    </div>
  );
}
