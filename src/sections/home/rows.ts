import { profile } from '../../content/profile';

export type Row =
  | { kind: 'value'; key: string; value: string; todo?: boolean; level?: 'warn' }
  | { kind: 'tags'; key: string; tags: { text: string; href: string }[] } // chips, each a link to the page that best shows it
  | { kind: 'jump'; key: string; href: string };

/** The terminal's lines, in print order: facts, concept and stack chips, then a jump per section. */
export const rows: Row[] = [
  { kind: 'value', key: 'work-status', value: profile.workStatus, level: 'warn' },
  { kind: 'value', key: 'location', value: profile.location },
  { kind: 'value', key: 'education', value: profile.education },
  { kind: 'tags', key: 'concepts', tags: profile.concepts },
  { kind: 'tags', key: 'stack', tags: profile.stack },
  { kind: 'value', key: 'favorite-activities', value: profile.favoriteActivities, todo: true },
  ...profile.sections.map((s) => ({ kind: 'jump' as const, key: `${s.id}/`, href: `#${s.id}` })),
];
