import { SHOP_CONFIG } from '../content/shop-config';
import { formatDate } from '../i18n/format-date';
import { ENTITY } from './entity';
import { LegalLang, isLegalLang, legalLocales } from './legal-locales';

export { legalLocales, isLegalLang };
export type { LegalLang };

/**
 * One labelled fact inside a section - a cookie's lifetime, a legal basis.
 *
 * A privacy policy is read by someone looking for one answer ("how long?",
 * "on what basis?"), and the register that answers those is a list of pairs,
 * not prose. It renders as a `<dl>` rather than as more headings, so the
 * heading list a screen reader offers stays the list of sections (WCAG 1.3.1).
 */
export interface LegalEntry {
  readonly term: string;
  readonly detail: string;
}

/** One section of a legal page: a heading, its lines, and optional facts. */
export interface LegalSection {
  readonly heading: string;
  readonly lines: readonly string[];
  readonly entries?: readonly LegalEntry[];
}

/** A legal page: a title, an optional lead paragraph, and its sections. */
export interface LegalPage {
  readonly title: string;
  readonly lead?: string;
  readonly sections: readonly LegalSection[];
}

/** The three legal pages, per language. */
export interface LegalCopy {
  readonly imprint: LegalPage;
  readonly privacy: LegalPage;
  readonly cookies: LegalPage;
  /** Footer link labels. */
  readonly links: {
    readonly imprint: string;
    readonly privacy: string;
    readonly cookies: string;
  };
  /** Shown on a page whose language has no legal text of its own. */
  readonly languageNote: string;
}

/**
 * The day these texts last changed, as one date for all three of them.
 *
 * A "Stand" line is what tells a reader whether the policy they are looking at
 * is the one that applied when they visited. One constant rather than a date
 * per page, because the three texts are written and reviewed together.
 */
export const LEGAL_VERSION = '2026-10-18';

/**
 * The host the shop frame is loaded from, read from the build's configuration.
 *
 * Derived rather than written out: a recipient named in a privacy policy has to
 * be the recipient the code actually contacts, and the second place a host name
 * is typed is the place that stays wrong. Empty when the build had no shop
 * configured - then nothing is embedded either, so there is no recipient to
 * name (see `pages/buy`).
 */
function shopHost(base: string | null): string {
  if (!base) {
    return '';
  }
  try {
    return new URL(base).host;
  } catch {
    return '';
  }
}

const SHOP_HOST = shopHost(SHOP_CONFIG.base);

/**
 * The legal texts, in German and English only - and that is a decision.
 *
 * The site is published in five languages, and the content records elsewhere
 * demand all five so a missing language fails the build. Legal text is the one
 * place where that rule would do harm: a machine translation of an imprint or
 * a privacy policy reads as a statement of fact about liability and data
 * processing, and nobody here can check the Spanish, French or Italian wording
 * (the player repo keeps `enigma2_player_source-4dx` open for exactly that
 * review of ordinary UI strings). German is the binding version because the
 * seat and the applicable law are German; English exists because the shop is
 * not.
 *
 * Those three languages therefore link to the German and English texts instead
 * of getting an unchecked translation. That is a visible, explained gap rather
 * than a quiet one - the same reason the placeholders are visible.
 *
 * Register: formal, in the form a German authority expects - processing
 * activity, categories of data, legal basis, retention, recipients, one after
 * the other (Art. 13 GDPR). The earlier version of this file explained the
 * site in the first person and was pleasant to read; "nothing that makes you
 * recognisable" is a summary, not a legal basis (enigma2_player-0ec).
 *
 * NOT LEGAL ADVICE, and no lawyer has seen it: the sections are the ones §5
 * DDG, §18 MStV, §25 TDDDG and Art. 13 GDPR commonly require of a site like
 * this one, and every statement describes what the code in this repository
 * does. Whether this situation needs more is a question for the review that is
 * still outstanding (`license_server-xwl0.5`).
 *
 * Every statement here is checkable against code: the cookie against
 * `consent/consent-store.ts`, the embedded shop against `pages/buy`, the
 * build-time retrieval against `tool/fetch-site-data.mjs`, "loads nothing from
 * anyone else" against the Playwright test that counts foreign requests.
 */
