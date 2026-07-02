/**
 * Which sections still render the generic placeholder (vs. having a dedicated
 * content page). Shared by the per-locale `[page].astro` routes so all three
 * locales expose the same placeholder sections (no 404 on nav links).
 */
import {sections, type Section} from './ui';

/** Sections that have their own dedicated content page. */
export const builtSections = new Set<Section>([
  'features',
  'faq',
  'contact',
  'license',
  'docs',
  'screenshots',
  'pricing',
  'account',
]);

/** Sections still served by the placeholder route, in all locales. */
export const placeholderSections: Section[] = sections.filter(
  s => !builtSections.has(s)
);
