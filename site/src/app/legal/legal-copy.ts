import { ENTITY } from './entity';

/** The languages the legal texts are published in. */
export const legalLocales = ['de', 'en'] as const;

/** A language a legal text exists in. */
export type LegalLang = (typeof legalLocales)[number];

/** Whether a legal text exists in this language. */
export function isLegalLang(value: string): value is LegalLang {
  return (legalLocales as readonly string[]).includes(value);
}

/** One section of a legal page: a heading and its lines. */
export interface LegalSection {
  readonly heading: string;
  readonly lines: readonly string[];
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
 * NOT LEGAL ADVICE. The sections are the ones §5 DDG, §18 MStV and the GDPR
 * commonly require of a site like this one; whether this situation needs more
 * is a question for the lawyer who reviews it (`license_server-xwl0.5`).
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
          lines: [`Registergericht: ${ENTITY.registerCourt}`, `Registernummer: ${ENTITY.registerNumber}`],
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
          ],
        },
      ],
    },
    privacy: {
      title: 'Datenschutzerklärung',
      lead:
        'Diese Seite ist eine statische Webseite ohne eigenes Backend. Sie ' +
        'verarbeitet so wenig, dass die kurze Antwort lautet: nichts, was Sie ' +
        'wiedererkennbar macht.',
      sections: [
        {
          heading: 'Verantwortlicher',
          lines: [
            ENTITY.legalName,
            ENTITY.street,
            `${ENTITY.postalCode} ${ENTITY.city}`,
            `E-Mail: ${ENTITY.privacyEmail}`,
          ],
        },
        {
          heading: 'Was diese Seite speichert',
          lines: [
            'Ein einziges Cookie, das Ihre Antwort auf die Cookie-Frage ' +
              'festhält. Keine Analyse, keine Reichweitenmessung, keine ' +
              'Einbindung von Schriften, Karten oder Videos von Dritten, keine ' +
              'Weitergabe an Dritte. Einzelheiten in der Cookie-Richtlinie.',
          ],
        },
        {
          heading: 'Server-Protokolle beim Hoster',
          lines: [
            'Die Seite wird bei GitHub Pages ausgeliefert. Beim Abruf fallen ' +
              'dort technisch bedingt Verbindungsdaten an, darunter Ihre ' +
              'IP-Adresse. Darauf haben wir keinen Zugriff und wir werten sie ' +
              'nicht aus.',
            `Auftragsverarbeiter: ${ENTITY.hostingProvider}`,
          ],
        },
        {
          heading: 'Rechtsgrundlagen',
          lines: [
            'Art. 6 Abs. 1 lit. f DSGVO für die technisch notwendige ' +
              'Auslieferung der Seite; § 25 Abs. 2 Nr. 2 TDDDG für das ' +
              'Cookie, das Ihre Entscheidung festhält - es ist unbedingt ' +
              'erforderlich, weil die Frage sonst bei jedem Seitenaufruf ' +
              'erneut gestellt würde.',
          ],
        },
        {
          heading: 'Ihre Rechte',
          lines: [
            'Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, ' +
              'Datenübertragbarkeit und Widerspruch (Art. 15 bis 21 DSGVO). ' +
              `Wenden Sie sich dafür an ${ENTITY.privacyEmail}.`,
            'Sie können sich außerdem bei einer Aufsichtsbehörde beschweren. ' +
              `Zuständig ist: ${ENTITY.dpaName}, ${ENTITY.dpaUrl}`,
          ],
        },
        {
          heading: 'Kauf und Konto',
          lines: [
            'Der Kauf und das Kundenkonto laufen nicht auf dieser Seite, ' +
              'sondern beim Lizenzserver des Anbieters. Dort gilt die ' +
              'Datenschutzerklärung dieses Dienstes; sie ist vor dem Kauf ' +
              'einsehbar.',
          ],
        },
      ],
    },
    cookies: {
      title: 'Cookie-Richtlinie',
      lead:
        'Diese Seite setzt genau ein Cookie. Es gibt keine optionalen ' +
        'Cookies, deshalb gibt es auch keinen Dialog mit Schiebereglern - es ' +
        'wäre eine Auswahl ohne Auswahl.',
      sections: [
        {
          heading: 'Das eine Cookie',
          lines: [
            'Name: e2p_consent',
            'Zweck: hält fest, ob Sie zugestimmt oder abgelehnt haben.',
            'Inhalt: das Wort „accepted" oder „rejected", nichts weiter - keine ' +
              'Kennung, kein Zeitstempel, nichts, was Sie wiedererkennbar macht.',
            'Laufzeit: 6 Monate.',
            'Gültig für: den Pfad, unter dem diese Seite ausgeliefert wird.',
            'Rechtsgrundlage: § 25 Abs. 2 Nr. 2 TDDDG - unbedingt erforderlich, ' +
              'denn ohne diesen Vermerk müsste die Frage bei jedem Seitenaufruf ' +
              'erneut gestellt werden, und eine Ablehnung ließe sich nicht ' +
              'ausdrücken.',
          ],
        },
        {
          heading: 'Was passiert, wenn Sie ablehnen',
          lines: [
            'Die Seite bleibt lesbar. Der Shop und jeder Weg zum Kauf bleiben ' +
              'gesperrt, und die Seite sagt an der Stelle, warum - ein Knopf, ' +
              'der nichts tut, ist schlimmer als einer mit einer Erklärung.',
            'Gespeichert ist dann nur, dass Sie abgelehnt haben.',
          ],
        },
        {
          heading: 'Entscheidung ändern',
          lines: [
            'Im Fußbereich jeder Seite finden Sie „Cookie-Entscheidung ändern". ' +
              'Damit wird das Cookie gelöscht und die Frage erneut gestellt.',
          ],
        },
        {
          heading: 'Keine Dritten',
          lines: [
            'Diese Seite lädt keine Schriften, Karten, Videos oder Skripte von ' +
              'fremden Servern. Was Ihr Browser holt, holt er von der Adresse ' +
              'dieser Seite.',
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
          ],
        },
      ],
    },
    privacy: {
      title: 'Privacy policy',
      lead:
        'This is a static site with no backend of its own. It processes so ' +
        'little that the short answer is: nothing that identifies you.',
      sections: [
        {
          heading: 'Controller',
          lines: [
            ENTITY.legalName,
            ENTITY.street,
            `${ENTITY.postalCode} ${ENTITY.city}`,
            `E-mail: ${ENTITY.privacyEmail}`,
          ],
        },
        {
          heading: 'What this site stores',
          lines: [
            'A single cookie recording your answer to the cookie question. No ' +
              'analytics, no audience measurement, no third-party fonts, maps ' +
              'or videos, nothing passed to anyone. Details in the cookie policy.',
          ],
        },
        {
          heading: 'Server logs at the host',
          lines: [
            'The site is served by GitHub Pages. Retrieving it produces ' +
              'connection data there, including your IP address, as a technical ' +
              'necessity. We have no access to it and do not evaluate it.',
            `Processor: ${ENTITY.hostingProvider}`,
          ],
        },
        {
          heading: 'Legal bases',
          lines: [
            'Article 6(1)(f) GDPR for delivering the site; §25(2)(2) TDDDG for ' +
              'the cookie that records your decision - strictly necessary, ' +
              'because without it the question would be asked again on every ' +
              'page view.',
          ],
        },
        {
          heading: 'Your rights',
          lines: [
            'Access, rectification, erasure, restriction, portability and ' +
              `objection (Articles 15 to 21 GDPR). Write to ${ENTITY.privacyEmail}.`,
            'You may also complain to a supervisory authority. The competent ' +
              `one is: ${ENTITY.dpaName}, ${ENTITY.dpaUrl}`,
          ],
        },
        {
          heading: 'Purchase and account',
          lines: [
            'Purchases and the customer account do not run on this site but on ' +
              "the provider's licence server. That service has its own privacy " +
              'policy, available before any purchase.',
          ],
        },
      ],
    },
    cookies: {
      title: 'Cookie policy',
      lead:
        'This site sets exactly one cookie. There are no optional cookies, so ' +
        'there is no dialog with sliders - it would be a choice without a choice.',
      sections: [
        {
          heading: 'The one cookie',
          lines: [
            'Name: e2p_consent',
            'Purpose: records whether you accepted or declined.',
            'Content: the word "accepted" or "rejected" and nothing else - no ' +
              'identifier, no timestamp, nothing that identifies you.',
            'Lifetime: 6 months.',
            'Scope: the path this site is served under.',
            'Legal basis: §25(2)(2) TDDDG - strictly necessary, because without ' +
              'this record the question would have to be asked on every page ' +
              'view and declining could not be expressed at all.',
          ],
        },
        {
          heading: 'What happens if you decline',
          lines: [
            'The site stays readable. The shop and every path into a purchase ' +
              'stay blocked, and the page says why at that spot - a button that ' +
              'does nothing is worse than one with an explanation.',
            'The only thing stored is that you declined.',
          ],
        },
        {
          heading: 'Changing your decision',
          lines: [
            'Every page has "Change cookie decision" in the footer. It deletes ' +
              'the cookie and asks again.',
          ],
        },
        {
          heading: 'No third parties',
          lines: [
            'This site loads no fonts, maps, videos or scripts from anyone ' +
              "else's server. What your browser fetches, it fetches from this " +
              "site's own address.",
          ],
        },
      ],
    },
  },
};
