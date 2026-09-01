import { useEffect, useState } from 'react';
import ProjectPage from './components/ProjectPage/ProjectPage';
import TermSection from './components/TermSection/TermSection';
import Window from './components/TermSection/Window';
import { elsewhere } from './content/elsewhere';
import { experience } from './content/experience';
import { pages } from './content/pages';
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
  if (route) {
    const [, section, slug] = route;
    if (section === 'projects' && pages[slug]) return <ProjectPage p={pages[slug]} />;
    return <NotFound path={section + '/' + slug} />;
  }
  return (
    <main className="snap">
      <section className="slide">
        <Home />
      </section>
      <section className="slide" id="projects">
        <TermSection dir="projects" items={projects} />
      </section>
      <section className="slide" id="experience">
        <TermSection dir="experience" items={experience} />
      </section>
      <section className="slide" id="elsewhere">
        <TermSection dir="elsewhere" items={elsewhere} />
      </section>
    </main>
  );
}
