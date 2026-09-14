import { elsewherePages, experiencePages, pages } from './pages';
import { profile } from './profile';

export const SITE_NAME = profile.name;

/** Tab and link-preview title of a page: its name, then the site name. The site name alone for an unknown slug. */
export function pageTitle(section: string, slug: string): string {
  const name = section === 'projects' ? pages[slug]?.name : section === 'experience' ? experiencePages[slug]?.org : elsewherePages[slug]?.name;
  return name ? `${name} · ${SITE_NAME}` : SITE_NAME;
}

export type Route = { path: string; slug: string; title: string; description: string };

/** Every page the site serves, home first, with the title and description its link preview carries. */
export function routes(): Route[] {
  const of = (section: string, all: Record<string, { line: string }>) =>
    Object.keys(all).map((slug) => ({ path: `/${section}/${slug}`, slug, title: pageTitle(section, slug), description: all[slug].line }));
  return [
    { path: '/', slug: 'home', title: SITE_NAME, description: profile.identity },
    ...of('projects', pages),
    ...of('experience', experiencePages),
    ...of('elsewhere', elsewherePages),
  ];
}
