/**
 * Translation dictionaries for the product page.
 *
 * `de` is the default (unprefixed) locale; `en`/`es` fall back to `de` for any
 * missing key. Full translation of every page is tracked in bead #23 — the
 * scaffold ships the nav/common strings and the German content.
 */
export const languages = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'de';

/** Content sections (each gets a nav entry and a placeholder route). */
export const sections = [
  'features',
  'screenshots',
  'downloads',
  'changelog',
  'docs',
  'faq',
  'pricing',
  'buy',
  'account',
  'license',
  'contact',
] as const;

export type Section = (typeof sections)[number];

export const ui = {
  de: {
    'site.title': 'Enigma2 Player',
    'site.tagline':
      'Live-TV, Radio und Aufnahmen von deinem Enigma2-Receiver — auf jedem Gerät.',
    'nav.home': 'Start',
    'nav.features': 'Funktionen',
    'nav.screenshots': 'Screenshots',
    'nav.downloads': 'Downloads',
    'nav.changelog': 'Changelog',
    'nav.docs': 'Dokumentation',
    'nav.faq': 'FAQ',
    'nav.pricing': 'Preise',
    'nav.buy': 'Lizenz kaufen',
    'nav.account': 'Konto',
    'nav.license': 'Lizenzinfo',
    'nav.contact': 'Kontakt',
    'home.cta': 'Jetzt herunterladen',
    'placeholder.body': 'Inhalt folgt in Kürze.',
    'footer.note': 'Enigma2 Player — von madoe21.',
  },
  en: {
    'site.title': 'Enigma2 Player',
    'site.tagline':
      'Live TV, radio and recordings from your Enigma2 receiver — on any device.',
    'nav.home': 'Home',
    'nav.features': 'Features',
    'nav.screenshots': 'Screenshots',
    'nav.downloads': 'Downloads',
    'nav.changelog': 'Changelog',
    'nav.docs': 'Documentation',
    'nav.faq': 'FAQ',
    'nav.pricing': 'Pricing',
    'nav.buy': 'Buy a license',
    'nav.account': 'Account',
    'nav.license': 'License info',
    'nav.contact': 'Contact',
    'home.cta': 'Download now',
    'placeholder.body': 'Content coming soon.',
    'footer.note': 'Enigma2 Player — by madoe21.',
  },
  es: {
    'site.title': 'Enigma2 Player',
    'site.tagline':
      'TV en directo, radio y grabaciones de tu receptor Enigma2 — en cualquier dispositivo.',
    'nav.home': 'Inicio',
    'nav.features': 'Funciones',
    'nav.screenshots': 'Capturas',
    'nav.downloads': 'Descargas',
    'nav.changelog': 'Cambios',
    'nav.docs': 'Documentación',
    'nav.faq': 'FAQ',
    'nav.pricing': 'Precios',
    'nav.buy': 'Comprar licencia',
    'nav.account': 'Cuenta',
    'nav.license': 'Licencia',
    'nav.contact': 'Contacto',
    'home.cta': 'Descargar ahora',
    'placeholder.body': 'Contenido próximamente.',
    'footer.note': 'Enigma2 Player — por madoe21.',
  },
} as const;

export type UiKey = keyof (typeof ui)['de'];
