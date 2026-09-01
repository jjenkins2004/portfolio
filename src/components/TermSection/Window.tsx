import type { ReactNode } from 'react';
import './TermSection.css';

// Shared mac-style terminal window chrome (TermSection, ProjectPage, App's not-found).
export default function Window({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="tsec">
      <div className="tsec-bar">
        <span className="tsec-lights">
          <i />
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
