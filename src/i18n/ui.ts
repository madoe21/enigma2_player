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
    'home.cta.download': 'Jetzt herunterladen',
    'home.cta.buy': 'Lizenz kaufen',
    'home.hero.title': 'Dein Enigma2-Receiver. Auf jedem Bildschirm.',
    'home.hero.sub':
      'Durchsuche, steuere und streame Live-TV, Radio und Aufnahmen von deinen Enigma2-Receivern (OpenWebIF) — auf Windows, macOS, Linux, Android und iOS.',
    'home.features.title': 'Warum Enigma2 Player',
    'home.f.multi': 'Mehrere Receiver verwalten und blitzschnell umschalten.',
    'home.f.stream': 'Live-TV & Aufnahmen streamen, mit EPG und Bouquets.',
    'home.f.subs': 'DVB-Untertitel & Videotext direkt in der App dekodiert.',
    'home.f.cross': 'Ein Player für Desktop und Mobil, in de/en/es.',
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
    'home.cta.download': 'Download now',
    'home.cta.buy': 'Buy a license',
    'home.hero.title': 'Your Enigma2 receiver. On every screen.',
    'home.hero.sub':
      'Browse, control and stream live TV, radio and recordings from your Enigma2 receivers (OpenWebIF) — on Windows, macOS, Linux, Android and iOS.',
    'home.features.title': 'Why Enigma2 Player',
    'home.f.multi': 'Manage multiple receivers and switch in an instant.',
    'home.f.stream': 'Stream live TV & recordings, with EPG and bouquets.',
    'home.f.subs': 'DVB subtitles & teletext decoded right in the app.',
    'home.f.cross': 'One player for desktop and mobile, in de/en/es.',
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
    'home.cta.download': 'Descargar ahora',
    'home.cta.buy': 'Comprar licencia',
    'home.hero.title': 'Tu receptor Enigma2. En cualquier pantalla.',
    'home.hero.sub':
      'Explora, controla y transmite TV en directo, radio y grabaciones de tus receptores Enigma2 (OpenWebIF) — en Windows, macOS, Linux, Android e iOS.',
    'home.features.title': 'Por qué Enigma2 Player',
    'home.f.multi': 'Gestiona varios receptores y cambia al instante.',
    'home.f.stream': 'Transmite TV en directo y grabaciones, con EPG y bouquets.',
    'home.f.subs': 'Subtítulos DVB y teletexto decodificados en la app.',
    'home.f.cross': 'Un reproductor para escritorio y móvil, en de/en/es.',
    'placeholder.body': 'Contenido próximamente.',
    'footer.note': 'Enigma2 Player — por madoe21.',
  },
} as const;

export type UiKey = keyof (typeof ui)['de'];
