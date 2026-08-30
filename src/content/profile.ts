/** Who the site is about. Section content (projects, experience, elsewhere) gets its own file here. Strings marked TODO are placeholders. */
export const profile = {
  first: 'Joshua',
  last: 'Jenkins',
  name: 'Joshua Jenkins',
  identity: 'One line on what I do', // TODO
  workStatus: 'Open to founding / forward-deployed roles',
  location: 'Los Angeles',
  education: 'MS CS, USC ’27',
  whatIDo: 'A couple of lines on what I do:\nwhat I build, for whom, and how.', // TODO
  favoriteActivities: 'Two or three things I do for fun', // TODO
  links: [
    { label: 'GitHub', href: 'https://github.com/jjenkins2004' },
    { label: 'LinkedIn', href: '#' }, // TODO: profile URL
    { label: 'Email', href: 'mailto:jtjenkin@usc.edu' },
    { label: 'Resume', href: '/resume.pdf' }, // TODO: drop the PDF into public/
  ],
  sections: [
    { id: 'work', label: 'Work' },
    { id: 'experience', label: 'Experience' },
    { id: 'elsewhere', label: 'Elsewhere' },
  ],
};
