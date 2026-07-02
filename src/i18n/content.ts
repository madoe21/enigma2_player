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
