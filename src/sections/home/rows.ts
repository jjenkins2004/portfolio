import { profile } from '../../content/profile';

export type Row =
  | { kind: 'value'; key: string; value: string; todo?: boolean; level?: 'warn' }
  | { kind: 'jump'; key: string; href: string };

/** The terminal's lines, in print order: facts, then a jump per section. */
export const rows: Row[] = [
  { kind: 'value', key: 'work-status', value: profile.workStatus, level: 'warn' },
  { kind: 'value', key: 'location', value: profile.location },
  { kind: 'value', key: 'education', value: profile.education },
  { kind: 'value', key: 'what-i-do', value: profile.whatIDo, todo: true },
  { kind: 'value', key: 'favorite-activities', value: profile.favoriteActivities, todo: true },
  ...profile.sections.map((s) => ({ kind: 'jump' as const, key: `${s.id}/`, href: `#${s.id}` })),
];
