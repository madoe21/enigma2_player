/**
 * Compares the text of the Angular pages against the Astro pages they replace.
 *
 * The acceptance criterion of `enigma2_player-n5j` is that every page shows
 * the same content as before in German and English - and "I moved the content
 * records over, so it must be the same" is a claim about my own diligence, not
 * evidence. This reads both builds and reports what differs.
 *
 * It is a comparison tool, not a test: the two sites legitimately differ in
 * places (the Angular shell adds a skip link and the cookie dialog; the
 * downloads, changelog and prices are baked in here and were fetched in the
 * browser there, so the old pages show their "loading…" text where these show
 * the data). Those differences are listed as EXPECTED below, and anything
 * outside them is what a human has to look at.
 *
 * Usage, both builds first:
 *   npx astro build           # in the repository root, writes dist/
 *   npm run build             # in site/, writes site/dist/site/enigma2_player/
 *   npm run compare:astro             # missing lines only
 *   npm run compare:astro -- --verbose # and everything this build adds
 */
import { readFile } from 'node:fs/promises';

const ASTRO = '../dist';
const ANGULAR = 'dist/site/enigma2_player';

/** The pages both sites have, by their shared slug. */
const PAGES = ['', 'features', 'screenshots', 'downloads', 'changelog', 'docs', 'faq', 'pricing',
  'buy', 'account', 'license', 'contact'];
const LANGS = ['de', 'en'];

/**
 * Text the Angular site adds or replaces on purpose.
 *
 * Each entry is a decision with a bead behind it, not a shrug.
 */
const EXPECTED = [
  // enigma2_player-vmk: the cookie question, its policy links and the state notice.
  /Cookies?$/i, /einziges Cookie/i, /single cookie/i, /Einverstanden/, /Ablehnen/,
  /Accept/, /Decline/, /Cookie-Entscheidung/, /Change cookie decision/,
  /Was genau gespeichert wird/, /What exactly is stored/,
  // enigma2_player-esp: the legal links in the shell.
  /^Impressum$/, /^Datenschutz$/, /^Cookie-Richtlinie$/, /^Imprint$/, /^Privacy$/,
  /^Cookie policy$/, /^Rechtliches$/, /^Legal$/,
  // The skip link and the accessible nav names (WCAG 2.4.1, 1.3.1).
  /Direkt zum Inhalt/, /Skip to content/, /Hauptnavigation/, /Main navigation/,
  /Sprache wählen/, /Choose a language/,
  // The language switcher now shows the language names instead of DE/EN/ES.
  /^(Deutsch|English|Español|Français|Italiano)$/,
  // The data is baked in: the old pages show their loading text here.
  /^(Lade|Loading)/i, /Lädt/, /…$/,
  // Gated regions explain themselves instead of being empty (vmk).
  /braucht Ihre Zustimmung/, /needs your consent/,
  /Shop in neuem Tab öffnen/, /Open the shop in a new tab/,
  // Baked-in release data the old page could not show before its fetch.
  /^v?\d+\.\d+\.\d+/, /^Enigma2Player-/, /\.(exe|dmg|AppImage|deb|rpm|msi|tar\.gz)$/,
  /Letzte Version|Aktuelle Version/, /Latest version/, /Vorab-Version/, /Pre-release/,
  /^(Windows|macOS|Linux)$/, /^(Herunterladen|Download)$/,
  // The language switcher shows each language in its own name now, not DE/EN/ES:
  // a visitor looking for their language recognises "Deutsch", not "DE".
  /^(DE|EN|ES|FR|IT)$/,
  // The shop: the Astro build had no licence server configured, so every /buy
  // and /account page said "not available yet". This build has one, so those
  // pages frame the shop behind the consent gate instead.
  /Der Shop ist noch nicht verfügbar/, /The shop is not available yet/,
  /Il negozio non è ancora disponibile/, /La boutique n’est pas encore disponible/,
  /La tienda aún no está disponible/,
  // THE OLD SITE'S OWN DEFECT, not content to preserve: every prefixed
  // language was served with the German navigation and <html lang="de">,
  // because `pathname.replace(baseUrl(), '/')` turned `/enigma2_player/en/`
  // into `//en/` and the segment it read was empty. The bead that described it
  // (enigma2_player-w83) only named /fr and /it; it was all four. These lines
  // are the German labels disappearing from the non-German pages.
  /^(Start|Funktionen|Screenshots|Downloads|Changelog|Dokumentation|FAQ|Preise)$/,
  /^(Lizenz kaufen|Konto|Lizenzinfo|Kontakt)$/,
  /^Enigma2 Player — von madoe21\.$/,
];

/** Visible text of an HTML file, as a list of trimmed lines. */
async function textOf(file) {
  let html;
  try {
    html = await readFile(file, 'utf8');
  } catch {
    return null;
  }
  return html
    // Everything that is not shown to a reader.
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<head[\s\S]*?<\/head>/i, ' ')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 1);
}

function expected(line) {
  return EXPECTED.some((pattern) => pattern.test(line));
}

const verbose = process.argv.includes('--verbose');

let unexplainedTotal = 0;
let missingTotal = 0;

for (const lang of LANGS) {
  for (const page of PAGES) {
    const sub = lang === 'de' ? page : `${lang}/${page}`;
    const path = sub ? `${sub}/index.html` : 'index.html';
    const [old, now] = await Promise.all([textOf(`${ASTRO}/${path}`), textOf(`${ANGULAR}/${path}`)]);
    if (old === null || now === null) {
      console.log(`? /${sub || ''}: ${old === null ? 'not in the Astro build' : ''}` +
        `${now === null ? 'not in the Angular build' : ''}`);
      continue;
    }
    const oldSet = new Set(old);
    const nowSet = new Set(now);
    const missing = old.filter((line) => !nowSet.has(line) && !expected(line));
    const added = now.filter((line) => !oldSet.has(line) && !expected(line));

    if (missing.length === 0 && added.length === 0) {
      console.log(`= /${sub || ''} (${old.length} lines)`);
      continue;
    }
    // A missing line is the finding. Added lines print only with --verbose,
    // because here they are dominated by two known causes - the data the build
    // bakes in, and the translated strings the old build never showed - and a
    // wall of them hides the one number that matters.
    console.log(
      `${missing.length === 0 ? '+' : '!'} /${sub || ''}` +
        `  (${missing.length} missing, ${added.length} added)`,
    );
    for (const line of missing) {
      console.log(`  - ${line}`);
    }
    if (verbose) {
      for (const line of added) {
        console.log(`  + ${line}`);
      }
    }
    missingTotal += missing.length;
    unexplainedTotal += added.length;
  }
}

console.log(
  `\n${missingTotal} line(s) the Astro site showed and this one does not.` +
    `\n${unexplainedTotal} line(s) this build shows that the old one did not ` +
    `(--verbose to list them).`,
);
if (missingTotal > 0) {
  console.log(
    '\nA missing line is the finding: content the old site had and this one ' +
      'does not. Added lines are usually one of the two known causes - data ' +
      'the build now bakes in, or a translated string the old build never ' +
      'showed because every prefixed language was served in German.',
  );
}
