/**
 * The longer page content - feature lists, FAQ, licence notes, docs,
 * screenshots - moved from the Astro site unchanged (`src/i18n/content.ts`).
 *
 * Kept out of `ui.ts` for the same reason as before: short strings and page
 * content read differently, and mixing them makes both harder to edit. Each
 * getter falls back to the default locale for a language that has no entry,
 * which is what keeps a half-translated language from rendering as a blank
 * page (enigma2_player-n5j).
 */
import { Lang, defaultLang } from '../i18n/locales';

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
      title: 'EPG & Programminfos',
      desc: 'Elektronischer Programmführer mit Detailinfos — direkt aus dem EPG heraus Timer planen oder aufnehmen.',
    },
    {
      title: 'Senderliste & Bouquets bearbeiten',
      desc: 'Bouquet-Editor direkt in der App: Sender sortieren, verschieben, Favoriten pflegen — ohne Receiver-Menü.',
    },
    {
      title: 'Aufnahme starten',
      desc: 'Sofortaufnahme aus dem laufenden Programm oder aus dem EPG — die Box nimmt auf, du schaust weiter.',
    },
    {
      title: 'Timer planen',
      desc: 'Aufnahme-Timer, AutoTimer und Power-Timer anlegen, ändern und mit dem Receiver synchronisieren.',
    },
    {
      title: 'Receiver-Einstellungen',
      desc: 'OpenWebIF-Einstellungen des Receivers bequem aus der App vornehmen — inklusive Standby und Neustart.',
    },
    {
      title: 'Fernbedienung',
      desc: 'Vollständige virtuelle Fernbedienung über OpenWebIF; steuere den Receiver wie vor dem Fernseher.',
    },
    {
      title: 'Plattformübergreifend',
      desc: 'Windows, macOS, Linux, Android (inkl. Android TV & Fire TV) und iOS — eine App, überall dieselbe Oberfläche, in de/en/es/fr/it.',
    },
    {
      title: 'Eine Lizenz für alle Plattformen',
      desc: 'Lizenzen gelten plattformübergreifend: ein Konto für alle Geräte — egal ob Windows, macOS, Linux, Android oder iOS. Nur die Geräteanzahl deines Lizenzmodells zählt.',
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
      title: 'EPG & programme info',
      desc: 'Electronic programme guide with details — schedule timers or start recordings straight from the EPG.',
    },
    {
      title: 'Edit channel lists & bouquets',
      desc: 'Bouquet editor built in: sort and move channels, curate favourites — no receiver menu needed.',
    },
    {
      title: 'Start recordings',
      desc: 'Instant recording from the running programme or from the EPG — the box records while you keep watching.',
    },
    {
      title: 'Plan timers',
      desc: 'Create, edit and sync record timers, auto timers and power timers with the receiver.',
    },
    {
      title: 'Receiver settings',
      desc: 'Adjust the receiver’s OpenWebIF settings comfortably from the app — including standby and reboot.',
    },
    {
      title: 'Remote control',
      desc: 'Full virtual remote over OpenWebIF; drive the receiver just like from the couch.',
    },
    {
      title: 'Cross-platform',
      desc: 'Windows, macOS, Linux, Android (incl. Android TV & Fire TV) and iOS — one app, the same UI everywhere, in de/en/es/fr/it.',
    },
    {
      title: 'One license for all platforms',
      desc: 'Licenses are cross-platform: one account for all your devices — Windows, macOS, Linux, Android or iOS. Only your model’s device count matters.',
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
      title: 'EPG e información de programas',
      desc: 'Guía electrónica de programación con detalles — programa temporizadores o graba directamente desde el EPG.',
    },
    {
      title: 'Editar listas de canales y bouquets',
      desc: 'Editor de bouquets integrado: ordena y mueve canales, gestiona favoritos — sin el menú del receptor.',
    },
    {
      title: 'Iniciar grabaciones',
      desc: 'Grabación instantánea del programa en curso o desde el EPG — el receptor graba mientras sigues viendo.',
    },
    {
      title: 'Planificar temporizadores',
      desc: 'Crea, edita y sincroniza temporizadores de grabación, automáticos y de apagado con el receptor.',
    },
    {
      title: 'Ajustes del receptor',
      desc: 'Configura los ajustes OpenWebIF del receptor cómodamente desde la app — incluido standby y reinicio.',
    },
    {
      title: 'Mando a distancia',
      desc: 'Mando virtual completo vía OpenWebIF; controla el receptor como desde el sofá.',
    },
    {
      title: 'Multiplataforma',
      desc: 'Windows, macOS, Linux, Android (incl. Android TV y Fire TV) e iOS — una app, la misma interfaz, en de/en/es/fr/it.',
    },
    {
      title: 'Una licencia para todas las plataformas',
      desc: 'Las licencias son multiplataforma: una cuenta para todos tus dispositivos — Windows, macOS, Linux, Android o iOS. Solo cuenta el número de dispositivos de tu modelo.',
    },
  ],
  fr: [
    {
      title: 'Plusieurs récepteurs',
      desc: 'Configurez et gérez un nombre illimité de récepteurs Enigma2 et basculez entre eux en un instant.',
    },
    {
      title: 'TV en direct et radio',
      desc: 'Diffusez les chaînes en direct avec EPG, bouquets/favoris et picons — directement depuis le récepteur.',
    },
    {
      title: 'Enregistrements et minuteries',
      desc: 'Lisez les enregistrements et créez/gérez les minuteries d’enregistrement, d’extinction et automatiques.',
    },
    {
      title: 'Sous-titres et télétexte',
      desc: 'Les sous-titres DVB et le télétexte sont décodés dans l’app depuis le flux de transport — sans bibliothèques externes.',
    },
    {
      title: 'EPG et infos programmes',
      desc: 'Guide électronique des programmes avec détails — planifiez une minuterie ou enregistrez directement depuis l’EPG.',
    },
    {
      title: 'Éditer listes de chaînes et bouquets',
      desc: 'Éditeur de bouquets intégré : trier et déplacer les chaînes, gérer les favoris — sans le menu du récepteur.',
    },
    {
      title: 'Lancer un enregistrement',
      desc: 'Enregistrement instantané du programme en cours ou depuis l’EPG — le récepteur enregistre pendant que vous regardez.',
    },
    {
      title: 'Planifier des minuteries',
      desc: 'Créez, modifiez et synchronisez les minuteries d’enregistrement, automatiques et d’extinction avec le récepteur.',
    },
    {
      title: 'Réglages du récepteur',
      desc: 'Modifiez confortablement les réglages OpenWebIF du récepteur depuis l’app — y compris veille et redémarrage.',
    },
    {
      title: 'Télécommande',
      desc: 'Télécommande virtuelle complète via OpenWebIF ; pilotez le récepteur comme depuis le canapé.',
    },
    {
      title: 'Multiplateforme',
      desc: 'Windows, macOS, Linux, Android (dont Android TV & Fire TV) et iOS — une app, la même interface partout, en de/en/es/fr/it.',
    },
    {
      title: 'Une licence pour toutes les plateformes',
      desc: 'Les licences sont multiplateformes : un compte pour tous vos appareils — Windows, macOS, Linux, Android ou iOS. Seul le nombre d’appareils de votre modèle compte.',
    },
  ],
  it: [
    {
      title: 'Più ricevitori',
      desc: 'Configura e gestisci un numero qualsiasi di ricevitori Enigma2 e passa dall’uno all’altro in un attimo.',
    },
    {
      title: 'TV in diretta e radio',
      desc: 'Trasmetti i canali in diretta con EPG, bouquet/preferiti e picon — direttamente dal ricevitore.',
    },
    {
      title: 'Registrazioni e timer',
      desc: 'Riproduci le registrazioni e crea/gestisci timer di registrazione, spegnimento e automatici.',
    },
    {
      title: 'Sottotitoli e televideo',
      desc: 'I sottotitoli DVB e il televideo vengono decodificati nell’app dal flusso di trasporto — senza librerie esterne.',
    },
    {
      title: 'EPG e info programmi',
      desc: 'Guida elettronica ai programmi con dettagli — pianifica un timer o registra direttamente dall’EPG.',
    },
    {
      title: 'Modifica liste canali e bouquet',
      desc: 'Editor di bouquet integrato: ordina e sposta i canali, gestisci i preferiti — senza il menu del ricevitore.',
    },
    {
      title: 'Avvia una registrazione',
      desc: 'Registrazione istantanea dal programma in onda o dall’EPG — il ricevitore registra mentre continui a guardare.',
    },
    {
      title: 'Pianifica timer',
      desc: 'Crea, modifica e sincronizza timer di registrazione, automatici e di spegnimento con il ricevitore.',
    },
    {
      title: 'Impostazioni del ricevitore',
      desc: 'Modifica comodamente le impostazioni OpenWebIF del ricevitore dall’app — inclusi standby e riavvio.',
    },
    {
      title: 'Telecomando',
      desc: 'Telecomando virtuale completo via OpenWebIF; controlla il ricevitore come dal divano.',
    },
    {
      title: 'Multipiattaforma',
      desc: 'Windows, macOS, Linux, Android (incl. Android TV e Fire TV) e iOS — una app, la stessa interfaccia ovunque, in de/en/es/fr/it.',
    },
    {
      title: 'Una licenza per tutte le piattaforme',
      desc: 'Le licenze sono multipiattaforma: un account per tutti i tuoi dispositivi — Windows, macOS, Linux, Android o iOS. Conta solo il numero di dispositivi del tuo modello.',
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
      a: 'Ja. Im lokalen Netzwerk gibst du die interne IP des Receivers an. Von unterwegs gibt es zwei Wege: (1) per VPN ins Heimnetz (empfohlen: WireGuard) — dann nutzt du wie zu Hause die interne IP, ohne Ports im Router zu öffnen; oder (2) eine von außen erreichbare Adresse des Routers (feste IP oder DynDNS) mit einer Portweiterleitung auf den Receiver. Zugangsdaten werden verschlüsselt gespeichert.',
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
      a: 'Yes. On your local network you enter the receiver’s internal IP. On the go there are two ways: (1) a VPN into your home network (recommended: WireGuard) — then you use the internal IP just like at home, without opening any router ports; or (2) an externally reachable address of your router (static IP or DynDNS) with a port forward to the receiver. Credentials are stored encrypted.',
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
      a: 'Sí. En tu red local indicas la IP interna del receptor. Fuera de casa hay dos opciones: (1) una VPN a tu red doméstica (recomendado: WireGuard) — así usas la IP interna como en casa, sin abrir puertos en el router; o (2) una dirección del router accesible desde fuera (IP fija o DynDNS) con un reenvío de puertos hacia el receptor. Las credenciales se guardan cifradas.',
    },
  ],
  fr: [
    {
      q: 'Quels récepteurs sont pris en charge ?',
      a: 'Les récepteurs Enigma2 avec OpenWebIF activé (p. ex. Dreambox, VU+, Zgemma et autres images OpenATV).',
    },
    {
      q: 'Sur quelles plateformes l’app fonctionne-t-elle ?',
      a: 'Windows, macOS, Linux, Android (y compris box TV/Fire TV) et iOS.',
    },
    {
      q: 'L’app est-elle gratuite ?',
      a: 'Il existe une offre gratuite ; les fonctions premium nécessitent une licence. Voir la page Tarifs.',
    },
    {
      q: 'Comment fonctionnent les mises à jour ?',
      a: 'Sur ordinateur, l’app vérifie les nouvelles versions au démarrage. Les versions mobiles se mettent à jour en réinstallant (distribution sur les stores à venir).',
    },
    {
      q: 'Les sous-titres et le télétexte sont-ils pris en charge ?',
      a: 'Oui. Les sous-titres DVB et le télétexte sont décodés dans l’app depuis le flux de transport.',
    },
    {
      q: 'Puis-je accéder à mon récepteur à distance ?',
      a: 'Oui. Sur votre réseau local, vous indiquez l’IP interne du récepteur. En déplacement, deux possibilités : (1) un VPN vers votre réseau domestique (recommandé : WireGuard) — vous utilisez alors l’IP interne comme à la maison, sans ouvrir de ports sur le routeur ; ou (2) une adresse du routeur accessible depuis l’extérieur (IP fixe ou DynDNS) avec une redirection de port vers le récepteur. Les identifiants sont stockés chiffrés.',
    },
  ],
  it: [
    {
      q: 'Quali ricevitori sono supportati?',
      a: 'Ricevitori Enigma2 con OpenWebIF attivo (es. Dreambox, VU+, Zgemma e altre immagini OpenATV).',
    },
    {
      q: 'Su quali piattaforme funziona l’app?',
      a: 'Windows, macOS, Linux, Android (incl. TV box/Fire TV) e iOS.',
    },
    {
      q: 'L’app è gratuita?',
      a: 'Esiste un livello gratuito; le funzioni premium richiedono una licenza. Vedi la pagina Prezzi.',
    },
    {
      q: 'Come funzionano gli aggiornamenti?',
      a: 'Su desktop l’app controlla le nuove versioni all’avvio. Le versioni mobili si aggiornano reinstallando (distribuzione sugli store in seguito).',
    },
    {
      q: 'Sono supportati sottotitoli e televideo?',
      a: 'Sì. I sottotitoli DVB e il televideo vengono decodificati nell’app dal flusso di trasporto.',
    },
    {
      q: 'Posso accedere al ricevitore da remoto?',
      a: 'Sì. Nella rete locale indichi l’IP interno del ricevitore. Fuori casa due opzioni: (1) una VPN verso la rete domestica (consigliato: WireGuard) — così usi l’IP interno come a casa, senza aprire porte sul router; oppure (2) un indirizzo del router raggiungibile dall’esterno (IP fisso o DynDNS) con un port forwarding verso il ricevitore. Le credenziali sono salvate cifrate.',
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
  fr: [
    {
      heading: 'Ce que couvre la licence',
      body: 'Une licence donne le droit d’utiliser Enigma2 Player avec les fonctions premium sur un nombre limité d’appareils. Le nombre exact et la durée dépendent du modèle choisi.',
    },
    {
      heading: 'Appareils et activation',
      body: 'Les appareils sont enregistrés à la connexion. Vous pouvez voir et supprimer des appareils dans votre compte ; l’historique est conservé par sécurité.',
    },
    {
      heading: 'Durée et renouvellement',
      body: 'Les modèles par abonnement se renouvellent par période de facturation jusqu’à annulation. En cas de paiement manquant ou d’annulation, la licence est désactivée.',
    },
    {
      heading: 'Remboursements et rétractation',
      body: 'Les droits légaux de rétractation s’appliquent. Détails et contact sur la page Contact.',
    },
    {
      heading: 'Garantie',
      body: 'L’app est fournie « en l’état ». La disponibilité des fonctions du récepteur dépend de l’image Enigma2/OpenWebIF concrète.',
    },
  ],
  it: [
    {
      heading: 'Cosa copre la licenza',
      body: 'Una licenza concede il diritto di usare Enigma2 Player con le funzioni premium su un numero limitato di dispositivi. Il numero esatto e la durata dipendono dal modello scelto.',
    },
    {
      heading: 'Dispositivi e attivazione',
      body: 'I dispositivi vengono registrati all’accesso. Puoi vedere e rimuovere i dispositivi nel tuo account; lo storico è conservato per sicurezza.',
    },
    {
      heading: 'Durata e rinnovo',
      body: 'I modelli in abbonamento si rinnovano per periodo di fatturazione fino alla disdetta. In caso di pagamento mancante o disdetta, la licenza viene disattivata.',
    },
    {
      heading: 'Rimborsi e recesso',
      body: 'Si applicano i diritti legali di recesso. Dettagli e contatto nella pagina Contatti.',
    },
    {
      heading: 'Garanzia',
      body: 'L’app è fornita “così com’è”. La disponibilità delle funzioni del ricevitore dipende dalla specifica immagine Enigma2/OpenWebIF.',
    },
  ],
};

export function getLicenseInfo(lang: Lang): InfoBlock[] {
  return licenseInfo[lang] ?? licenseInfo[defaultLang];
}

/**
 * The user manual: what the app does and how to do it, task by task.
 *
 * It replaces the `/docs` page, which the PO removed as nobody's reading
 * ("Braucht kein Mensch", 2026-10-15) - its four getting-started blocks were
 * the only part worth keeping and are the first four here (enigma2_player-lk7,
 * -1zl). The rest follows the order a new user meets the app in, not the order
 * the code is organised in.
 *
 * Numbered headings on the setup steps, plain headings afterwards: the first
 * four are a sequence, the others are places to look something up.
 */
const manual: Record<Lang, InfoBlock[]> = {
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
      body: 'Lege in der App einen Receiver mit Host, Zugangsdaten und Ports an. Im lokalen Netzwerk ist der Host die interne IP des Receivers. Für den Zugriff von unterwegs entweder per VPN ins Heimnetz (empfohlen: WireGuard) und weiterhin die interne IP nutzen, oder eine von außen erreichbare Router-Adresse (feste IP oder DynDNS) mit Portweiterleitung auf den Receiver. Zugangsdaten werden verschlüsselt gespeichert.',
    },
    {
      heading: '4. Loslegen',
      body: 'Durchsuche Bouquets, starte Live-TV mit EPG, spiele Aufnahmen ab und nutze Timer. DVB-Untertitel und Videotext lassen sich direkt einblenden.',
    },
    {
      heading: 'Live-TV, Radio und Bouquets',
      body: 'Wähle ein Bouquet und starte einen Sender mit einem Klick. Die Senderliste zeigt Picons, das laufende Programm und den EPG-Eintrag. Der Umschaltbefehl geht über OpenWebIF an den Receiver, das Bild kommt als Transportstrom vom Stream-Port.',
    },
    {
      heading: 'EPG, Timer und Aufnahmen',
      body: 'Der Programmführer zeigt das Programm pro Sender. Aus einem EPG-Eintrag heraus legst du einen Aufnahme-Timer an oder startest eine Sofortaufnahme; AutoTimer und Power-Timer verwaltest du in derselben Ansicht. Fertige Aufnahmen spielst du über die Aufnahmenliste ab.',
    },
    {
      heading: 'Untertitel und Videotext',
      body: 'DVB-Untertitel und Videotext dekodiert die App selbst aus dem Transportstrom, ohne externe Bibliotheken. Im Player wählst du die Spur aus; Videotext öffnet als Seitenansicht mit Zifferneingabe.',
    },
    {
      heading: 'Fernbedienung',
      body: 'Die virtuelle Fernbedienung schickt dieselben Tastencodes wie die Original-Fernbedienung über OpenWebIF. Damit erreichst du auch Receiver-Menüs, die die App nicht nachbaut.',
    },
    {
      heading: 'Senderliste und Bouquets bearbeiten',
      body: 'Der Bouquet-Editor sortiert Sender, verschiebt sie zwischen Bouquets und pflegt Favoriten. Die Dateien liest und schreibt die App per SSH auf dem Receiver; vor dem ersten Zugriff bestätigst du dessen SSH-Hostschlüssel.',
    },
    {
      heading: 'Receiver-Einstellungen',
      body: 'OpenWebIF-Einstellungen des Receivers änderst du direkt in der App, inklusive Standby und Neustart. Was dort angeboten wird, hängt vom Image des Receivers ab.',
    },
    {
      heading: 'Wenn etwas nicht funktioniert',
      body: 'Keine Verbindung: Host, Ports (Web 80, Stream 8001) und Zugangsdaten prüfen und den Receiver zum Vergleich im Browser öffnen. Senderliste da, aber kein Bild: meist der Stream-Port oder ein Transcoding-Profil. Auf Android TV navigierst du mit dem D-Pad; Textfelder öffnen die Bildschirmtastatur erst mit OK.',
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
      body: 'Add a receiver in the app with its host, credentials and ports. On your local network the host is the receiver’s internal IP. For remote access either use a VPN into your home network (recommended: WireGuard) and keep using the internal IP, or an externally reachable router address (static IP or DynDNS) with a port forward to the receiver. Credentials are stored encrypted.',
    },
    {
      heading: '4. Get going',
      body: 'Browse bouquets, start live TV with EPG, play recordings and use timers. DVB subtitles and teletext can be shown right away.',
    },
    {
      heading: 'Live TV, radio and bouquets',
      body: 'Pick a bouquet and start a channel with one click. The channel list shows picons, what is on now and the EPG entry. The zap command goes to the receiver over OpenWebIF; the picture arrives as a transport stream from the stream port.',
    },
    {
      heading: 'EPG, timers and recordings',
      body: 'The programme guide shows what is on per channel. From an EPG entry you create a record timer or start an instant recording; auto timers and power timers are managed in the same view. Finished recordings play from the recordings list.',
    },
    {
      heading: 'Subtitles and teletext',
      body: 'DVB subtitles and teletext are decoded by the app itself from the transport stream, with no external libraries. Pick the track in the player; teletext opens as a page view with numeric input.',
    },
    {
      heading: 'Remote control',
      body: 'The virtual remote sends the same key codes as the physical one over OpenWebIF. That also reaches receiver menus the app does not rebuild.',
    },
    {
      heading: 'Editing channel lists and bouquets',
      body: 'The bouquet editor sorts channels, moves them between bouquets and curates favourites. The app reads and writes those files on the receiver over SSH; you confirm the receiver’s SSH host key before the first access.',
    },
    {
      heading: 'Receiver settings',
      body: 'The receiver’s OpenWebIF settings can be changed from the app, including standby and reboot. What is offered there depends on the receiver’s image.',
    },
    {
      heading: 'When something does not work',
      body: 'No connection: check host, ports (web 80, stream 8001) and credentials, and open the receiver in a browser for comparison. Channel list but no picture: usually the stream port or a transcoding profile. On Android TV you navigate with the D-pad; text fields only open the on-screen keyboard on OK.',
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
      body: 'Añade un receptor en la app con su host, credenciales y puertos. En tu red local el host es la IP interna del receptor. Para el acceso remoto, usa una VPN a tu red doméstica (recomendado: WireGuard) y sigue usando la IP interna, o una dirección del router accesible desde fuera (IP fija o DynDNS) con reenvío de puertos hacia el receptor. Las credenciales se guardan cifradas.',
    },
    {
      heading: '4. Empezar',
      body: 'Explora bouquets, inicia TV en directo con EPG, reproduce grabaciones y usa temporizadores. Los subtítulos DVB y el teletexto se muestran al instante.',
    },
    {
      heading: 'TV en directo, radio y bouquets',
      body: 'Elige un bouquet e inicia un canal con un clic. La lista muestra logos, el programa actual y la entrada del EPG. El cambio de canal se envía al receptor por OpenWebIF; la imagen llega como flujo de transporte desde el puerto de streaming.',
    },
    {
      heading: 'EPG, temporizadores y grabaciones',
      body: 'La guía muestra la programación por canal. Desde una entrada del EPG creas un temporizador de grabación o inicias una grabación inmediata; los temporizadores automáticos y de apagado se gestionan en la misma vista. Las grabaciones terminadas se reproducen desde la lista de grabaciones.',
    },
    {
      heading: 'Subtítulos y teletexto',
      body: 'La app decodifica los subtítulos DVB y el teletexto desde el flujo de transporte, sin librerías externas. Selecciona la pista en el reproductor; el teletexto se abre como vista de páginas con entrada numérica.',
    },
    {
      heading: 'Mando a distancia',
      body: 'El mando virtual envía los mismos códigos de tecla que el mando físico a través de OpenWebIF. Así también llegas a menús del receptor que la app no reproduce.',
    },
    {
      heading: 'Editar listas de canales y bouquets',
      body: 'El editor de bouquets ordena canales, los mueve entre bouquets y mantiene los favoritos. La app lee y escribe esos archivos en el receptor por SSH; antes del primer acceso confirmas la clave de host SSH.',
    },
    {
      heading: 'Ajustes del receptor',
      body: 'Los ajustes de OpenWebIF del receptor se cambian desde la app, incluidos el modo de espera y el reinicio. Lo que se ofrece depende de la imagen del receptor.',
    },
    {
      heading: 'Si algo no funciona',
      body: 'Sin conexión: comprueba host, puertos (web 80, streaming 8001) y credenciales, y abre el receptor en un navegador para comparar. Hay lista de canales pero no imagen: casi siempre el puerto de streaming o un perfil de transcodificación. En Android TV navegas con el D-pad; los campos de texto abren el teclado solo al pulsar OK.',
    },
  ],
  fr: [
    {
      heading: '1. Installer',
      body: 'Téléchargez l’installateur pour votre plateforme depuis la page Téléchargements et lancez-le. Sur ordinateur, l’app vérifie les mises à jour au démarrage.',
    },
    {
      heading: '2. Préparer le récepteur',
      body: 'Activez le plugin OpenWebIF sur votre récepteur Enigma2. Notez l’hôte/IP, éventuellement identifiant/mot de passe, ainsi que le port web (80 par défaut) et le port de streaming (8001 par défaut).',
    },
    {
      heading: '3. Ajouter le récepteur',
      body: 'Ajoutez un récepteur dans l’app avec son hôte, ses identifiants et ses ports. Sur votre réseau local, l’hôte est l’IP interne du récepteur. Pour l’accès à distance, utilisez soit un VPN vers votre réseau domestique (recommandé : WireGuard) en gardant l’IP interne, soit une adresse de routeur accessible depuis l’extérieur (IP fixe ou DynDNS) avec une redirection de port vers le récepteur. Les identifiants sont stockés chiffrés.',
    },
    {
      heading: '4. C’est parti',
      body: 'Parcourez les bouquets, lancez la TV en direct avec l’EPG, lisez les enregistrements et utilisez les minuteries. Les sous-titres DVB et le télétexte s’affichent immédiatement.',
    },
    {
      heading: 'TV en direct, radio et bouquets',
      body: 'Choisissez un bouquet et lancez une chaîne d’un clic. La liste affiche les picons, le programme en cours et l’entrée EPG. La commande de zapping part vers le récepteur via OpenWebIF ; l’image arrive en flux de transport depuis le port de streaming.',
    },
    {
      heading: 'EPG, minuteries et enregistrements',
      body: 'Le guide affiche le programme par chaîne. Depuis une entrée EPG, vous créez une minuterie d’enregistrement ou lancez un enregistrement immédiat ; les minuteries automatiques et d’alimentation se gèrent dans la même vue. Les enregistrements terminés se lisent depuis la liste des enregistrements.',
    },
    {
      heading: 'Sous-titres et télétexte',
      body: 'L’app décode elle-même les sous-titres DVB et le télétexte depuis le flux de transport, sans bibliothèque externe. Sélectionnez la piste dans le lecteur ; le télétexte s’ouvre en vue de pages avec saisie numérique.',
    },
    {
      heading: 'Télécommande',
      body: 'La télécommande virtuelle envoie les mêmes codes de touches que la télécommande physique via OpenWebIF. Vous atteignez ainsi aussi les menus du récepteur que l’app ne reproduit pas.',
    },
    {
      heading: 'Modifier les listes de chaînes et les bouquets',
      body: 'L’éditeur de bouquets trie les chaînes, les déplace entre bouquets et entretient les favoris. L’app lit et écrit ces fichiers sur le récepteur via SSH ; vous confirmez sa clé d’hôte SSH avant le premier accès.',
    },
    {
      heading: 'Réglages du récepteur',
      body: 'Les réglages OpenWebIF du récepteur se modifient depuis l’app, veille et redémarrage inclus. Ce qui est proposé dépend de l’image du récepteur.',
    },
    {
      heading: 'Si quelque chose ne fonctionne pas',
      body: 'Pas de connexion : vérifiez l’hôte, les ports (web 80, streaming 8001) et les identifiants, et ouvrez le récepteur dans un navigateur pour comparer. Liste de chaînes présente mais pas d’image : le plus souvent le port de streaming ou un profil de transcodage. Sur Android TV, la navigation se fait au D-pad ; les champs de texte n’ouvrent le clavier qu’avec OK.',
    },
  ],
  it: [
    {
      heading: '1. Installa',
      body: 'Scarica l’installer per la tua piattaforma dalla pagina Download ed eseguilo. Su desktop l’app controlla gli aggiornamenti all’avvio.',
    },
    {
      heading: '2. Prepara il ricevitore',
      body: 'Attiva il plugin OpenWebIF sul tuo ricevitore Enigma2. Annota host/IP, eventuale utente/password e la porta web (80 predefinita) e di streaming (8001 predefinita).',
    },
    {
      heading: '3. Aggiungi il ricevitore',
      body: 'Aggiungi un ricevitore nell’app con host, credenziali e porte. Nella rete locale l’host è l’IP interno del ricevitore. Per l’accesso remoto usa una VPN verso la rete domestica (consigliato: WireGuard) mantenendo l’IP interno, oppure un indirizzo del router raggiungibile dall’esterno (IP fisso o DynDNS) con port forwarding verso il ricevitore. Le credenziali sono salvate cifrate.',
    },
    {
      heading: '4. Inizia',
      body: 'Sfoglia i bouquet, avvia la TV in diretta con l’EPG, riproduci le registrazioni e usa i timer. Sottotitoli DVB e televideo si mostrano subito.',
    },
    {
      heading: 'TV in diretta, radio e bouquet',
      body: 'Scegli un bouquet e avvia un canale con un clic. L’elenco mostra i picon, il programma in corso e la voce EPG. Il comando di cambio canale va al ricevitore via OpenWebIF; l’immagine arriva come transport stream dalla porta di streaming.',
    },
    {
      heading: 'EPG, timer e registrazioni',
      body: 'La guida mostra il programma per canale. Da una voce EPG crei un timer di registrazione o avvii una registrazione immediata; AutoTimer e timer di accensione si gestiscono nella stessa vista. Le registrazioni concluse si riproducono dall’elenco registrazioni.',
    },
    {
      heading: 'Sottotitoli e televideo',
      body: 'L’app decodifica da sé sottotitoli DVB e televideo dal transport stream, senza librerie esterne. Scegli la traccia nel player; il televideo si apre come vista a pagine con inserimento numerico.',
    },
    {
      heading: 'Telecomando',
      body: 'Il telecomando virtuale invia gli stessi codici tasto di quello fisico via OpenWebIF. Così raggiungi anche i menu del ricevitore che l’app non ricostruisce.',
    },
    {
      heading: 'Modificare liste canali e bouquet',
      body: 'L’editor dei bouquet ordina i canali, li sposta tra i bouquet e cura i preferiti. L’app legge e scrive quei file sul ricevitore via SSH; prima del primo accesso confermi la sua chiave host SSH.',
    },
    {
      heading: 'Impostazioni del ricevitore',
      body: 'Le impostazioni OpenWebIF del ricevitore si cambiano dall’app, standby e riavvio compresi. Quello che viene offerto dipende dall’immagine del ricevitore.',
    },
    {
      heading: 'Se qualcosa non funziona',
      body: 'Nessuna connessione: controlla host, porte (web 80, streaming 8001) e credenziali, e apri il ricevitore nel browser per confronto. Lista canali presente ma nessuna immagine: di solito la porta di streaming o un profilo di transcodifica. Su Android TV navighi con il D-pad; i campi di testo aprono la tastiera solo con OK.',
    },
  ],
};

