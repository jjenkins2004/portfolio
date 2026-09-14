import type { ReactNode } from 'react';
import './TermSection.css';

// Shared mac-style terminal window chrome (TermSection, ProjectPage, App's not-found).
// With `close`, the red light is a link there and shows its × on hover, like a real close button.
export default function Window({ title, close, children }: { title: string; close?: string; children: ReactNode }) {
  return (
    <section className="tsec">
      <div className="tsec-bar">
        <span className="tsec-lights">
          {close ? <a className="tsec-close" href={close} aria-label="Close" /> : <i />}
          <i />
          <i />
        </span>
        <span className="tsec-title">{title}</span>
        <span />
      </div>
      <div className="tsec-body">{children}</div>
    </section>
  );
}
