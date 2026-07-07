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
      desc: 'Windows, macOS, Linux, Android und iOS — eine App, überall dieselbe Oberfläche, in de/en/es.',
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
      desc: 'Windows, macOS, Linux, Android and iOS — one app, the same UI everywhere, in de/en/es.',
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
      desc: 'Windows, macOS, Linux, Android e iOS — una app, la misma interfaz, en de/en/es/fr/it.',
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
      desc: 'Windows, macOS, Linux, Android et iOS — une app, la même interface partout, en de/en/es/fr/it.',
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
      desc: 'Windows, macOS, Linux, Android e iOS — una app, la stessa interfaccia ovunque, in de/en/es/fr/it.',
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
      body: 'Lege in der App einen Receiver mit Host, Zugangsdaten und Ports an. Im lokalen Netzwerk ist der Host die interne IP des Receivers. Für den Zugriff von unterwegs entweder per VPN ins Heimnetz (empfohlen: WireGuard) und weiterhin die interne IP nutzen, oder eine von außen erreichbare Router-Adresse (feste IP oder DynDNS) mit Portweiterleitung auf den Receiver. Zugangsdaten werden verschlüsselt gespeichert.',
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
      body: 'Add a receiver in the app with its host, credentials and ports. On your local network the host is the receiver’s internal IP. For remote access either use a VPN into your home network (recommended: WireGuard) and keep using the internal IP, or an externally reachable router address (static IP or DynDNS) with a port forward to the receiver. Credentials are stored encrypted.',
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
      body: 'Añade un receptor en la app con su host, credenciales y puertos. En tu red local el host es la IP interna del receptor. Para el acceso remoto, usa una VPN a tu red doméstica (recomendado: WireGuard) y sigue usando la IP interna, o una dirección del router accesible desde fuera (IP fija o DynDNS) con reenvío de puertos hacia el receptor. Las credenciales se guardan cifradas.',
    },
    {
      heading: '4. Empezar',
      body: 'Explora bouquets, inicia TV en directo con EPG, reproduce grabaciones y usa temporizadores. Los subtítulos DVB y el teletexto se muestran al instante.',
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
  ],
};

export function getDocs(lang: Lang): InfoBlock[] {
  return docs[lang] ?? docs[defaultLang];
}

export interface Shot {
  file: string;
  caption: string;
}

