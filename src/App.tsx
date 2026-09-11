import { useEffect, useRef, useState } from 'react';
import ExperiencePage from './components/ProjectPage/ExperiencePage';
import ProjectPage from './components/ProjectPage/ProjectPage';
import TermSection from './components/TermSection/TermSection';
import Window from './components/TermSection/Window';
import { elsewhere } from './content/elsewhere';
import { experience } from './content/experience';
import { experiencePages, pages } from './content/pages';
import { profile } from './content/profile';
import { projects } from './content/projects';
import { Home } from './sections/home/Home';

function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

const SLIDES = ['home', 'projects', 'experience', 'elsewhere'];

const initialSlide = () => {
  const id = window.location.hash.slice(1);
  return SLIDES.includes(id) ? id : 'home';
};

function useMedia(q: string) {
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
}

/**
 * Wide screens: the document scrolls across one invisible 100vh step per slide while the
 * slides sit fixed and crossfade. Fade is a pure function of scroll position; gestures,
 * momentum and settling are the browser's native scroll + scroll-snap physics — no wheel
 * hijacking, no locks, no gesture inference.
 *
 * `active` flips at the midpoint of a step (nav, hash); `shown` is the slide fully in view, only
 * while the scroll sits on its step. A window starts its run on `shown`, never mid-transition.
 */
function useDeck(on: boolean) {
  const [active, setActive] = useState(initialSlide);
  const [shown, setShown] = useState<string | null>(null);
  const current = useRef(active);
  const shownRef = useRef(shown);
  useEffect(() => {
    current.current = active;
  }, [active]);

  useEffect(() => {
    if (!on) return;
    let raf = 0;
    const stepH = () => document.querySelector('.step')?.getBoundingClientRect().height || window.innerHeight;
    const paint = () => {
      raf = 0;
      const p = Math.min(Math.max(window.scrollY / stepH(), 0), SLIDES.length - 1);
      const i = Math.floor(p);
      const f = p - i;
      // fade with a buffer, never two slides overlaid: outgoing is gone by 30% of the
      // step, incoming starts at 70%, bare background between
      const out = Math.max(0, 1 - f / 0.3);
      const inc = Math.max(0, (f - 0.7) / 0.3);
      SLIDES.forEach((id, k) => {
        const el = document.getElementById(`s-${id}`);
        if (!el) return;
        const op = k === i ? out : k === i + 1 ? inc : 0;
        el.style.opacity = String(op);
        el.style.visibility = op > 0.001 ? 'visible' : 'hidden';
      });
      const k = Math.round(p);
      const near = SLIDES[k];
      if (near !== current.current) {
        setActive(near);
        history.replaceState(null, '', `#${near}`);
      }
      const settled = Math.abs(p - k) < 0.01 ? near : null;
      if (settled !== shownRef.current) {
        shownRef.current = settled;
        setShown(settled);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const dir = ['ArrowDown', 'PageDown', ' '].includes(e.key) ? 1
        : ['ArrowUp', 'PageUp'].includes(e.key) ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const h = stepH();
      const i = Math.round(window.scrollY / h) + dir;
      if (i < 0 || i >= SLIDES.length) return;
      window.scrollTo({ top: i * h });
    };
    paint();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('keydown', onKey);
    };
  }, [on]);
  return { active, shown };
}

/** Narrow or short screens: plain stacked sections, native scrolling; track which section owns the viewport for the nav. */
function useFlatActive(on: boolean) {
  const [active, setActive] = useState(initialSlide);
  const current = useRef(active);
  useEffect(() => {
    current.current = active;
  }, [active]);

  useEffect(() => {
    if (!on) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let cur = SLIDES[0];
      for (const id of SLIDES) {
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

// `active` (slide fully in view) is only known on the deck; flat pages let each window start itself when it scrolls into view.
function Section({ id, active }: { id: string; active?: boolean }) {
  if (id === 'home') return <Home />;
  if (id === 'projects') return <TermSection dir="projects" items={projects} active={active} />;
  if (id === 'experience') return <TermSection dir="experience" items={experience} active={active} />;
  return <TermSection dir="elsewhere" items={elsewhere} active={active} />;
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
      <Window title="jjenkins — zsh">
        <p className="pg-cmd">
          <span className="pg-prompt">$ </span>cd ~/jjenkins/{path}
        </p>
        <p className="pg-mono">zsh: no such page (yet): {path}</p>
        <p className="pg-cd">
          <a href="#projects">$ cd ..</a>
        </p>
      </Window>
    </div>
  );
}

export default function App() {
  const hash = useHash();
  const route = hash.match(/^#\/(projects|experience|elsewhere)\/([\w-]+)$/);
  const flat = useMedia('(max-width: 960px), (max-height: 720px)');
  const deck = useDeck(!route && !flat);
  const flatActive = useFlatActive(!route && flat);
  if (route) {
    const [, section, slug] = route;
    if (section === 'projects' && pages[slug]) return <ProjectPage key={slug} p={pages[slug]} />; // key: a fresh run per page
    if (section === 'experience' && Object.hasOwn(experiencePages, slug)) return <ExperiencePage key={slug} p={experiencePages[slug]} />;
    return <NotFound path={section + '/' + slug} />;
  }
  if (flat) {
    return (
      <>
        <SiteNav active={flatActive} />
        <main>
          {SLIDES.map((id) => (
            <section className="flat" id={id} key={id}>
              <Section id={id} />
            </section>
          ))}
        </main>
      </>
    );
  }
  return (
    <>
      <SiteNav active={deck.active} />
      <main className="deck">
        <div className="stack">
          {SLIDES.map((id) => (
            <section className={deck.active === id ? 'slide is-active' : 'slide'} id={`s-${id}`} key={id}>
              <Section id={id} active={deck.shown === id} />
            </section>
          ))}
        </div>
        <div aria-hidden="true">
          {SLIDES.map((id) => (
            <div className="step" id={id} key={id} />
          ))}
        </div>
      </main>
    </>
  );
}
