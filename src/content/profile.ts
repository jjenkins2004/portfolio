/** Who the site is about. Section content (projects, experience, elsewhere) gets its own file here. Strings marked TODO are placeholders. */
export const profile = {
  first: 'Joshua',
  last: 'Jenkins',
  name: 'Joshua Jenkins',
  identity: 'AI engineer who has shipped his own startups and worked inside others.',
  workStatus: 'Open to founding / forward-deployed roles',
  location: 'Los Angeles',
  education: 'MS CS, USC ’27',
  // Chip rows on the home terminal; each links to the page that best shows it.
  concepts: [
    { text: 'agent-run pipelines', href: '#/experience/handshake' },
    { text: 'checkpoint & resume', href: '#/projects/stepper' },
    { text: 'event-driven architecture', href: '#/experience/recallia' },
    { text: 'client discovery', href: '#/experience/silky' },
    { text: 'background job queues', href: '#/experience/memoir' },
    { text: 'all-or-nothing commits', href: '#/projects/knowledgehub' },
  ],
  stack: [
    { text: 'Python', href: '#/projects/stepper' },
    { text: 'TypeScript', href: '#/projects/knowledgehub' },
    { text: 'Swift', href: '#/projects/clipirl' },
    { text: 'React', href: '#/experience/heat-lab' },
    { text: 'FastAPI', href: '#/experience/silky' },
    { text: 'MCP', href: '#/projects/ticker' },
  ],
  favoriteActivities: 'Two or three things I do for fun', // TODO
  links: [
    { label: 'GitHub', href: 'https://github.com/jjenkins2004' },
    { label: 'LinkedIn', href: '#' }, // TODO: profile URL
    { label: 'Email', href: 'mailto:jtjenkin@usc.edu' },
    { label: 'Resume', href: '/resume.pdf' }, // TODO: drop the PDF into public/
  ],
  sections: [
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'elsewhere', label: 'Elsewhere' },
  ],
};
