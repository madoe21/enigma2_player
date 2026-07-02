/**
 * Longer-form, per-locale page content (feature lists, FAQ, …). Kept out of
 * `ui.ts` (short UI strings) so content pages stay readable. Falls back to the
 * default locale for any locale that is missing an entry.
 */
import {defaultLang, type Lang} from './ui';

export interface FeatureItem {
  title: string;
  desc: string;
}

const features: Record<Lang, FeatureItem[]> = {
  de: [
    {
      title: 'Mehrere Receiver',
      desc: 'Beliebig viele Enigma2-Receiver einrichten, verwalten und blitzschnell zwischen ihnen umschalten.',
    },
    {
      title: 'Live-TV & Radio',
      desc: 'Streame Live-Kanäle mit EPG, Bouquets/Favoriten und Sender-Picons — direkt vom Receiver.',
    },
    {
      title: 'Aufnahmen & Timer',
      desc: 'Aufnahmen abspielen, Timer sowie Power- und AutoTimer anlegen und verwalten.',
    },
    {
      title: 'Untertitel & Videotext',
      desc: 'DVB-Untertitel und Videotext werden in der App aus dem Transportstrom dekodiert — ohne externe Bibliotheken.',
    },
    {
      title: 'Fernbedienung',
      desc: 'Vollständige virtuelle Fernbedienung über OpenWebIF; steuere den Receiver wie vor dem Fernseher.',
    },
    {
      title: 'Plattformübergreifend',
      desc: 'Windows, macOS, Linux, Android und iOS — eine App, überall dieselbe Oberfläche, in de/en/es.',
    },
  ],
  en: [
    {
      title: 'Multiple receivers',
      desc: 'Set up and manage any number of Enigma2 receivers and switch between them in an instant.',
    },
    {
      title: 'Live TV & radio',
      desc: 'Stream live channels with EPG, bouquets/favourites and channel picons — straight from the receiver.',
    },
    {
      title: 'Recordings & timers',
      desc: 'Play recordings and create/manage record timers plus power and auto timers.',
    },
    {
      title: 'Subtitles & teletext',
      desc: 'DVB subtitles and teletext are decoded in-app from the transport stream — no external libraries.',
    },
    {
      title: 'Remote control',
      desc: 'Full virtual remote over OpenWebIF; drive the receiver just like from the couch.',
    },
    {
      title: 'Cross-platform',
      desc: 'Windows, macOS, Linux, Android and iOS — one app, the same UI everywhere, in de/en/es.',
    },
  ],
  es: [
    {
      title: 'Varios receptores',
      desc: 'Configura y gestiona cualquier número de receptores Enigma2 y cambia entre ellos al instante.',
    },
    {
      title: 'TV en directo y radio',
      desc: 'Transmite canales en directo con EPG, bouquets/favoritos y logos de canal — directo del receptor.',
    },
    {
      title: 'Grabaciones y temporizadores',
      desc: 'Reproduce grabaciones y crea/gestiona temporizadores de grabación, apagado y automáticos.',
    },
    {
      title: 'Subtítulos y teletexto',
      desc: 'Los subtítulos DVB y el teletexto se decodifican en la app desde el flujo de transporte — sin librerías externas.',
    },
    {
      title: 'Mando a distancia',
      desc: 'Mando virtual completo vía OpenWebIF; controla el receptor como desde el sofá.',
    },
    {
      title: 'Multiplataforma',
      desc: 'Windows, macOS, Linux, Android e iOS — una app, la misma interfaz, en de/en/es.',
    },
  ],
};

export function getFeatures(lang: Lang): FeatureItem[] {
  return features[lang] ?? features[defaultLang];
}

export interface QaItem {
  q: string;
  a: string;
}

const faq: Record<Lang, QaItem[]> = {
  de: [
    {
      q: 'Welche Receiver werden unterstützt?',
      a: 'Enigma2-Receiver mit aktiviertem OpenWebIF (z. B. Dreambox, VU+, Zgemma und andere OpenATV-/Images).',
    },
    {
      q: 'Auf welchen Plattformen läuft die App?',
      a: 'Windows, macOS, Linux, Android (inkl. TV-Boxen/Fire TV) und iOS.',
    },
    {
      q: 'Ist die App kostenlos?',
      a: 'Es gibt eine kostenlose Nutzung; Premium-Funktionen erfordern eine Lizenz. Details auf der Preise-Seite.',
    },
    {
      q: 'Wie funktionieren Updates?',
      a: 'Desktop prüft beim Start auf neue Versionen. Mobile Builds werden per Neuinstallation aktualisiert (App-Store-Verteilung folgt).',
    },
    {
      q: 'Werden Untertitel und Videotext unterstützt?',
      a: 'Ja. DVB-Untertitel und Videotext werden direkt in der App aus dem Transportstrom dekodiert.',
    },
    {
      q: 'Kann ich von unterwegs zugreifen?',
      a: 'Ja, über einen extern erreichbaren Host/Port deines Receivers (Portweiterleitung/VPN). Zugangsdaten werden verschlüsselt gespeichert.',
    },
  ],
  en: [
    {
      q: 'Which receivers are supported?',
      a: 'Enigma2 receivers with OpenWebIF enabled (e.g. Dreambox, VU+, Zgemma and other OpenATV/images).',
    },
    {
      q: 'Which platforms does the app run on?',
      a: 'Windows, macOS, Linux, Android (incl. TV boxes/Fire TV) and iOS.',
    },
    {
      q: 'Is the app free?',
      a: 'There is a free tier; premium features require a license. See the Pricing page for details.',
    },
    {
      q: 'How do updates work?',
      a: 'Desktop checks for new versions on startup. Mobile builds update by re-installing (app-store distribution to follow).',
    },
    {
      q: 'Are subtitles and teletext supported?',
      a: 'Yes. DVB subtitles and teletext are decoded in-app straight from the transport stream.',
    },
    {
      q: 'Can I access my receiver remotely?',
      a: 'Yes, via an externally reachable host/port of your receiver (port forwarding/VPN). Credentials are stored encrypted.',
    },
  ],
  es: [
    {
      q: '¿Qué receptores son compatibles?',
      a: 'Receptores Enigma2 con OpenWebIF activado (p. ej. Dreambox, VU+, Zgemma y otras imágenes OpenATV).',
    },
    {
      q: '¿En qué plataformas funciona la app?',
      a: 'Windows, macOS, Linux, Android (incl. TV boxes/Fire TV) e iOS.',
    },
    {
      q: '¿La app es gratuita?',
      a: 'Hay un nivel gratuito; las funciones premium requieren una licencia. Consulta la página de Precios.',
    },
    {
      q: '¿Cómo funcionan las actualizaciones?',
      a: 'El escritorio comprueba nuevas versiones al iniciar. Las versiones móviles se actualizan reinstalando (distribución en tiendas más adelante).',
    },
    {
      q: '¿Se admiten subtítulos y teletexto?',
      a: 'Sí. Los subtítulos DVB y el teletexto se decodifican en la app desde el flujo de transporte.',
    },
    {
      q: '¿Puedo acceder a mi receptor de forma remota?',
      a: 'Sí, mediante un host/puerto accesible externamente (reenvío de puertos/VPN). Las credenciales se guardan cifradas.',
    },
  ],
};

export function getFaq(lang: Lang): QaItem[] {
  return faq[lang] ?? faq[defaultLang];
}
