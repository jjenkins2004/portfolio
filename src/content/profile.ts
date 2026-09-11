/** Who the site is about. Section content (projects, experience, elsewhere) gets its own file here. Strings marked TODO are placeholders. */
export const profile = {
  first: 'Joshua',
  last: 'Jenkins',
  name: 'Joshua Jenkins',
  identity: 'Engineer who builds early-stage startups end to end.',
  workStatus: 'Open to founding / forward-deployed roles',
  location: 'Los Angeles',
  education: 'MS CS, USC ’27',
  whatIDo: 'Backend and agent tooling for early-stage startups, from first prototype to real users.',
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
