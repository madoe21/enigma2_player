import { Lang } from '../i18n/locales';

/** Every sentence the consent surfaces need, in one language. */
export interface ConsentCopy {
  /** Dialog heading. */
  readonly title: string;
  /** What is stored and what refusing means - the dialog's body. */
  readonly body: string;
  readonly accept: string;
  readonly reject: string;
  /** Announced when the dialog appears, for a screen reader. */
  readonly announce: string;
  /** The state of the page after a refusal. */
  readonly refusedTitle: string;
  readonly refusedBody: string;
  /** Why a blocked region is blocked, shown in place of the region. */
  readonly blocked: string;
  /** The footer control that takes the decision back. */
  readonly revoke: string;
  /** Confirmation that the decision was taken back. */
  readonly revoked: string;
  /** Accessible name of the footer's legal navigation. */
  readonly legalNav: string;
  /** Link text in the dialog, pointing at the policy it is asking about. */
  readonly policyLink: string;
}

/**
 * The consent texts per language.
 *
 * A record per language, the same pattern as the page content
 * (`pages/landing/landing.ts`): the site's text is its payload, and it builds
 * once for all five languages instead of five times (enigma2_player-bdb).
 *
 * The wording is deliberately plain about the trade: there is one category,
 * the technically necessary one, and refusing leaves the site unusable - no
 * optional cookies, no analytics, nothing passed to anyone (PO, 2026-10-09).
 * A dialog that implies a choice of categories where there is none would be
 * describing a different site.
 */
export const CONSENT_COPY: Record<Lang, ConsentCopy> = {
  de: {
    title: 'Cookies',
    body:
      'Diese Seite setzt ein einziges Cookie, und zwar das, das Ihre Antwort ' +
      'hier festhält. Es gibt keine optionalen Cookies, keine Analyse und keine ' +
      'Weitergabe an Dritte. Lehnen Sie ab, bleibt die Seite lesbar, der Shop ' +
      'und der Weg zum Kauf sind dann aber gesperrt.',
    accept: 'Einverstanden',
    reject: 'Ablehnen',
    announce: 'Hinweis zu Cookies. Bitte zustimmen oder ablehnen.',
    refusedTitle: 'Sie haben abgelehnt',
    refusedBody:
      'Gespeichert ist nur, dass Sie abgelehnt haben - sonst nichts. Der Shop ' +
      'und der Kauf bleiben deshalb gesperrt. Sie können das jederzeit ändern.',
    blocked:
      'Dieser Bereich braucht Ihre Zustimmung zu dem einen technisch ' +
      'notwendigen Cookie. Ohne sie wird hier nichts geladen.',
    revoke: 'Cookie-Entscheidung ändern',
    revoked: 'Ihre Entscheidung ist zurückgenommen. Sie werden erneut gefragt.',
    legalNav: 'Rechtliches',
    policyLink: 'Was genau gespeichert wird: Cookie-Richtlinie',
  },
  en: {
    title: 'Cookies',
    body:
      'This site sets a single cookie: the one that records your answer here. ' +
      'There are no optional cookies, no analytics and nothing passed to third ' +
      'parties. If you decline, the site stays readable, but the shop and the ' +
      'path to a purchase are blocked.',
    accept: 'Accept',
    reject: 'Decline',
    announce: 'Cookie notice. Please accept or decline.',
    refusedTitle: 'You declined',
    refusedBody:
      'The only thing stored is that you declined - nothing else. The shop and ' +
      'the purchase stay blocked because of it. You can change this at any time.',
    blocked:
      'This area needs your consent to the one technically necessary cookie. ' +
      'Without it, nothing is loaded here.',
    revoke: 'Change cookie decision',
    revoked: 'Your decision has been withdrawn. You will be asked again.',
    legalNav: 'Legal',
    policyLink: 'What exactly is stored: cookie policy',
  },
  es: {
    title: 'Cookies',
    body:
      'Este sitio instala una única cookie: la que guarda su respuesta aquí. No ' +
      'hay cookies opcionales, ni analítica, ni datos cedidos a terceros. Si lo ' +
      'rechaza, el sitio sigue siendo legible, pero la tienda y el camino a la ' +
      'compra quedan bloqueados.',
    accept: 'Aceptar',
    reject: 'Rechazar',
    announce: 'Aviso de cookies. Acepte o rechace, por favor.',
    refusedTitle: 'Ha rechazado',
    refusedBody:
      'Lo único almacenado es que ha rechazado, nada más. Por eso la tienda y la ' +
      'compra permanecen bloqueadas. Puede cambiarlo cuando quiera.',
    blocked:
      'Esta zona necesita su consentimiento para la única cookie técnicamente ' +
      'necesaria. Sin él, aquí no se carga nada.',
    revoke: 'Cambiar la decisión sobre cookies',
    revoked: 'Su decisión ha sido retirada. Se le volverá a preguntar.',
    legalNav: 'Aviso legal',
    policyLink: 'Qué se almacena exactamente: política de cookies',
  },
  fr: {
    title: 'Cookies',
    body:
      'Ce site dépose un seul cookie : celui qui enregistre votre réponse ici. ' +
      'Aucun cookie optionnel, aucune mesure d’audience, aucune transmission à ' +
      'des tiers. Si vous refusez, le site reste lisible, mais la boutique et le ' +
      'chemin vers l’achat sont bloqués.',
    accept: 'Accepter',
    reject: 'Refuser',
    announce: 'Information sur les cookies. Veuillez accepter ou refuser.',
    refusedTitle: 'Vous avez refusé',
    refusedBody:
      'La seule chose enregistrée est votre refus, rien d’autre. C’est pourquoi ' +
      'la boutique et l’achat restent bloqués. Vous pouvez changer d’avis à tout ' +
      'moment.',
    blocked:
      'Cette zone nécessite votre consentement au seul cookie techniquement ' +
      'nécessaire. Sans lui, rien n’est chargé ici.',
    revoke: 'Modifier la décision sur les cookies',
    revoked: 'Votre décision est retirée. La question vous sera posée à nouveau.',
    legalNav: 'Mentions légales',
    policyLink: 'Ce qui est stocké exactement : politique de cookies',
  },
  it: {
    title: 'Cookie',
    body:
      'Questo sito imposta un solo cookie: quello che registra la sua risposta ' +
      'qui. Nessun cookie opzionale, nessuna analisi, nessuna cessione a terzi. ' +
      'Se rifiuta, il sito resta leggibile, ma il negozio e il percorso di ' +
      'acquisto sono bloccati.',
    accept: 'Accetto',
    reject: 'Rifiuto',
    announce: 'Avviso sui cookie. Accetti o rifiuti, per favore.',
    refusedTitle: 'Ha rifiutato',
    refusedBody:
      'L’unica cosa memorizzata è il suo rifiuto, nient’altro. Per questo il ' +
      'negozio e l’acquisto restano bloccati. Può cambiare in qualsiasi momento.',
    blocked:
      'Quest’area richiede il consenso all’unico cookie tecnicamente ' +
      'necessario. Senza di esso qui non viene caricato nulla.',
    revoke: 'Modifica la decisione sui cookie',
    revoked: 'La sua decisione è stata ritirata. Le sarà chiesto di nuovo.',
    legalNav: 'Note legali',
    policyLink: 'Cosa viene memorizzato esattamente: informativa sui cookie',
  },
};
