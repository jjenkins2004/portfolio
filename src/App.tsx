import { useEffect, useRef, useState } from 'react';
import ElsewherePage from './components/ProjectPage/ElsewherePage';
import ExperiencePage from './components/ProjectPage/ExperiencePage';
import ProjectPage from './components/ProjectPage/ProjectPage';
import TermSection from './components/TermSection/TermSection';
import Window from './components/TermSection/Window';
import { elsewhere } from './content/elsewhere';
import { experience } from './content/experience';
import { elsewherePages, experiencePages, pages } from './content/pages';
import { pageTitle, SITE_NAME } from './content/meta';
import { profile } from './content/profile';
import { projects } from './content/projects';
import { Home } from './sections/home/Home';

const PAGE = /^\/(projects|experience|elsewhere)\/([\w-]+)\/?$/;
// the links the app routes itself: home (with or without a section hash) and a page
const INTERNAL = /^\/(#[\w-]*)?$|^\/(projects|experience|elsewhere)\/[\w-]+\/?$/;

// pages used to live behind #/section/slug; an old link lands on its path
{
  const old = window.location.hash.match(/^#\/((projects|experience|elsewhere)\/[\w-]+)$/);
  if (old) window.history.replaceState(null, '', '/' + old[1]);
}

/** The path, kept current through the app's own links and the back button. A same-path link (a section jump) is left to the browser. */
function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const on = () => setPath(window.location.pathname);
    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest('a');
      const href = a?.getAttribute('href');
      if (!a || !href || a.target || !INTERNAL.test(href)) return;
      if (new URL(href, window.location.href).pathname === window.location.pathname) return;
      e.preventDefault();
      window.history.pushState(null, '', href);
      on();
    };
    window.addEventListener('popstate', on);
    document.addEventListener('click', click);
    return () => {
      window.removeEventListener('popstate', on);
      document.removeEventListener('click', click);
    };
  }, []);
  return path;
}

const SECTIONS = ['home', 'projects', 'experience', 'elsewhere'];

const initialSection = () => {
  const id = window.location.hash.slice(1);
  return SECTIONS.includes(id) ? id : 'home';
};

/** Track which section owns the viewport, for the nav's path and lit link. */
function useActiveSection(on: boolean) {
  const [active, setActive] = useState(initialSection);
  const current = useRef(active);
  useEffect(() => {
    current.current = active;
  }, [active]);

  useEffect(() => {
    if (!on) return;
    // back from a page (or a deep link): the section is not in the DOM when the hash changes, so the browser never scrolls to it
    const id = initialSection();
    if (id !== 'home') document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    let raf = 0;
    const check = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let cur = SECTIONS[0];
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= mid) cur = id;
      }
      if (cur !== current.current) setActive(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [on]);
  return active;
}

// Each window starts its own run when it scrolls into view.
function Section({ id }: { id: string }) {
  if (id === 'home') return <Home />;
  if (id === 'projects') return <TermSection dir="projects" items={projects} />;
  if (id === 'experience') return <TermSection dir="experience" items={experience} />;
  return <TermSection dir="elsewhere" items={elsewhere} />;
}

function SiteNav({ active }: { active: string }) {
  return (
    <nav className="site-nav mono">
      <span>~{active === 'home' ? '' : `/${active}`}</span>
      <ul>
        {profile.sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-current={active === s.id ? 'true' : undefined}>{s.id}/</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function NotFound({ path }: { path: string }) {
  return (
    <div className="pg-page">
      <Window title="jjenkins — zsh" close="/">
        <p className="pg-cmd">
          <span className="pg-prompt">$ </span>cd ~/jjenkins/{path}
        </p>
        <p className="pg-mono">zsh: no such page (yet): {path}</p>
        <p className="pg-cd">
          <a href="/#projects">$ cd ..</a>
        </p>
      </Window>
    </div>
  );
}

export default function App() {
  const path = usePath();
  const route = path.match(PAGE);
  const active = useActiveSection(!route);
  const [, section = '', slug = ''] = route ?? [];
  useEffect(() => {
    document.title = route ? pageTitle(section, slug) : SITE_NAME;
  }, [route, section, slug]);
  if (route) {
    if (section === 'projects' && pages[slug]) return <ProjectPage key={slug} p={pages[slug]} />; // key: a fresh run per page
    if (section === 'experience' && Object.hasOwn(experiencePages, slug)) return <ExperiencePage key={slug} p={experiencePages[slug]} />;
    if (section === 'elsewhere' && Object.hasOwn(elsewherePages, slug)) return <ElsewherePage key={slug} p={elsewherePages[slug]} />;
    return <NotFound path={section + '/' + slug} />;
  }
  return (
    <>
      <SiteNav active={active} />
      <main>
        {SECTIONS.map((id) => (
          <section className="flat" id={id} key={id}>
            <Section id={id} />
          </section>
        ))}
      </main>
    </>
  );
}