export const LEGAL_COPY: Record<LegalLang, LegalCopy> = {
  de: {
    links: { imprint: 'Impressum', privacy: 'Datenschutz', cookies: 'Cookie-Richtlinie' },
    languageNote:
      'Impressum, Datenschutzerklärung und Cookie-Richtlinie liegen auf Deutsch ' +
      'und Englisch vor. Verbindlich ist die deutsche Fassung.',
    imprint: {
      title: 'Impressum',
      lead: 'Angaben gemäß § 5 DDG und § 18 MStV.',
      sections: [
        {
          heading: 'Anbieter',
          lines: [
            ENTITY.legalName,
            ENTITY.street,
            `${ENTITY.postalCode} ${ENTITY.city}`,
            ENTITY.country,
          ],
        },
        {
          heading: 'Vertreten durch',
          lines: [ENTITY.managingDirector],
        },
        {
          heading: 'Kontakt',
          lines: [`E-Mail: ${ENTITY.email}`, `Telefon: ${ENTITY.phone}`],
        },
        {
          heading: 'Registereintrag',
          lines: [
            `Registergericht: ${ENTITY.registerCourt}`,
            `Registernummer: ${ENTITY.registerNumber}`,
          ],
        },
        {
          heading: 'Umsatzsteuer-Identifikationsnummer',
          lines: [`USt-IdNr. gemäß § 27a UStG: ${ENTITY.vatId}`],
        },
        {
          heading: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
          lines: [ENTITY.contentResponsible, ENTITY.street, `${ENTITY.postalCode} ${ENTITY.city}`],
        },
        {
          heading: 'Stand dieses Impressums',
          lines: [
            'Dieses Impressum ist eine Vorlage: das Unternehmen ist noch nicht ' +
              'gegründet, deshalb stehen die Angaben in ⟨spitzen Klammern⟩ und ' +
              'sind erkennbar offen. Es wird ausgefüllt, bevor die Seite ' +
              'veröffentlicht wird - eine erfundene Anschrift wäre schlimmer als ' +
              'eine sichtbare Lücke.',
            `Stand: ${formatDate(LEGAL_VERSION, 'de')}.`,
          ],
        },
      ],
    },
    privacy: {
      title: 'Datenschutzerklärung',
      lead:
        'Mit dieser Erklärung informieren wir Sie nach Art. 13 und 14 der ' +
        'Verordnung (EU) 2016/679 (DSGVO) über die Verarbeitung ' +
        'personenbezogener Daten beim Besuch dieser Website sowie über die ' +
        'Ihnen zustehenden Rechte.',
      sections: [
        {
          heading: 'Verantwortlicher',
          lines: [
            'Verantwortlicher im Sinne des Art. 4 Nr. 7 DSGVO ist:',
            ENTITY.legalName,
            ENTITY.street,
            `${ENTITY.postalCode} ${ENTITY.city}`,
            ENTITY.country,
            `E-Mail für Datenschutzanfragen: ${ENTITY.privacyEmail}`,
            'Ein Datenschutzbeauftragter ist nicht bestellt; die Voraussetzungen ' +
              'des Art. 37 DSGVO und des § 38 BDSG liegen nicht vor. Anfragen ' +
              'richten Sie an die vorstehende Adresse.',
          ],
        },
        {
          heading: 'Geltungsbereich',
          lines: [
            'Diese Erklärung gilt für diese Website. Für den Shop und das ' +
              'Kundenkonto, die auf dem Lizenzserver des Verantwortlichen ' +
              'betrieben und auf der Kaufseite eingebettet werden, sowie für die ' +
              'Anwendung „Enigma2 Player“ selbst gelten die dort jeweils ' +
              'bereitgestellten Datenschutzinformationen.',
          ],
        },
        {
          heading: 'Art der Verarbeitung auf dieser Website',
          lines: [
            'Diese Website wird als statische Website ohne eigene ' +
              'Anwendungslogik und ohne eigene Datenbank ausgeliefert. Es findet ' +
              'keine Reichweitenmessung, keine Analyse des Nutzungsverhaltens, ' +
              'kein Tracking über Websites hinweg und kein Profiling statt.',
            'Es werden keine Inhalte Dritter - Schriftarten, Karten, Videos, ' +
              'Skripte oder Zählpixel - von fremden Servern nachgeladen. Die ' +
              'einzige Ausnahme ist der auf der Kaufseite eingebettete Shop, der ' +
              'ausschließlich nach Ihrer Einwilligung geladen wird.',
          ],
        },
        {
          heading: 'Auslieferung der Website und Server-Protokolldaten',
          lines: [
            'Beim Abruf dieser Website werden technisch bedingt Verbindungsdaten ' +
              'durch den Hoster verarbeitet. Der Verantwortliche hat auf diese ' +
              'Protokolle keinen Zugriff und wertet sie nicht aus.',
          ],
          entries: [
            {
              term: 'Zweck',
              detail:
                'Bereitstellung der Website in technisch fehlerfreier Form sowie ' +
                'Gewährleistung der Sicherheit des Serverbetriebs.',
            },
            {
              term: 'Verarbeitete Daten',
              detail:
                'IP-Adresse des abrufenden Geräts, Datum und Uhrzeit des Abrufs, ' +
                'angeforderte Ressource, übertragene Datenmenge, HTTP-Statuscode, ' +
                'übermittelte Browser- und Betriebssystemkennung (User-Agent) ' +
                'sowie gegebenenfalls die verweisende Adresse (Referrer).',
            },
            {
              term: 'Rechtsgrundlage',
              detail:
                'Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt in ' +
                'der technisch fehlerfreien Darstellung und der Sicherheit der ' +
                'Website; eine Auswertung zu anderen Zwecken erfolgt nicht.',
            },
            {
              term: 'Speicherdauer',
              detail:
                'Nach den Vorgaben des Hosters. Eine Speicherung oder ' +
                'Zusammenführung dieser Daten durch den Verantwortlichen findet ' +
                'nicht statt.',
            },
            { term: 'Empfänger', detail: `${ENTITY.hostingProvider} (GitHub Pages).` },
          ],
        },
        {
          heading: 'Speicherung Ihrer Entscheidung über Cookies',
          lines: [
            'Ihre Antwort auf die Cookie-Frage wird in einem Cookie auf Ihrem ' +
              'Endgerät gespeichert, damit die Frage nicht bei jedem Seitenaufruf ' +
              'erneut gestellt wird und eine Ablehnung wirksam bleibt. ' +
              'Einzelheiten enthält die Cookie-Richtlinie.',
          ],
          entries: [
            {
              term: 'Zweck',
              detail:
                'Beachtung und Nachweis Ihrer Entscheidung über das Laden des ' +
                'eingebetteten Shops.',
            },
            {
              term: 'Verarbeitete Daten',
              detail:
                'Das Cookie „e2p_consent“ mit dem Wert „accepted“ oder ' +
                '„rejected“. Es enthält keine Kennung, keinen Zeitstempel und ' +
                'keine weiteren Angaben.',
            },
            {
              term: 'Rechtsgrundlage',
              detail:
                '§ 25 Abs. 2 Nr. 2 TDDDG für die Speicherung auf Ihrem Endgerät ' +
                '(unbedingt erforderlich, da ohne diesen Vermerk eine Ablehnung ' +
                'nicht ausgedrückt werden könnte), Art. 6 Abs. 1 lit. f DSGVO ' +
                'für die anschließende Verarbeitung.',
            },
            { term: 'Speicherdauer', detail: '180 Tage (etwa 6 Monate) ab der Entscheidung.' },
            {
              term: 'Empfänger',
              detail:
                'Keine. Das Cookie wird ausschließlich im Browser ausgewertet und ' +
                'an keinen Server übermittelt, der nicht diese Website ' +
                'ausliefert.',
            },
          ],
        },
        {
          heading: 'Eingebetteter Shop und Kundenkonto',
          lines: [
            'Auf der Kaufseite wird der Shop des Lizenzservers in einem ' +
              'eingebetteten Rahmen (iframe) dargestellt. Dieser Rahmen wird erst ' +
              'geladen, nachdem Sie eingewilligt haben; bis dahin enthält die ' +
              'Seite an seiner Stelle einen Hinweis. Mit dem Laden stellt Ihr ' +
              'Browser eine Verbindung zum Lizenzserver her und übermittelt dabei ' +
              'die unten genannten Daten an diesen.',
          ],
          entries: [
            {
              term: 'Zweck',
              detail:
                'Darstellung des Shops, Anlage und Verwaltung eines Kundenkontos ' +
                'sowie Abwicklung eines Kaufs.',
            },
            {
              term: 'Verarbeitete Daten',
              detail:
                'IP-Adresse, Browser- und Geräteangaben, Datum und Uhrzeit sowie ' +
                'die aufgerufene Shop-Adresse einschließlich der übergebenen ' +
                'Sprache. Welche Daten der Lizenzserver darüber hinaus ' +
                'verarbeitet - etwa Konto- und Zahlungsdaten -, richtet sich nach ' +
                'seiner eigenen Datenschutzerklärung.',
            },
            {
              term: 'Rechtsgrundlage',
              detail:
                '§ 25 Abs. 1 TDDDG und Art. 6 Abs. 1 lit. a DSGVO (Ihre ' +
                'Einwilligung). Die Abwicklung eines geschlossenen Vertrags ' +
                'erfolgt beim Lizenzserver auf Grundlage des Art. 6 Abs. 1 ' +
                'lit. b DSGVO.',
            },
            {
              term: 'Widerruf',
              detail:
                'Sie können die Einwilligung jederzeit über „Cookie-Entscheidung ' +
                'ändern“ im Fußbereich jeder Seite widerrufen. Der Rahmen wird ' +
                'dann nicht mehr geladen; die Rechtmäßigkeit der bis zum Widerruf ' +
                'erfolgten Verarbeitung bleibt unberührt.',
            },
          ],
        },
        {
          heading: 'Download der Anwendung und Verweise auf GitHub',
          lines: [
            'Die Downloadseite verlinkt die Installationsdateien der jeweiligen ' +
              'Veröffentlichung. Die Dateien liegen bei GitHub. Erst wenn Sie ' +
              'einen solchen Link aufrufen, verarbeitet GitHub Ihre ' +
              'Verbindungsdaten; auf dieser Website selbst wird dabei nichts ' +
              'gespeichert.',
          ],
          entries: [
            { term: 'Zweck', detail: 'Bereitstellung der Installationsdateien der Anwendung.' },
            {
              term: 'Verarbeitete Daten',
              detail: 'IP-Adresse und Verbindungsdaten, die beim Abruf bei GitHub anfallen.',
            },
            {
              term: 'Rechtsgrundlage',
              detail:
                'Art. 6 Abs. 1 lit. f DSGVO; das berechtigte Interesse liegt in ' +
                'der Auslieferung der angeforderten Datei.',
            },
            { term: 'Empfänger', detail: `${ENTITY.hostingProvider}.` },
          ],
        },
        {
          heading: 'Kontaktaufnahme per E-Mail',
          lines: [
            'Diese Website enthält kein Kontaktformular. Eine Kontaktaufnahme ' +
              'erfolgt über die angegebenen E-Mail-Adressen; dabei wird Ihre ' +
              'Nachricht über Ihr eigenes E-Mail-Programm versandt.',
          ],
          entries: [
            { term: 'Zweck', detail: 'Bearbeitung und Beantwortung Ihrer Anfrage.' },
            {
              term: 'Verarbeitete Daten',
              detail:
                'Ihre E-Mail-Adresse, der Inhalt Ihrer Nachricht und die von ' +
                'Ihnen mitgeteilten weiteren Angaben.',
            },
            {
              term: 'Rechtsgrundlage',
              detail:
                'Art. 6 Abs. 1 lit. b DSGVO, soweit die Anfrage der Erfüllung ' +
                'oder dem Abschluss eines Vertrags dient, im Übrigen Art. 6 ' +
                'Abs. 1 lit. f DSGVO (Beantwortung der an uns gerichteten ' +
                'Anfrage).',
            },
            {
              term: 'Speicherdauer',
              detail:
                'Bis zur abschließenden Bearbeitung der Anfrage; danach Löschung, ' +
                'soweit keine handels- oder steuerrechtlichen ' +
                'Aufbewahrungspflichten entgegenstehen.',
            },
          ],
        },
        {
          heading: 'Beim Erstellen der Seite abgerufene Daten',
          lines: [
            'Die Angaben zu Veröffentlichungen und Preismodellen werden nicht ' +
              'bei Ihrem Besuch, sondern beim Erstellen der Seite von der ' +
              'GitHub-Releases-Schnittstelle und vom Lizenzserver abgerufen und ' +
              'als Datei mit ausgeliefert. Dieser Abruf erfolgt auf dem ' +
              'Rechner des Verantwortlichen beziehungsweise in dessen ' +
              'Erstellungsumgebung; personenbezogene Daten von Besuchern werden ' +
              'dabei nicht verarbeitet.',
          ],
        },
        {
          heading: 'Empfänger und Auftragsverarbeiter',
          lines: [
            'Eine Weitergabe personenbezogener Daten an Dritte findet über die ' +
              'nachstehenden Empfänger hinaus nicht statt. Insbesondere erfolgt ' +
              'keine Weitergabe zu Werbezwecken und kein Verkauf von Daten.',
          ],
          entries: [
            {
              term: 'Hosting der Website',
              detail:
                `${ENTITY.hostingProvider} - Auftragsverarbeiter nach Art. 28 ` +
                'DSGVO auf Grundlage der Datenschutzbestimmungen für GitHub ' +
                'Pages. Sitz in den Vereinigten Staaten.',
            },
            {
              term: 'Shop und Kundenkonto',
              detail:
                'Der Lizenzserver des Verantwortlichen, betrieben bei einem ' +
                'Infrastrukturdienstleister. Er wird nur nach Ihrer Einwilligung ' +
                'kontaktiert.',
            },
            ...(SHOP_HOST ? [{ term: 'Adresse des Shops', detail: SHOP_HOST }] : []),
            {
              term: 'Weitere Empfänger',
              detail:
                'Keine. Es werden keine Analyse-, Werbe-, Zahlungs- oder ' +
                'Schriftartendienste auf dieser Website eingesetzt.',
            },
          ],
        },
        {
          heading: 'Übermittlung in Drittländer',
          lines: [
            'Der Hoster dieser Website und der Betreiber der Infrastruktur des ' +
              'Lizenzservers haben ihren Sitz in den Vereinigten Staaten, sodass ' +
              'eine Verarbeitung in einem Drittland im Sinne des Kapitels V der ' +
              'DSGVO stattfinden kann.',
            'Grundlage der Übermittlung sind, soweit der Empfänger zertifiziert ' +
              'ist, der Angemessenheitsbeschluss der Europäischen Kommission zum ' +
              'EU-US Data Privacy Framework (Art. 45 DSGVO), im Übrigen die ' +
              'Standardvertragsklauseln der Europäischen Kommission ' +
              '(Art. 46 Abs. 2 lit. c DSGVO). Es ist nicht auszuschließen, dass ' +
              'Behörden des Drittlands auf übermittelte Daten zugreifen.',
          ],
        },
        {
          heading: 'Speicherdauer im Überblick',
          lines: [
            'Personenbezogene Daten werden gelöscht, sobald der Zweck ihrer ' +
              'Verarbeitung entfällt und keine gesetzliche Aufbewahrungspflicht ' +
              'entgegensteht. Für die einzelnen Verarbeitungen gelten die oben ' +
              'genannten Fristen: das Cookie 180 Tage, Anfragen per E-Mail bis ' +
              'zur Erledigung, Server-Protokolle nach den Vorgaben des Hosters.',
          ],
        },
        {
          heading: 'Ihre Rechte',
          lines: [
            'Sie haben gegenüber dem Verantwortlichen die nachstehenden Rechte. ' +
              `Zur Ausübung genügt eine Mitteilung an ${ENTITY.privacyEmail}.`,
          ],
          entries: [
            { term: 'Auskunft', detail: 'Art. 15 DSGVO - Auskunft über die verarbeiteten Daten.' },
            {
              term: 'Berichtigung',
              detail: 'Art. 16 DSGVO - Berichtigung unrichtiger oder Vervollständigung der Daten.',
            },
            { term: 'Löschung', detail: 'Art. 17 DSGVO - Löschung der verarbeiteten Daten.' },
            {
              term: 'Einschränkung',
              detail: 'Art. 18 DSGVO - Einschränkung der Verarbeitung.',
            },
            {
              term: 'Datenübertragbarkeit',
              detail:
                'Art. 20 DSGVO - Erhalt der bereitgestellten Daten in einem ' +
                'strukturierten, gängigen und maschinenlesbaren Format.',
            },
            {
              term: 'Widerspruch',
              detail:
                'Art. 21 DSGVO - Widerspruch gegen eine Verarbeitung, die auf ' +
                'Art. 6 Abs. 1 lit. f DSGVO beruht.',
            },
            {
              term: 'Widerruf der Einwilligung',
              detail:
                'Art. 7 Abs. 3 DSGVO - jederzeitiger Widerruf einer erteilten ' +
                'Einwilligung, hier über „Cookie-Entscheidung ändern“ im ' +
                'Fußbereich jeder Seite, ohne Nachteile und ohne Angabe von ' +
                'Gründen.',
            },
            {
              term: 'Beschwerde',
              detail:
                'Art. 77 DSGVO - Beschwerde bei einer Aufsichtsbehörde. ' +
                `Zuständig ist ${ENTITY.dpaName}, ${ENTITY.dpaUrl}. Sie können ` +
                'sich auch an die Aufsichtsbehörde Ihres Aufenthaltsorts wenden.',
            },
          ],
        },
        {
          heading: 'Keine automatisierte Entscheidungsfindung',
          lines: [
            'Eine automatisierte Entscheidungsfindung einschließlich Profiling ' +
              'im Sinne des Art. 22 Abs. 1 und 4 DSGVO findet nicht statt.',
          ],
        },
        {
          heading: 'Pflicht zur Bereitstellung',
          lines: [
            'Sie sind nicht verpflichtet, personenbezogene Daten bereitzustellen. ' +
              'Die Inhalte dieser Website sind vollständig lesbar, wenn Sie die ' +
              'Einwilligung verweigern; in diesem Fall bleibt lediglich der ' +
              'eingebettete Shop ungeladen, sodass ein Kauf auf dieser Seite ' +
              'nicht möglich ist.',
          ],
        },
        {
          heading: 'Datensicherheit',
          lines: [
            'Die Website wird ausschließlich über HTTPS ausgeliefert; die ' +
              'Übertragung ist damit transportverschlüsselt. Das Cookie wird mit ' +
              'den Attributen „SameSite=Lax“ und - bei Auslieferung über HTTPS - ' +
              '„Secure“ gesetzt. Weitere Speichertechnologien im Browser, etwa ' +
              'der lokale Speicher (localStorage), werden nicht verwendet.',
          ],
        },
        {
          heading: 'Stand und Änderungen dieser Erklärung',
          lines: [
            `Stand: ${formatDate(LEGAL_VERSION, 'de')}.`,
            'Wir passen diese Erklärung an, wenn sich die beschriebenen ' +
              'Verarbeitungen oder die rechtlichen Anforderungen ändern. ' +
              'Maßgeblich ist die bei Ihrem Besuch veröffentlichte Fassung.',
            'Die Angaben in ⟨spitzen Klammern⟩ sind erkennbar offen, weil das ' +
              'Unternehmen noch nicht gegründet ist; sie werden vor der ' +
              'Veröffentlichung ergänzt. Eine erfundene Angabe wäre schlimmer ' +
              'als eine sichtbare Lücke.',
          ],
        },
      ],
    },
    cookies: {
      title: 'Cookie-Richtlinie',
      lead:
        'Diese Richtlinie erläutert, welche Cookies und vergleichbaren ' +
        'Technologien diese Website verwendet, zu welchem Zweck und auf welcher ' +
        'Rechtsgrundlage (§ 25 TDDDG, Art. 13 DSGVO). Sie ergänzt die ' +
        'Datenschutzerklärung.',
      sections: [
        {
          heading: 'Einsatz von Cookies auf dieser Website',
          lines: [
            'Diese Website setzt genau ein Cookie, und zwar ein eigenes ' +
              '(First-Party-)Cookie, das Ihre Entscheidung über das Laden des ' +
              'eingebetteten Shops festhält. Optionale Cookies bestehen nicht; ' +
              'deshalb enthält die Abfrage keine Auswahlschalter - sie wären ' +
              'eine Auswahl ohne Auswahl.',
            'Cookies zur Analyse, zur Reichweitenmessung, zu Werbezwecken oder ' +
              'zur Wiedererkennung über Websites hinweg werden nicht eingesetzt.',
          ],
        },
        {
          heading: 'Cookie-Verzeichnis',
          lines: ['Das eine eingesetzte Cookie im Einzelnen:'],
          entries: [
            { term: 'Name', detail: 'e2p_consent' },
            {
              term: 'Anbieter',
              detail:
                'Der Verantwortliche selbst; das Cookie wird von dieser Website ' +
                'gesetzt und an keinen Dritten übermittelt.',
            },
            {
              term: 'Zweck',
              detail:
                'Festhalten, ob Sie dem Laden des eingebetteten Shops zugestimmt ' +
                'oder es abgelehnt haben.',
            },
            {
              term: 'Inhalt',
              detail:
                'Das Wort „accepted“ oder „rejected“ - keine Kennung, kein ' +
                'Zeitstempel, keine Angabe, die Sie wiedererkennbar macht.',
            },
            { term: 'Typ', detail: 'HTTP-Cookie, dauerhaft gespeichert (kein Sitzungs-Cookie).' },
            { term: 'Speicherdauer', detail: '180 Tage (etwa 6 Monate) ab der Entscheidung.' },
            {
              term: 'Gültigkeitsbereich',
              detail:
                'Die Domain dieser Website, beschränkt auf den Pfad, unter dem ' +
                'sie ausgeliefert wird.',
            },
            {
              term: 'Attribute',
              detail: '„SameSite=Lax“; bei Auslieferung über HTTPS zusätzlich „Secure“.',
            },
            {
              term: 'Rechtsgrundlage',
              detail:
                '§ 25 Abs. 2 Nr. 2 TDDDG - unbedingt erforderlich, da ohne ' +
                'diesen Vermerk die Frage bei jedem Seitenaufruf erneut gestellt ' +
                'würde und eine Ablehnung nicht ausgedrückt werden könnte; für ' +
                'die Verarbeitung Art. 6 Abs. 1 lit. f DSGVO.',
            },
          ],
        },
        {
          heading: 'Keine weiteren Speichertechnologien',
          lines: [
            'Über das genannte Cookie hinaus werden auf Ihrem Endgerät keine ' +
              'Informationen gespeichert oder abgerufen. Insbesondere werden der ' +
              'lokale Speicher (localStorage), der Sitzungsspeicher ' +
              '(sessionStorage) und IndexedDB nicht verwendet; Zählpixel und ' +
              'Verfahren zur Geräteerkennung (Fingerprinting) werden nicht ' +
              'eingesetzt.',
            'Diese Website lädt keine Schriftarten, Karten, Videos oder Skripte ' +
              'von fremden Servern. Was Ihr Browser abruft, ruft er von der ' +
              'Adresse dieser Website ab.',
          ],
        },
        {
          heading: 'Cookies im eingebetteten Shop',
          lines: [
            'Nach Ihrer Einwilligung wird auf der Kaufseite der Shop des ' +
              'Lizenzservers in einem Rahmen (iframe) geladen. Dieser Dienst kann ' +
              'eigene Cookies und vergleichbare Technologien einsetzen, die der ' +
              'Verantwortliche dieser Website weder setzt noch auslesen kann; ' +
              'maßgeblich sind insoweit die Datenschutzinformationen des Shops.',
            'Ohne Einwilligung wird der Rahmen nicht geladen, sodass auch keine ' +
              'Verbindung zu diesem Dienst hergestellt wird.',
          ],
        },
        {
          heading: 'Einwilligung, Ablehnung und Widerruf',
          lines: [
            'Die Frage wird beim ersten Besuch gestellt. Zustimmung und ' +
              'Ablehnung sind gleichwertig gestaltet und mit gleichem Aufwand ' +
              'erreichbar; eine Vorauswahl besteht nicht.',
            'Ihre Einwilligung können Sie jederzeit widerrufen und Ihre ' +
              'Entscheidung ändern: über „Cookie-Entscheidung ändern“ im ' +
              'Fußbereich jeder Seite. Damit wird das Cookie gelöscht und die ' +
              'Frage erneut gestellt (Art. 7 Abs. 3 DSGVO).',
          ],
        },
        {
          heading: 'Folgen einer Ablehnung',
          lines: [
            'Die Inhalte dieser Website bleiben vollständig lesbar. Der Shop und ' +
              'jeder Weg zum Kauf bleiben gesperrt; die Seite nennt an dieser ' +
              'Stelle den Grund - ein Knopf, der nichts tut, ist schlechter als ' +
              'einer mit einer Erklärung.',
            'Gespeichert wird in diesem Fall ausschließlich, dass Sie abgelehnt ' + 'haben.',
          ],
        },
        {
          heading: 'Löschung über den Browser',
          lines: [
            'Sie können gesetzte Cookies jederzeit in den Einstellungen Ihres ' +
              'Browsers einsehen und löschen und das Setzen von Cookies ' +
              'einschränken. Nach dem Löschen des Cookies wird die Frage beim ' +
              'nächsten Besuch erneut gestellt.',
          ],
        },
        {
          heading: 'Stand und Änderungen dieser Richtlinie',
          lines: [
            `Stand: ${formatDate(LEGAL_VERSION, 'de')}.`,
            'Diese Richtlinie wird angepasst, wenn sich die eingesetzten ' +
              'Technologien oder die rechtlichen Anforderungen ändern. ' +
              'Maßgeblich ist die bei Ihrem Besuch veröffentlichte Fassung.',
          ],
        },
      ],
    },
  },
  en: {
    links: { imprint: 'Imprint', privacy: 'Privacy', cookies: 'Cookie policy' },
    languageNote:
      'The imprint, the privacy policy and the cookie policy are published in ' +
      'German and English. The German version is the binding one.',
    imprint: {
      title: 'Imprint',
      lead: 'Information required by §5 DDG and §18 MStV (German law).',
      sections: [
        {
          heading: 'Provider',
          lines: [
            ENTITY.legalName,
            ENTITY.street,
            `${ENTITY.postalCode} ${ENTITY.city}`,
            ENTITY.country,
          ],
        },
        { heading: 'Represented by', lines: [ENTITY.managingDirector] },
        {
          heading: 'Contact',
          lines: [`E-mail: ${ENTITY.email}`, `Phone: ${ENTITY.phone}`],
        },
        {
          heading: 'Commercial register',
          lines: [`Court: ${ENTITY.registerCourt}`, `Number: ${ENTITY.registerNumber}`],
        },
        {
          heading: 'VAT identification number',
          lines: [`VAT ID under §27a UStG: ${ENTITY.vatId}`],
        },
        {
          heading: 'Responsible for the content under §18(2) MStV',
          lines: [ENTITY.contentResponsible, ENTITY.street, `${ENTITY.postalCode} ${ENTITY.city}`],
        },
        {
          heading: 'Status of this imprint',
          lines: [
            'This imprint is a template: the company has not been founded yet, ' +
              'so the details stand in ⟨angle brackets⟩ and are visibly open. ' +
              'It is filled in before the site goes live - an invented address ' +
              'would be worse than a visible gap.',
            `Last updated: ${formatDate(LEGAL_VERSION, 'en')}.`,
          ],
        },
      ],
    },
    privacy: {
      title: 'Privacy policy',
      lead:
        'This policy informs you, pursuant to Articles 13 and 14 of Regulation ' +
        '(EU) 2016/679 (GDPR), about the processing of personal data when you ' +
        'visit this website, and about the rights available to you.',
      sections: [
        {
          heading: 'Controller',
          lines: [
            'The controller within the meaning of Article 4(7) GDPR is:',
            ENTITY.legalName,
            ENTITY.street,
            `${ENTITY.postalCode} ${ENTITY.city}`,
            ENTITY.country,
            `E-mail for data protection enquiries: ${ENTITY.privacyEmail}`,
            'No data protection officer has been appointed; the conditions of ' +
              'Article 37 GDPR and §38 BDSG are not met. Please address ' +
              'enquiries to the above.',
          ],
        },
        {
          heading: 'Scope',
          lines: [
            'This policy covers this website. The shop and the customer account, ' +
              "operated on the controller's licence server and embedded on the " +
              'purchase page, as well as the "Enigma2 Player" application ' +
              'itself, are covered by the data protection information provided ' +
              'there.',
          ],
        },
        {
          heading: 'Nature of the processing on this website',
          lines: [
            'This website is delivered as a static site with no application ' +
              'logic and no database of its own. There is no audience ' +
              'measurement, no analysis of usage behaviour, no cross-site ' +
              'tracking and no profiling.',
            'No third-party content - fonts, maps, videos, scripts or tracking ' +
              "pixels - is loaded from anyone else's server. The single " +
              'exception is the shop embedded on the purchase page, which is ' +
              'loaded only after you have given consent.',
          ],
        },
        {
          heading: 'Delivery of the website and server log data',
          lines: [
            'Retrieving this website necessarily causes the host to process ' +
              'connection data. The controller has no access to those logs and ' +
              'does not evaluate them.',
          ],
          entries: [
            {
              term: 'Purpose',
              detail:
                'Providing the website in technically faultless form and ' +
                'maintaining the security of server operation.',
            },
            {
              term: 'Data processed',
              detail:
                'IP address of the requesting device, date and time of the ' +
                'request, resource requested, volume of data transferred, HTTP ' +
                'status code, browser and operating system identifier ' +
                '(user agent) and, where sent, the referring address.',
            },
            {
              term: 'Legal basis',
              detail:
                'Article 6(1)(f) GDPR. The legitimate interest is the ' +
                'technically faultless presentation and the security of the ' +
                'website; the data are not evaluated for any other purpose.',
            },
            {
              term: 'Retention',
              detail:
                'As determined by the host. The controller neither stores nor ' +
                'combines these data.',
            },
            { term: 'Recipient', detail: `${ENTITY.hostingProvider} (GitHub Pages).` },
          ],
        },
        {
          heading: 'Storing your decision about cookies',
          lines: [
            'Your answer to the cookie question is stored in a cookie on your ' +
              'device so that the question is not asked again on every page view ' +
              'and a refusal remains effective. The cookie policy sets out the ' +
              'details.',
          ],
          entries: [
            {
              term: 'Purpose',
              detail:
                'Observing and evidencing your decision about loading the ' + 'embedded shop.',
            },
            {
              term: 'Data processed',
              detail:
                'The cookie "e2p_consent" holding the value "accepted" or ' +
                '"rejected". It contains no identifier, no timestamp and nothing ' +
                'else.',
            },
            {
              term: 'Legal basis',
              detail:
                '§25(2)(2) TDDDG for the storage on your device (strictly ' +
                'necessary, because without this record a refusal could not be ' +
                'expressed), Article 6(1)(f) GDPR for the subsequent processing.',
            },
            { term: 'Retention', detail: '180 days (about 6 months) from the decision.' },
            {
              term: 'Recipients',
              detail:
                'None. The cookie is evaluated in the browser only and is sent ' +
                'to no server other than the one delivering this website.',
            },
          ],
        },
        {
          heading: 'Embedded shop and customer account',
          lines: [
            "The purchase page presents the licence server's shop in an embedded " +
              'frame (iframe). That frame is loaded only after you have given ' +
              'consent; until then the page carries a notice in its place. ' +
              'Loading it makes your browser connect to the licence server and ' +
              'transmits the data listed below to it.',
          ],
          entries: [
            {
              term: 'Purpose',
              detail:
                'Presenting the shop, creating and managing a customer account, ' +
                'and completing a purchase.',
            },
            {
              term: 'Data processed',
              detail:
                'IP address, browser and device details, date and time, and the ' +
                'shop address requested including the language passed to it. ' +
                'What the licence server processes beyond that - account and ' +
                'payment data, for instance - is governed by its own privacy ' +
                'policy.',
            },
            {
              term: 'Legal basis',
              detail:
                '§25(1) TDDDG and Article 6(1)(a) GDPR (your consent). ' +
                'Performance of a contract concluded there takes place at the ' +
                'licence server on the basis of Article 6(1)(b) GDPR.',
            },
            {
              term: 'Withdrawal',
              detail:
                'You may withdraw your consent at any time via "Change cookie ' +
                'decision" in the footer of every page. The frame is then no ' +
                'longer loaded; the lawfulness of processing carried out before ' +
                'the withdrawal is unaffected.',
            },
          ],
        },
        {
          heading: 'Downloading the application and links to GitHub',
          lines: [
            'The downloads page links the installation files of the respective ' +
              'release. The files are held at GitHub. Only when you follow such ' +
              'a link does GitHub process your connection data; nothing is ' +
              'stored on this website in the process.',
          ],
          entries: [
            {
              term: 'Purpose',
              detail: "Providing the application's installation files.",
            },
            {
              term: 'Data processed',
              detail: 'IP address and connection data arising at GitHub on retrieval.',
            },
            {
              term: 'Legal basis',
              detail:
                'Article 6(1)(f) GDPR; the legitimate interest is delivering the ' +
                'file you requested.',
            },
            { term: 'Recipient', detail: `${ENTITY.hostingProvider}.` },
          ],
        },
        {
          heading: 'Contacting us by e-mail',
          lines: [
            'This website has no contact form. Contact is made via the e-mail ' +
              'addresses given, with your message sent through your own e-mail ' +
              'program.',
          ],
          entries: [
            { term: 'Purpose', detail: 'Handling and answering your enquiry.' },
            {
              term: 'Data processed',
              detail:
                'Your e-mail address, the content of your message and any ' +
                'further details you provide.',
            },
            {
              term: 'Legal basis',
              detail:
                'Article 6(1)(b) GDPR where the enquiry serves the performance ' +
                'or conclusion of a contract, otherwise Article 6(1)(f) GDPR ' +
                '(answering the enquiry addressed to us).',
            },
            {
              term: 'Retention',
              detail:
                'Until the enquiry has been dealt with; erasure thereafter, ' +
                'unless commercial or tax law retention obligations apply.',
            },
          ],
        },
        {
          heading: 'Data retrieved when the site is built',
          lines: [
            'The details of releases and price models are not retrieved when you ' +
              "visit but when the site is built, from GitHub's releases endpoint " +
              'and from the licence server, and are delivered as part of the ' +
              "files. That retrieval happens on the controller's machine or in " +
              'its build environment; no personal data of visitors are processed ' +
              'in the process.',
          ],
        },
        {
          heading: 'Recipients and processors',
          lines: [
            'Personal data are not passed to third parties beyond the recipients ' +
              'listed below. In particular, no data are passed on for ' +
              'advertising purposes and no data are sold.',
          ],
          entries: [
            {
              term: 'Website hosting',
              detail:
                `${ENTITY.hostingProvider} - processor under Article 28 GDPR on ` +
                'the basis of the data protection terms for GitHub Pages. Based ' +
                'in the United States.',
            },
            {
              term: 'Shop and customer account',
              detail:
                "The controller's licence server, operated at an infrastructure " +
                'provider. It is contacted only after you have given consent.',
            },
            ...(SHOP_HOST ? [{ term: 'Address of the shop', detail: SHOP_HOST }] : []),
            {
              term: 'Other recipients',
              detail:
                'None. No analytics, advertising, payment or font services are ' +
                'used on this website.',
            },
          ],
        },
        {
          heading: 'Transfers to third countries',
          lines: [
            "This website's host and the operator of the licence server's " +
              'infrastructure are based in the United States, so processing may ' +
              'take place in a third country within the meaning of Chapter V ' +
              'GDPR.',
            'Such transfers rely, where the recipient is certified, on the ' +
              "European Commission's adequacy decision for the EU-US Data " +
              'Privacy Framework (Article 45 GDPR), and otherwise on the ' +
              "European Commission's standard contractual clauses " +
              '(Article 46(2)(c) GDPR). Access to transferred data by ' +
              'authorities of that third country cannot be ruled out.',
          ],
        },
        {
          heading: 'Retention at a glance',
          lines: [
            'Personal data are erased once the purpose of their processing no ' +
              'longer applies and no statutory retention obligation stands in ' +
              'the way. The periods stated above apply to the individual ' +
              'activities: 180 days for the cookie, until resolution for e-mail ' +
              "enquiries, and the host's own periods for server logs.",
          ],
        },
        {
          heading: 'Your rights',
          lines: [
            'You have the following rights against the controller. A message to ' +
              `${ENTITY.privacyEmail} is enough to exercise them.`,
          ],
          entries: [
            { term: 'Access', detail: 'Article 15 GDPR - access to the data processed.' },
            {
              term: 'Rectification',
              detail: 'Article 16 GDPR - correction of inaccurate or completion of your data.',
            },
            { term: 'Erasure', detail: 'Article 17 GDPR - erasure of the data processed.' },
            { term: 'Restriction', detail: 'Article 18 GDPR - restriction of processing.' },
            {
              term: 'Portability',
              detail:
                'Article 20 GDPR - receipt of the data you provided in a ' +
                'structured, commonly used and machine-readable format.',
            },
            {
              term: 'Objection',
              detail:
                'Article 21 GDPR - objection to processing based on ' + 'Article 6(1)(f) GDPR.',
            },
            {
              term: 'Withdrawal of consent',
              detail:
                'Article 7(3) GDPR - withdrawal of a consent given at any time, ' +
                'here via "Change cookie decision" in the footer of every page, ' +
                'without detriment and without giving reasons.',
            },
            {
              term: 'Complaint',
              detail:
                'Article 77 GDPR - complaint to a supervisory authority. The ' +
                `competent one is ${ENTITY.dpaName}, ${ENTITY.dpaUrl}. You may ` +
                'also contact the authority of your place of residence.',
            },
          ],
        },
        {
          heading: 'No automated decision-making',
          lines: [
            'There is no automated decision-making, including profiling, within ' +
              'the meaning of Article 22(1) and (4) GDPR.',
          ],
        },
        {
          heading: 'Obligation to provide data',
          lines: [
            'You are under no obligation to provide personal data. The content ' +
              'of this website is fully readable if you refuse consent; in that ' +
              'case only the embedded shop stays unloaded, so a purchase cannot ' +
              'be made on this site.',
          ],
        },
        {
          heading: 'Data security',
          lines: [
            'The website is delivered over HTTPS only, so the transfer is ' +
              'encrypted in transit. The cookie is set with the attributes ' +
              '"SameSite=Lax" and, when delivered over HTTPS, "Secure". No other ' +
              'browser storage - local storage, for instance - is used.',
          ],
        },
        {
          heading: 'Status and changes to this policy',
          lines: [
            `Last updated: ${formatDate(LEGAL_VERSION, 'en')}.`,
            'We adapt this policy when the processing it describes or the legal ' +
              'requirements change. The version published at the time of your ' +
              'visit is the one that applies.',
            'The details in ⟨angle brackets⟩ are visibly open because the ' +
              'company has not been founded yet; they are filled in before ' +
              'publication. An invented detail would be worse than a visible gap.',
          ],
        },
      ],
    },
    cookies: {
      title: 'Cookie policy',
      lead:
        'This policy explains which cookies and comparable technologies this ' +
        'website uses, for what purpose and on what legal basis (§25 TDDDG, ' +
        'Article 13 GDPR). It supplements the privacy policy.',
      sections: [
        {
          heading: 'Use of cookies on this website',
          lines: [
            'This website sets exactly one cookie, a first-party cookie ' +
              'recording your decision about loading the embedded shop. There ' +
              'are no optional cookies, which is why the question carries no ' +
              'toggles - they would be a choice without a choice.',
            'No cookies are used for analytics, audience measurement, ' +
              'advertising or recognition across websites.',
          ],
        },
        {
          heading: 'Cookie register',
          lines: ['The one cookie in use, in detail:'],
          entries: [
            { term: 'Name', detail: 'e2p_consent' },
            {
              term: 'Provider',
              detail:
                'The controller itself; the cookie is set by this website and is ' +
                'transmitted to no third party.',
            },
            {
              term: 'Purpose',
              detail:
                'Recording whether you accepted or declined the loading of the ' + 'embedded shop.',
            },
            {
              term: 'Content',
              detail:
                'The word "accepted" or "rejected" - no identifier, no ' +
                'timestamp, nothing that makes you recognisable.',
            },
            { term: 'Type', detail: 'HTTP cookie, stored persistently (not a session cookie).' },
            { term: 'Retention', detail: '180 days (about 6 months) from the decision.' },
            {
              term: 'Scope',
              detail: "This website's domain, limited to the path the site is served " + 'under.',
            },
            {
              term: 'Attributes',
              detail: '"SameSite=Lax"; additionally "Secure" when served over HTTPS.',
            },
            {
              term: 'Legal basis',
              detail:
                '§25(2)(2) TDDDG - strictly necessary, because without this ' +
                'record the question would be asked again on every page view and ' +
                'a refusal could not be expressed; Article 6(1)(f) GDPR for the ' +
                'processing.',
            },
          ],
        },
        {
          heading: 'No other storage technologies',
          lines: [
            'Beyond the cookie named above, no information is stored on or read ' +
              'from your device. In particular, local storage, session storage ' +
              'and IndexedDB are not used, and no tracking pixels or device ' +
              'recognition (fingerprinting) techniques are employed.',
            'This website loads no fonts, maps, videos or scripts from anyone ' +
              "else's server. What your browser fetches, it fetches from this " +
              "site's own address.",
          ],
        },
        {
          heading: 'Cookies in the embedded shop',
          lines: [
            'Once you have consented, the purchase page loads the licence ' +
              "server's shop in a frame (iframe). That service may set cookies " +
              'and use comparable technologies of its own, which the controller ' +
              'of this website neither sets nor can read; its own data ' +
              'protection information governs them.',
            'Without consent the frame is not loaded, so no connection to that ' +
              'service is established either.',
          ],
        },
        {
          heading: 'Consent, refusal and withdrawal',
          lines: [
            'The question is asked on your first visit. Accepting and declining ' +
              'are presented as equals and reachable with the same effort; ' +
              'nothing is preselected.',
            'You may withdraw your consent and change your decision at any time ' +
              'via "Change cookie decision" in the footer of every page. This ' +
              'deletes the cookie and asks the question again (Article 7(3) ' +
              'GDPR).',
          ],
        },
        {
          heading: 'Consequences of declining',
          lines: [
            'The content of this website remains fully readable. The shop and ' +
              'every path into a purchase stay blocked, and the page states the ' +
              'reason at that spot - a button that does nothing is worse than ' +
              'one with an explanation.',
            'In that case the only thing stored is that you declined.',
          ],
        },
        {
          heading: 'Deletion in your browser',
          lines: [
            'You may inspect and delete cookies at any time in your browser ' +
              'settings, and restrict the setting of cookies. Once the cookie ' +
              'has been deleted, the question is asked again on your next visit.',
          ],
        },
        {
          heading: 'Status and changes to this policy',
          lines: [
            `Last updated: ${formatDate(LEGAL_VERSION, 'en')}.`,
            'This policy is adapted when the technologies used or the legal ' +
              'requirements change. The version published at the time of your ' +
              'visit is the one that applies.',
          ],
        },
      ],
    },
  },
};
