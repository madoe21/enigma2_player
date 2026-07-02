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

export interface InfoBlock {
  heading: string;
  body: string;
}

// DRAFT license terms — plain-language summary, pending legal review (bead #21).
const licenseInfo: Record<Lang, InfoBlock[]> = {
  de: [
    {
      heading: 'Was die Lizenz umfasst',
      body: 'Eine Lizenz gewährt das Recht, Enigma2 Player mit den Premium-Funktionen auf einer begrenzten Anzahl von Geräten zu nutzen. Die genaue Geräteanzahl und Laufzeit richten sich nach dem gewählten Modell.',
    },
    {
      heading: 'Geräte & Aktivierung',
      body: 'Geräte werden beim Anmelden registriert. Du kannst registrierte Geräte in deinem Konto einsehen und entfernen; die Historie bleibt aus Sicherheitsgründen erhalten.',
    },
    {
      heading: 'Laufzeit & Verlängerung',
      body: 'Abomodelle verlängern sich gemäß Abrechnungszeitraum, bis du kündigst. Bei ausbleibender Zahlung oder Kündigung wird die Lizenz deaktiviert.',
    },
    {
      heading: 'Erstattung & Widerruf',
      body: 'Es gelten die gesetzlichen Widerrufsrechte. Details und Kontakt findest du auf der Kontakt-Seite.',
    },
    {
      heading: 'Gewährleistung',
      body: 'Die App wird „wie besehen“ bereitgestellt. Verfügbarkeit von Receiver-Funktionen hängt vom jeweiligen Enigma2-Image/OpenWebIF ab.',
    },
  ],
  en: [
    {
      heading: 'What the license covers',
      body: 'A license grants the right to use Enigma2 Player with premium features on a limited number of devices. The exact device count and term depend on the chosen model.',
    },
    {
      heading: 'Devices & activation',
      body: 'Devices are registered on sign-in. You can view and remove registered devices in your account; the history is retained for security reasons.',
    },
    {
      heading: 'Term & renewal',
      body: 'Subscription models renew per billing period until you cancel. On missed payment or cancellation the license is deactivated.',
    },
    {
      heading: 'Refunds & withdrawal',
      body: 'Statutory withdrawal rights apply. Details and contact are on the Contact page.',
    },
    {
      heading: 'Warranty',
      body: 'The app is provided “as is”. Availability of receiver features depends on the specific Enigma2 image/OpenWebIF.',
    },
  ],
  es: [
    {
      heading: 'Qué cubre la licencia',
      body: 'Una licencia otorga el derecho a usar Enigma2 Player con funciones premium en un número limitado de dispositivos. El número exacto y la duración dependen del modelo elegido.',
    },
    {
      heading: 'Dispositivos y activación',
      body: 'Los dispositivos se registran al iniciar sesión. Puedes ver y eliminar dispositivos en tu cuenta; el historial se conserva por seguridad.',
    },
    {
      heading: 'Duración y renovación',
      body: 'Los modelos de suscripción se renuevan por periodo de facturación hasta que canceles. Si falta el pago o se cancela, la licencia se desactiva.',
    },
    {
      heading: 'Reembolsos y desistimiento',
      body: 'Se aplican los derechos legales de desistimiento. Detalles y contacto en la página de Contacto.',
    },
    {
      heading: 'Garantía',
      body: 'La app se ofrece “tal cual”. La disponibilidad de funciones del receptor depende de la imagen Enigma2/OpenWebIF concreta.',
    },
  ],
};

export function getLicenseInfo(lang: Lang): InfoBlock[] {
  return licenseInfo[lang] ?? licenseInfo[defaultLang];
}

// End-user documentation (getting started), condensed from the README.
const docs: Record<Lang, InfoBlock[]> = {
  de: [
    {
      heading: '1. Installieren',
      body: 'Lade den Installer für deine Plattform von der Downloads-Seite und führe ihn aus. Auf dem Desktop prüft die App beim Start auf Updates.',
    },
    {
      heading: '2. Receiver vorbereiten',
      body: 'Aktiviere auf deinem Enigma2-Receiver das OpenWebIF-Plugin. Notiere Host/IP, ggf. Benutzername/Passwort sowie Web-Port (Standard 80) und Stream-Port (Standard 8001).',
    },
    {
      heading: '3. Receiver hinzufügen',
      body: 'Lege in der App einen Receiver mit Host, Zugangsdaten und Ports an. Für den Zugriff von unterwegs kannst du einen externen Host/Port (Portweiterleitung/VPN) hinterlegen. Zugangsdaten werden verschlüsselt gespeichert.',
    },
    {
      heading: '4. Loslegen',
      body: 'Durchsuche Bouquets, starte Live-TV mit EPG, spiele Aufnahmen ab und nutze Timer. DVB-Untertitel und Videotext lassen sich direkt einblenden.',
    },
  ],
  en: [
    {
      heading: '1. Install',
      body: 'Download the installer for your platform from the Downloads page and run it. On desktop the app checks for updates on startup.',
    },
    {
      heading: '2. Prepare the receiver',
      body: 'Enable the OpenWebIF plugin on your Enigma2 receiver. Note the host/IP, any username/password, and the web port (default 80) and stream port (default 8001).',
    },
    {
      heading: '3. Add the receiver',
      body: 'Add a receiver in the app with its host, credentials and ports. For remote access you can set an external host/port (port forwarding/VPN). Credentials are stored encrypted.',
    },
    {
      heading: '4. Get going',
      body: 'Browse bouquets, start live TV with EPG, play recordings and use timers. DVB subtitles and teletext can be shown right away.',
    },
  ],
  es: [
    {
      heading: '1. Instalar',
      body: 'Descarga el instalador para tu plataforma desde la página de Descargas y ejecútalo. En escritorio la app busca actualizaciones al iniciar.',
    },
    {
      heading: '2. Preparar el receptor',
      body: 'Activa el plugin OpenWebIF en tu receptor Enigma2. Anota el host/IP, usuario/contraseña si aplica, y el puerto web (80 por defecto) y de streaming (8001 por defecto).',
    },
    {
      heading: '3. Añadir el receptor',
      body: 'Añade un receptor en la app con su host, credenciales y puertos. Para acceso remoto puedes definir un host/puerto externo (reenvío de puertos/VPN). Las credenciales se guardan cifradas.',
    },
    {
      heading: '4. Empezar',
      body: 'Explora bouquets, inicia TV en directo con EPG, reproduce grabaciones y usa temporizadores. Los subtítulos DVB y el teletexto se muestran al instante.',
    },
  ],
};

export function getDocs(lang: Lang): InfoBlock[] {
  return docs[lang] ?? docs[defaultLang];
}

// Captions for the (placeholder) screenshot tiles; real images land later (#5).
const screenshotCaptions: Record<Lang, string[]> = {
  de: ['Live-TV', 'EPG', 'Player', 'Bouquets', 'Untertitel', 'Einstellungen'],
  en: ['Live TV', 'EPG', 'Player', 'Bouquets', 'Subtitles', 'Settings'],
  es: ['TV en directo', 'EPG', 'Reproductor', 'Bouquets', 'Subtítulos', 'Ajustes'],
};

export function getScreenshotCaptions(lang: Lang): string[] {
  return screenshotCaptions[lang] ?? screenshotCaptions[defaultLang];
}