export function getManual(lang: Lang): InfoBlock[] {
  return manual[lang] ?? manual[defaultLang];
}

/**
 * The security page: what leaves the device, and where to.
 *
 * Every claim here is checkable against the application source in the sibling
 * repository `madoe21/enigma2_player_source` (enigma2_player-6jv) - that was
 * the condition the PO put on this page, because a reassuring sentence nobody
 * verified is worse than no page. The sources, as of 2026-10-17:
 *
 *  - `lib/services/data_protector.dart` - AES-256-GCM at rest for receiver
 *    passwords, 256-bit key in the platform's application-support directory,
 *    additionally sealed with DPAPI on Windows, and deliberately NOT next to
 *    the portable database, so a copied app folder decrypts nothing;
 *  - `lib/services/device_id_service.dart` - the device id is a random UUIDv4,
 *    explicitly not derived from hardware serials or MAC addresses, stored
 *    encrypted;
 *  - `lib/services/license_api_client.dart` - what the licence server is told,
 *    and that the session (JWT + refresh) is persisted through the same
 *    encryption;
 *  - `lib/core/constants/app_config.dart` - the OpenWebIF endpoints, and the
 *    desktop update check against `api.github.com/.../releases/latest`;
 *  - `pubspec.yaml` - no analytics, crash-reporting or advertising dependency
 *    of any kind, which is what makes "no telemetry" a fact rather than a
 *    promise;
 *  - `lib/services/ssh_host_key_store.dart` + `ssh_host_key_confirmation.dart`
 *    - the host key of the receiver is confirmed and remembered before the
 *    bouquet editor writes anything over SSH.
 */
