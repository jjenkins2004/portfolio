import TermSection from './components/TermSection/TermSection';
import { elsewhere } from './content/elsewhere';
import { experience } from './content/experience';
import { projects } from './content/projects';
import { Home } from './sections/home/Home';

export default function App() {
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
