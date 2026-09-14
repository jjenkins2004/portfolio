/** Who the site is about. Section content (projects, experience, elsewhere) gets its own file here. Strings marked TODO are placeholders. */
export const profile = {
  first: 'Joshua',
  last: 'Jenkins',
  name: 'Joshua Jenkins',
  identity: 'AI engineer who has shipped his own startups and worked inside others.',
  workStatus: 'Open to AI, forward-deployed, and founding engineer roles',
  location: 'Los Angeles',
  education: 'MS CS, USC ’27 · BS CS ’26',
  // Chip rows on the home terminal. Concepts: the headline concept of each top experience, in rank
  // order, one per line. Every chip links to a different page.
  concepts: [
    { text: 'agent-run pipelines', href: '/experience/handshake' },
    { text: 'client discovery', href: '/experience/silky' },
    { text: 'event-driven architecture', href: '/experience/recallia' },
    { text: 'checkpoint & resume', href: '/projects/stepper' },
  ],
  stack: [
    { text: 'Python', href: '/projects/ticker' },
    { text: 'TypeScript', href: '/projects/knowledgehub' },
    { text: 'Swift', href: '/projects/clipirl' },
  ],
  favoriteActivities: 'skiing, tennis, running, building',
  links: [
    { label: 'GitHub', href: 'https://github.com/jjenkins2004' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/joshua-jenkins-2943a792/' },
    { label: 'Email', href: 'mailto:jtjenkin@usc.edu' },
    { label: 'Resume', href: '/resume.pdf' },
  ],
  sections: [
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'elsewhere', label: 'Elsewhere' },
  ],
};