// Real product screenshots (public/screenshots/*.jpg). Same order per locale.
const screenshots: Record<Lang, Shot[]> = {
  de: [
    {file: 'tv-playback.jpg', caption: 'TV-Wiedergabe: Tonspur, Untertitel, Videotext und Programminfo'},
    {file: 'channel-list.jpg', caption: 'Senderliste mit Streaming-Auswahl, Aufnahme- und Umschalt-Button'},
    {file: 'epg.jpg', caption: 'Elektronischer Programmführer (EPG)'},
    {file: 'epg-detail.jpg', caption: 'EPG-Detailansicht mit Timer-/Aufnahme-Aktionen'},
    {file: 'bouquet-editor.jpg', caption: 'Bouquet-Editor: Senderliste bearbeiten'},
    {file: 'timer.jpg', caption: 'Timer planen (Aufnahme-, Auto- und Power-Timer)'},
    {file: 'remote.jpg', caption: 'Virtuelle Fernbedienung'},
    {file: 'receiver-settings.jpg', caption: 'Receiver-Einstellungen über OpenWebIF'},
    {file: 'sat-finder.jpg', caption: 'Sat-Finder / Signalanzeige'},
    {file: 'teletext.jpg', caption: 'Transparenter Videotext über dem laufenden Bild'},
    {file: 'receivers.jpg', caption: 'Mehrere Receiver konfigurieren und auswählen'},
    {file: 'add-receiver.jpg', caption: 'Receiver hinzufügen'},
    {file: 'settings.jpg', caption: 'Einstellungen: Sprache, Light/Dark, Senderlisten, Teletext'},
  ],
  en: [
    {file: 'tv-playback.jpg', caption: 'TV playback: audio track, subtitles, teletext and programme info'},
    {file: 'channel-list.jpg', caption: 'Channel list with streaming, record and zap buttons'},
    {file: 'epg.jpg', caption: 'Electronic programme guide (EPG)'},
    {file: 'epg-detail.jpg', caption: 'EPG detail view with timer / record actions'},
    {file: 'bouquet-editor.jpg', caption: 'Bouquet editor: edit the channel list'},
    {file: 'timer.jpg', caption: 'Plan timers (record, auto and power timers)'},
    {file: 'remote.jpg', caption: 'Virtual remote control'},
    {file: 'receiver-settings.jpg', caption: 'Receiver settings over OpenWebIF'},
    {file: 'sat-finder.jpg', caption: 'Sat finder / signal meter'},
    {file: 'teletext.jpg', caption: 'Transparent teletext over the live picture'},
    {file: 'receivers.jpg', caption: 'Configure and switch between multiple receivers'},
    {file: 'add-receiver.jpg', caption: 'Add a receiver'},
    {file: 'settings.jpg', caption: 'Settings: language, light/dark, channel lists, teletext'},
  ],
  es: [
    {file: 'tv-playback.jpg', caption: 'Reproducción de TV: audio, subtítulos, teletexto e info del programa'},
    {file: 'channel-list.jpg', caption: 'Lista de canales con streaming, grabación y cambio'},
    {file: 'epg.jpg', caption: 'Guía electrónica de programación (EPG)'},
    {file: 'epg-detail.jpg', caption: 'Vista de detalle del EPG con acciones de temporizador/grabación'},
    {file: 'bouquet-editor.jpg', caption: 'Editor de bouquets: editar la lista de canales'},
    {file: 'timer.jpg', caption: 'Planificar temporizadores (grabación, automáticos y de apagado)'},
    {file: 'remote.jpg', caption: 'Mando a distancia virtual'},
    {file: 'receiver-settings.jpg', caption: 'Ajustes del receptor vía OpenWebIF'},
    {file: 'sat-finder.jpg', caption: 'Buscador de satélite / medidor de señal'},
    {file: 'teletext.jpg', caption: 'Teletexto transparente sobre la imagen en directo'},
    {file: 'receivers.jpg', caption: 'Configura y cambia entre varios receptores'},
    {file: 'add-receiver.jpg', caption: 'Añadir un receptor'},
    {file: 'settings.jpg', caption: 'Ajustes: idioma, claro/oscuro, listas de canales, teletexto'},
  ],
  fr: [
    {file: 'tv-playback.jpg', caption: 'Lecture TV : piste audio, sous-titres, télétexte et infos programme'},
    {file: 'channel-list.jpg', caption: 'Liste des chaînes avec streaming, enregistrement et zapping'},
    {file: 'epg.jpg', caption: 'Guide électronique des programmes (EPG)'},
    {file: 'epg-detail.jpg', caption: 'Vue détaillée de l’EPG avec actions minuterie/enregistrement'},
    {file: 'bouquet-editor.jpg', caption: 'Éditeur de bouquets : modifier la liste des chaînes'},
    {file: 'timer.jpg', caption: 'Planifier des minuteries (enregistrement, auto et extinction)'},
    {file: 'remote.jpg', caption: 'Télécommande virtuelle'},
    {file: 'receiver-settings.jpg', caption: 'Réglages du récepteur via OpenWebIF'},
    {file: 'sat-finder.jpg', caption: 'Chercheur de satellite / mesure du signal'},
    {file: 'teletext.jpg', caption: 'Télétexte transparent sur l’image en direct'},
    {file: 'receivers.jpg', caption: 'Configurer et basculer entre plusieurs récepteurs'},
    {file: 'add-receiver.jpg', caption: 'Ajouter un récepteur'},
    {file: 'settings.jpg', caption: 'Réglages : langue, clair/sombre, listes de chaînes, télétexte'},
  ],
  it: [
    {file: 'tv-playback.jpg', caption: 'Riproduzione TV: traccia audio, sottotitoli, televideo e info programma'},
    {file: 'channel-list.jpg', caption: 'Lista canali con streaming, registrazione e cambio'},
    {file: 'epg.jpg', caption: 'Guida elettronica ai programmi (EPG)'},
    {file: 'epg-detail.jpg', caption: 'Vista dettaglio EPG con azioni timer/registrazione'},
    {file: 'bouquet-editor.jpg', caption: 'Editor di bouquet: modifica la lista canali'},
    {file: 'timer.jpg', caption: 'Pianifica timer (registrazione, automatici e di spegnimento)'},
    {file: 'remote.jpg', caption: 'Telecomando virtuale'},
    {file: 'receiver-settings.jpg', caption: 'Impostazioni del ricevitore via OpenWebIF'},
    {file: 'sat-finder.jpg', caption: 'Cerca satellite / misuratore di segnale'},
    {file: 'teletext.jpg', caption: 'Televideo trasparente sull’immagine in diretta'},
    {file: 'receivers.jpg', caption: 'Configura e passa tra più ricevitori'},
    {file: 'add-receiver.jpg', caption: 'Aggiungi un ricevitore'},
    {file: 'settings.jpg', caption: 'Impostazioni: lingua, chiaro/scuro, liste canali, televideo'},
  ],
};

export function getScreenshots(lang: Lang): Shot[] {
  return screenshots[lang] ?? screenshots[defaultLang];
}