const securityInfo: Record<Lang, InfoBlock[]> = {
  de: [
    {
      heading: 'Was auf deinem Gerät bleibt',
      body: 'Receiver-Zugangsdaten verlassen dein Gerät nicht. Sie liegen verschlüsselt (AES-256-GCM); der Schlüssel liegt getrennt von der Datenbank im Anwendungsdatenverzeichnis deines Benutzerkontos, unter Windows zusätzlich an dein Windows-Konto gebunden. Ein kopierter Programmordner lässt sich damit nicht entschlüsseln.',
    },
    {
      heading: 'Die Verbindung zum Receiver',
      body: 'Die App spricht direkt mit deinem Receiver im lokalen Netzwerk — OpenWebIF über den Web-Port (Standard 80) und den Stream-Port (Standard 8001). OpenWebIF bietet dort in der Regel kein HTTPS an, Zugangsdaten gehen also unverschlüsselt über dein eigenes LAN. Für den Zugriff von außen ist deshalb ein VPN ins Heimnetz die empfohlene Lösung und eine offene Portweiterleitung die schlechteste.',
    },
    {
      heading: 'Was an den Lizenzserver geht',
      body: 'Für Anmeldung, Kauf und Lizenzprüfung: deine E-Mail-Adresse, die Gerätekennung und der angefragte Lizenzstatus — per HTTPS. Die Sitzung (Token) wird mit derselben Verschlüsselung gespeichert wie die Zugangsdaten. Zahlungen laufen im Shop des Lizenzservers, nicht in der App.',
    },
    {
      heading: 'Die Gerätekennung',
      body: 'Die Kennung, mit der ein Gerät auf deine Lizenz gezählt wird, ist eine Zufallszahl (UUIDv4) — bewusst nicht aus Seriennummern, MAC-Adressen oder Hardware-Kennungen abgeleitet, damit sie dich nicht über andere Programme hinweg identifizierbar macht. Sie wird einmal erzeugt und verschlüsselt gespeichert; eine Neuinstallation erhält eine neue Kennung.',
    },
    {
      heading: 'Updateprüfung',
      body: 'Die Desktop-Version fragt beim Start die Release-Informationen dieses Projekts bei GitHub ab, um auf eine neue Version hinzuweisen. Dabei werden keine Konto- oder Lizenzdaten mitgeschickt. Die Mobil-Versionen aktualisieren sich über App Store beziehungsweise Google Play.',
    },
    {
      heading: 'Was die App nicht tut',
      body: 'Keine Telemetrie, keine Analytics, keine Werbung, kein Tracking über Programme hinweg. Die App bindet dafür auch keine Bibliothek ein — das ist in der Abhängigkeitsliste des Quellcodes nachprüfbar und nicht nur eine Zusage.',
    },
    {
      heading: 'Schreibzugriff auf den Receiver',
      body: 'Der Bouquet-Editor ändert Dateien auf dem Receiver per SSH. Der Hostschlüssel des Receivers wird dabei einmal bestätigt und gespeichert; ändert er sich später, fragt die App erneut, statt stillschweigend weiterzumachen.',
    },
    {
      heading: 'Diese Website',
      body: 'Diese Seiten sind vorgefertigte HTML-Dateien ohne Server und laden zur Laufzeit nichts von Dritten. Gespeichert wird genau ein Cookie für deine Cookie-Entscheidung; der Shop des Lizenzservers wird erst nach deiner Zustimmung eingebettet. Details stehen in der Cookie-Richtlinie.',
    },
    {
      heading: 'Sicherheitslücke melden',
      body: 'Meldungen zu Sicherheitslücken nehmen wir über die Kontaktseite entgegen — per E-Mail an die dort genannte Adresse mit „Security“ im Betreff. Bitte gib uns Zeit zur Behebung, bevor du Details veröffentlichst; technische Details bitte nicht in ein öffentliches GitHub-Issue schreiben.',
    },
  ],
  en: [
    {
      heading: 'What stays on your device',
      body: 'Receiver credentials never leave your device. They are stored encrypted (AES-256-GCM); the key lives separately from the database, in your user account’s application-support directory, and on Windows it is additionally tied to your Windows account. A copied program folder therefore decrypts nothing.',
    },
    {
      heading: 'The connection to the receiver',
      body: 'The app talks to your receiver directly on the local network — OpenWebIF over the web port (default 80) and the stream port (default 8001). OpenWebIF normally offers no HTTPS there, so credentials travel unencrypted across your own LAN. For access from outside, a VPN into your home network is the recommended answer and an open port forward the worst one.',
    },
    {
      heading: 'What the licence server is told',
      body: 'For sign-in, purchase and licence checks: your email address, the device id and the licence status being asked about — over HTTPS. The session token is stored with the same encryption as the credentials. Payment happens in the licence server’s shop, not in the app.',
    },
    {
      heading: 'The device id',
      body: 'The id that counts a device against your licence is a random value (UUIDv4) — deliberately not derived from serial numbers, MAC addresses or hardware identifiers, so it cannot be used to recognise you across other programs. It is generated once and stored encrypted; a fresh installation gets a new one.',
    },
    {
      heading: 'The update check',
      body: 'On startup the desktop version asks GitHub for this project’s release information in order to point out a newer version. No account or licence data is sent with it. The mobile versions update through the App Store and Google Play.',
    },
    {
      heading: 'What the app does not do',
      body: 'No telemetry, no analytics, no advertising, no cross-app tracking. The app ships no library for any of it either — that is checkable in the source’s dependency list rather than merely promised.',
    },
    {
      heading: 'Write access to the receiver',
      body: 'The bouquet editor changes files on the receiver over SSH. The receiver’s host key is confirmed once and remembered; if it changes later the app asks again instead of quietly carrying on.',
    },
    {
      heading: 'This website',
      body: 'These pages are prebuilt HTML files with no server, and they load nothing from third parties at runtime. Exactly one cookie is stored, for your cookie decision; the licence server’s shop is embedded only after you agree. The cookie policy has the details.',
    },
    {
      heading: 'Reporting a vulnerability',
      body: 'Please report security issues through the contact page — by email to the address given there, with “Security” in the subject. Give us time to fix it before you publish details, and please keep technical details out of a public GitHub issue.',
    },
  ],
  es: [
    {
      heading: 'Lo que permanece en tu dispositivo',
      body: 'Las credenciales del receptor no salen de tu dispositivo. Se guardan cifradas (AES-256-GCM); la clave está separada de la base de datos, en el directorio de datos de aplicación de tu cuenta de usuario, y en Windows además ligada a tu cuenta de Windows. Una carpeta de programa copiada no se puede descifrar.',
    },
    {
      heading: 'La conexión con el receptor',
      body: 'La app habla directamente con tu receptor en la red local: OpenWebIF por el puerto web (80 por defecto) y el puerto de streaming (8001 por defecto). Allí OpenWebIF normalmente no ofrece HTTPS, así que las credenciales viajan sin cifrar por tu propia LAN. Para el acceso desde fuera, una VPN a tu red doméstica es la solución recomendada y un reenvío de puertos abierto la peor.',
    },
    {
      heading: 'Lo que se envía al servidor de licencias',
      body: 'Para el inicio de sesión, la compra y la comprobación de licencia: tu dirección de correo, el identificador de dispositivo y el estado de licencia consultado, por HTTPS. El token de sesión se guarda con el mismo cifrado que las credenciales. El pago ocurre en la tienda del servidor de licencias, no en la app.',
    },
    {
      heading: 'El identificador de dispositivo',
      body: 'El identificador con el que un dispositivo cuenta en tu licencia es un valor aleatorio (UUIDv4), deliberadamente no derivado de números de serie, direcciones MAC o identificadores de hardware, de modo que no permite reconocerte en otros programas. Se genera una vez y se guarda cifrado; una instalación nueva recibe otro.',
    },
    {
      heading: 'La comprobación de actualizaciones',
      body: 'Al iniciar, la versión de escritorio consulta en GitHub la información de versiones de este proyecto para avisar de una más nueva. No se envían datos de cuenta ni de licencia. Las versiones móviles se actualizan por App Store y Google Play.',
    },
    {
      heading: 'Lo que la app no hace',
      body: 'Sin telemetría, sin analítica, sin publicidad, sin seguimiento entre aplicaciones. La app tampoco incluye ninguna librería para ello: es verificable en la lista de dependencias del código fuente, no solo una promesa.',
    },
    {
      heading: 'Acceso de escritura al receptor',
      body: 'El editor de bouquets modifica archivos del receptor por SSH. La clave de host del receptor se confirma una vez y se recuerda; si cambia más adelante, la app vuelve a preguntar en lugar de continuar en silencio.',
    },
    {
      heading: 'Este sitio web',
      body: 'Estas páginas son archivos HTML preconstruidos sin servidor y no cargan nada de terceros en tiempo de ejecución. Se guarda exactamente una cookie, para tu decisión sobre cookies; la tienda del servidor de licencias solo se incrusta tras tu consentimiento. Los detalles están en la política de cookies.',
    },
    {
      heading: 'Informar de una vulnerabilidad',
      body: 'Informa de problemas de seguridad a través de la página de contacto: por correo a la dirección indicada allí, con «Security» en el asunto. Danos tiempo para corregirlo antes de publicar detalles y, por favor, no incluyas detalles técnicos en una incidencia pública de GitHub.',
    },
  ],
  fr: [
    {
      heading: 'Ce qui reste sur votre appareil',
      body: 'Les identifiants du récepteur ne quittent pas votre appareil. Ils sont stockés chiffrés (AES-256-GCM) ; la clé se trouve séparément de la base de données, dans le répertoire de données applicatives de votre compte, et sous Windows elle est en plus liée à votre compte Windows. Un dossier de programme copié ne peut donc rien déchiffrer.',
    },
    {
      heading: 'La connexion au récepteur',
      body: 'L’app parle directement à votre récepteur sur le réseau local : OpenWebIF via le port web (80 par défaut) et le port de streaming (8001 par défaut). OpenWebIF n’y propose généralement pas de HTTPS, les identifiants circulent donc en clair sur votre propre réseau. Pour un accès depuis l’extérieur, un VPN vers votre réseau domestique est la bonne réponse et une redirection de port ouverte la pire.',
    },
    {
      heading: 'Ce qui est transmis au serveur de licences',
      body: 'Pour la connexion, l’achat et la vérification de licence : votre adresse e-mail, l’identifiant d’appareil et l’état de licence demandé — en HTTPS. Le jeton de session est stocké avec le même chiffrement que les identifiants. Le paiement a lieu dans la boutique du serveur de licences, pas dans l’app.',
    },
    {
      heading: 'L’identifiant d’appareil',
      body: 'L’identifiant qui décompte un appareil de votre licence est une valeur aléatoire (UUIDv4), volontairement pas dérivée de numéros de série, d’adresses MAC ou d’identifiants matériels, afin qu’il ne permette pas de vous reconnaître dans d’autres programmes. Il est généré une fois et stocké chiffré ; une nouvelle installation en reçoit un autre.',
    },
    {
      heading: 'La vérification des mises à jour',
      body: 'Au démarrage, la version bureau interroge GitHub sur les informations de version de ce projet afin de signaler une version plus récente. Aucune donnée de compte ou de licence n’est transmise. Les versions mobiles se mettent à jour via l’App Store et Google Play.',
    },
    {
      heading: 'Ce que l’app ne fait pas',
      body: 'Pas de télémétrie, pas d’analytique, pas de publicité, pas de suivi entre applications. L’app n’embarque aucune bibliothèque pour cela non plus : c’est vérifiable dans la liste des dépendances du code source, et pas seulement promis.',
    },
    {
      heading: 'Accès en écriture au récepteur',
      body: 'L’éditeur de bouquets modifie des fichiers sur le récepteur via SSH. La clé d’hôte du récepteur est confirmée une fois puis mémorisée ; si elle change par la suite, l’app redemande au lieu de continuer silencieusement.',
    },
    {
      heading: 'Ce site web',
      body: 'Ces pages sont des fichiers HTML préconstruits sans serveur et ne chargent rien de tiers à l’exécution. Un seul cookie est stocké, pour votre décision sur les cookies ; la boutique du serveur de licences n’est intégrée qu’après votre accord. Les détails figurent dans la politique de cookies.',
    },
    {
      heading: 'Signaler une faille',
      body: 'Signalez les problèmes de sécurité via la page de contact : par e-mail à l’adresse qui y figure, avec « Security » en objet. Laissez-nous le temps de corriger avant de publier des détails, et évitez les détails techniques dans un ticket GitHub public.',
    },
  ],
  it: [
    {
      heading: 'Cosa resta sul tuo dispositivo',
      body: 'Le credenziali del ricevitore non lasciano il dispositivo. Sono salvate cifrate (AES-256-GCM); la chiave sta separata dal database, nella cartella dati applicazione del tuo account utente, e su Windows è inoltre legata al tuo account Windows. Una cartella di programma copiata non decifra nulla.',
    },
    {
      heading: 'La connessione al ricevitore',
      body: 'L’app parla direttamente con il ricevitore nella rete locale: OpenWebIF sulla porta web (80 predefinita) e sulla porta di streaming (8001 predefinita). Lì OpenWebIF di norma non offre HTTPS, quindi le credenziali viaggiano in chiaro sulla tua rete. Per l’accesso dall’esterno la risposta consigliata è una VPN verso la rete domestica, e la peggiore un port forwarding aperto.',
    },
    {
      heading: 'Cosa arriva al server delle licenze',
      body: 'Per accesso, acquisto e verifica della licenza: il tuo indirizzo e-mail, l’identificativo del dispositivo e lo stato di licenza richiesto, via HTTPS. Il token di sessione è salvato con la stessa cifratura delle credenziali. Il pagamento avviene nel negozio del server delle licenze, non nell’app.',
    },
    {
      heading: 'L’identificativo del dispositivo',
      body: 'L’identificativo con cui un dispositivo viene conteggiato sulla licenza è un valore casuale (UUIDv4), deliberatamente non derivato da numeri di serie, indirizzi MAC o identificativi hardware, così da non renderti riconoscibile in altri programmi. Viene generato una volta e salvato cifrato; una nuova installazione ne riceve un altro.',
    },
    {
      heading: 'Il controllo aggiornamenti',
      body: 'All’avvio la versione desktop chiede a GitHub le informazioni di rilascio di questo progetto per segnalare una versione più recente. Non vengono inviati dati di account o di licenza. Le versioni mobili si aggiornano tramite App Store e Google Play.',
    },
    {
      heading: 'Cosa l’app non fa',
      body: 'Nessuna telemetria, nessuna analitica, nessuna pubblicità, nessun tracciamento tra applicazioni. L’app non include nemmeno una libreria per farlo: è verificabile nell’elenco delle dipendenze del codice sorgente, non solo promesso.',
    },
    {
      heading: 'Accesso in scrittura al ricevitore',
      body: 'L’editor dei bouquet modifica file sul ricevitore via SSH. La chiave host del ricevitore viene confermata una volta e ricordata; se poi cambia, l’app chiede di nuovo invece di proseguire in silenzio.',
    },
    {
      heading: 'Questo sito web',
      body: 'Queste pagine sono file HTML pregenerati senza server e non caricano nulla da terzi a runtime. Viene salvato esattamente un cookie, per la tua decisione sui cookie; il negozio del server delle licenze viene incorporato solo dopo il tuo consenso. I dettagli sono nella politica dei cookie.',
    },
    {
      heading: 'Segnalare una vulnerabilità',
      body: 'Segnala i problemi di sicurezza tramite la pagina dei contatti: per e-mail all’indirizzo indicato lì, con «Security» nell’oggetto. Dacci il tempo di correggere prima di pubblicare dettagli e, per favore, non inserire dettagli tecnici in una issue pubblica su GitHub.',
    },
  ],
};

