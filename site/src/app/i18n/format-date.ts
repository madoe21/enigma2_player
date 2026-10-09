import { Lang } from './locales';

/**
 * A date in the reader's language, without Angular's locale data.
 *
 * `DatePipe` needs `registerLocaleData` for every locale that is not English.
 * Without it, it renders NOTHING - and on the server it blanked the whole
 * heading it sat in, so every prerendered changelog heading was empty and axe
 * reported `empty-heading` (enigma2_player-iaa). That is the worst kind of
 * defect: silent, invisible with JavaScript on, and present in the files a
 * crawler and a reader without JavaScript get.
 *
 * `Intl.DateTimeFormat` is in the platform - the browser and Node both ship
 * it with full ICU - so there is nothing to register, nothing to bundle per
 * language, and the server and the client format identically.
 */
export function formatDate(iso: string | null, lang: Lang): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  try {
    return new Intl.DateTimeFormat(lang, { dateStyle: 'long' }).format(date);
  } catch {
    // A runtime without the locale falls back to the ISO day rather than to
    // nothing: a date nobody can read beats a heading that lost its date.
    return iso.slice(0, 10);
  }
}