export function getSecurityInfo(lang: Lang): InfoBlock[] {
  return securityInfo[lang] ?? securityInfo[defaultLang];
}

export interface Shot {
  file: string;
  caption: string;
}

// Real product screenshots (public/screenshots/*.jpg). Same order per locale.
const screenshots: Record<Lang, Shot[]> = {
  de: [
    {
      file: 'tv-playback.jpg',
      caption: 'TV-Wiedergabe: Tonspur, Untertitel, Videotext und Programminfo',
    },
    {
      file: 'channel-list.jpg',
      caption: 'Senderliste mit Streaming-Auswahl, Aufnahme- und Umschalt-Button',
    },
    { file: 'epg.jpg', caption: 'Elektronischer Programmführer (EPG)' },
    { file: 'epg-detail.jpg', caption: 'EPG-Detailansicht mit Timer-/Aufnahme-Aktionen' },
    { file: 'bouquet-editor.jpg', caption: 'Bouquet-Editor: Senderliste bearbeiten' },
    { file: 'timer.jpg', caption: 'Timer planen (Aufnahme-, Auto- und Power-Timer)' },
    { file: 'remote.jpg', caption: 'Virtuelle Fernbedienung' },
    { file: 'receiver-settings.jpg', caption: 'Receiver-Einstellungen über OpenWebIF' },
    { file: 'sat-finder.jpg', caption: 'Sat-Finder / Signalanzeige' },
    { file: 'teletext.jpg', caption: 'Transparenter Videotext über dem laufenden Bild' },
    { file: 'receivers.jpg', caption: 'Mehrere Receiver konfigurieren und auswählen' },
    { file: 'add-receiver.jpg', caption: 'Receiver hinzufügen' },
    { file: 'settings.jpg', caption: 'Einstellungen: Sprache, Light/Dark, Senderlisten, Teletext' },
  ],
  en: [
    {
      file: 'tv-playback.jpg',
      caption: 'TV playback: audio track, subtitles, teletext and programme info',
    },
    { file: 'channel-list.jpg', caption: 'Channel list with streaming, record and zap buttons' },
    { file: 'epg.jpg', caption: 'Electronic programme guide (EPG)' },
    { file: 'epg-detail.jpg', caption: 'EPG detail view with timer / record actions' },
    { file: 'bouquet-editor.jpg', caption: 'Bouquet editor: edit the channel list' },
    { file: 'timer.jpg', caption: 'Plan timers (record, auto and power timers)' },
    { file: 'remote.jpg', caption: 'Virtual remote control' },
    { file: 'receiver-settings.jpg', caption: 'Receiver settings over OpenWebIF' },
    { file: 'sat-finder.jpg', caption: 'Sat finder / signal meter' },
    { file: 'teletext.jpg', caption: 'Transparent teletext over the live picture' },
    { file: 'receivers.jpg', caption: 'Configure and switch between multiple receivers' },
    { file: 'add-receiver.jpg', caption: 'Add a receiver' },
    { file: 'settings.jpg', caption: 'Settings: language, light/dark, channel lists, teletext' },
  ],
  es: [
    {
      file: 'tv-playback.jpg',
      caption: 'Reproducción de TV: audio, subtítulos, teletexto e info del programa',
    },
    { file: 'channel-list.jpg', caption: 'Lista de canales con streaming, grabación y cambio' },
    { file: 'epg.jpg', caption: 'Guía electrónica de programación (EPG)' },
    {
      file: 'epg-detail.jpg',
      caption: 'Vista de detalle del EPG con acciones de temporizador/grabación',
    },
    { file: 'bouquet-editor.jpg', caption: 'Editor de bouquets: editar la lista de canales' },
    {
      file: 'timer.jpg',
      caption: 'Planificar temporizadores (grabación, automáticos y de apagado)',
    },
    { file: 'remote.jpg', caption: 'Mando a distancia virtual' },
    { file: 'receiver-settings.jpg', caption: 'Ajustes del receptor vía OpenWebIF' },
    { file: 'sat-finder.jpg', caption: 'Buscador de satélite / medidor de señal' },
    { file: 'teletext.jpg', caption: 'Teletexto transparente sobre la imagen en directo' },
    { file: 'receivers.jpg', caption: 'Configura y cambia entre varios receptores' },
    { file: 'add-receiver.jpg', caption: 'Añadir un receptor' },
    {
      file: 'settings.jpg',
      caption: 'Ajustes: idioma, claro/oscuro, listas de canales, teletexto',
    },
  ],
  fr: [
    {
      file: 'tv-playback.jpg',
      caption: 'Lecture TV : piste audio, sous-titres, télétexte et infos programme',
    },
    {
      file: 'channel-list.jpg',
      caption: 'Liste des chaînes avec streaming, enregistrement et zapping',
    },
    { file: 'epg.jpg', caption: 'Guide électronique des programmes (EPG)' },
    {
      file: 'epg-detail.jpg',
      caption: 'Vue détaillée de l’EPG avec actions minuterie/enregistrement',
    },
    { file: 'bouquet-editor.jpg', caption: 'Éditeur de bouquets : modifier la liste des chaînes' },
    { file: 'timer.jpg', caption: 'Planifier des minuteries (enregistrement, auto et extinction)' },
    { file: 'remote.jpg', caption: 'Télécommande virtuelle' },
    { file: 'receiver-settings.jpg', caption: 'Réglages du récepteur via OpenWebIF' },
    { file: 'sat-finder.jpg', caption: 'Chercheur de satellite / mesure du signal' },
    { file: 'teletext.jpg', caption: 'Télétexte transparent sur l’image en direct' },
    { file: 'receivers.jpg', caption: 'Configurer et basculer entre plusieurs récepteurs' },
    { file: 'add-receiver.jpg', caption: 'Ajouter un récepteur' },
    {
      file: 'settings.jpg',
      caption: 'Réglages : langue, clair/sombre, listes de chaînes, télétexte',
    },
  ],
  it: [
    {
      file: 'tv-playback.jpg',
      caption: 'Riproduzione TV: traccia audio, sottotitoli, televideo e info programma',
    },
    { file: 'channel-list.jpg', caption: 'Lista canali con streaming, registrazione e cambio' },
    { file: 'epg.jpg', caption: 'Guida elettronica ai programmi (EPG)' },
    { file: 'epg-detail.jpg', caption: 'Vista dettaglio EPG con azioni timer/registrazione' },
    { file: 'bouquet-editor.jpg', caption: 'Editor di bouquet: modifica la lista canali' },
    { file: 'timer.jpg', caption: 'Pianifica timer (registrazione, automatici e di spegnimento)' },
    { file: 'remote.jpg', caption: 'Telecomando virtuale' },
    { file: 'receiver-settings.jpg', caption: 'Impostazioni del ricevitore via OpenWebIF' },
    { file: 'sat-finder.jpg', caption: 'Cerca satellite / misuratore di segnale' },
    { file: 'teletext.jpg', caption: 'Televideo trasparente sull’immagine in diretta' },
    { file: 'receivers.jpg', caption: 'Configura e passa tra più ricevitori' },
    { file: 'add-receiver.jpg', caption: 'Aggiungi un ricevitore' },
    {
      file: 'settings.jpg',
      caption: 'Impostazioni: lingua, chiaro/scuro, liste canali, televideo',
    },
  ],
};

export function getScreenshots(lang: Lang): Shot[] {
  return screenshots[lang] ?? screenshots[defaultLang];
}

/**
 * Where a shot's file lives, relative to the deployed base.
 *
 * Here rather than in the components that show them: the gallery and the
 * landing hero both render the same list, and the directory the files sit in
 * is a fact about the data, not about either page. `base href` is prefixed by
 * Angular, so never by us.
 */
export function shotSource(shot: Shot): string {
  return `screenshots/${shot.file}`;
}
