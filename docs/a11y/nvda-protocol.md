# NVDA pass — manual protocol

The last open acceptance criterion of `enigma2_player-iaa`: a screen-reader walk on Windows,
page by page, with the result recorded in the bead. It cannot be automated, so this file is the
script for the person doing it — and it deliberately contains **only what a tool cannot decide**.

What is already proven mechanically, on every run, and is therefore not in this protocol:
`site/e2e/a11y.spec.ts` runs axe-core (WCAG 2.2 AA plus best-practice) over all 66 pages in both
consent states, plus the legal pages and the open lightbox; it checks that every page has a title
of its own, that every focusable element shows a focus cue, that the skip link becomes visible and
changes the URL, and that a page change and a language change reach the live region. Zero
violations is the current state.

Three questions remain, and all three need ears:

1. **Does the reading order match the intent?** NVDA reads the DOM, not the layout.
2. **Are the labels understandable**, not merely present? axe proves a control has a name; it
   cannot tell you the name is useless.
3. **Do the announcements come at the right moment, once?** A live region that fires twice, or
   over the browser's own page-load announcement, passes every automated check.

## 1. Setup

```bash
cd site
npm run build        # the real prerendered files, not `ng serve`
npm run serve:dist   # http://127.0.0.1:4321/enigma2_player/
```

Test against the built files. `ng serve` differs in exactly the place this pass is about: the
prerendered HTML is what a visitor and a crawler receive before any JavaScript runs.

- **NVDA** 2024.1 or newer, with **Chrome or Edge**, and a second run in **Firefox** — NVDA plus
  Firefox is the pairing most of its users have, and the two browsers differ in how they expose
  `aria-modal` and iframe boundaries.
- **Speech Viewer on** (NVDA menu → Tools → Speech Viewer). It is the log, and its text is what
  gets pasted into the bead. Reconstructing from memory produces a protocol nobody can act on.
- **Automatic language switching on** (NVDA → Preferences → Settings → Speech). Without it §4.4
  cannot be judged at all, because the per-link `lang` attributes have no audible effect. It needs
  a synthesizer that speaks all five languages; eSpeak NG does.
- Both cookie states, every surface: delete the `e2p_consent` cookie for the undecided run, accept
  it for the second. The undecided state is what every first-time visitor gets, and it is the one
  with a modal dialog in it.

## 2. The keys this protocol uses

| Key | What it does |
| --- | --- |
| `NVDA` | The modifier — `Insert` or `CapsLock`, depending on your install |
| `NVDA`+`Space` | Switch browse mode ↔ focus mode. **The distinction matters in §4.6.** |
| `Tab` / `Shift`+`Tab` | Next/previous focusable control |
| `↓` / `↑` | Read next/previous line (browse mode) — this is the reading order |
| `H` / `Shift`+`H` | Next/previous heading |
| `D` | Next landmark |
| `K` | Next link |
| `NVDA`+`F7` | Elements list — headings, links, landmarks, buttons. Judge labels here. |
| `NVDA`+`Tab` | Repeat what currently has focus |

## 3. Which pages

Not 66 runs. Every distinct template once in German, plus the language-specific checks across all
five languages, plus the two legal sets:

- **Templates (de):** `/`, `/features`, `/screenshots`, `/downloads`, `/changelog`, `/docs`,
  `/faq`, `/pricing`, `/buy`, `/account`, `/license`, `/contact`
- **Languages:** `/en/`, `/es/`, `/fr/`, `/it/` — landing page plus one content page each, and the
  language switcher walked in every one (§4.4)
- **Legal:** `/impressum`, `/datenschutz`, `/cookies` and `/en/imprint`, `/en/privacy`,
  `/en/cookies` — these exist in German and English only, by design

## 4. The surfaces

Each one names the **known risk** found while reading the code, because a protocol that only says
"check it works" gets a "works" back.

### 4.1 Entry and the skip link

Tab once from a fresh load: the skip link is the first stop. Press `Enter`, then `↓`.

**Known risk:** the target is `<div id="content">` (`site/src/app/app.html:19`) — not focusable,
and not the `<main>` element (each page carries its own `<main class="page">`). The automated test
asserts only that the URL becomes `#content` (`site/e2e/a11y.spec.ts:139`). A hash jump to a
non-focusable element does not reliably move NVDA's review cursor.

- After `Enter`, does `↓` read the page heading — or the navigation again?
- If it lands back in the nav, that is a **defect**, and the fix is `tabindex="-1"` on the target.

### 4.2 The cookie dialog (undecided state)

Shell order is deliberate: skip link, demo notice, dialog, navigation (`app.html:14-18`).

- Is the dialog announced **once**, with its title and its body text?
- **Known risk:** `LiveAnnouncer.announce(..., 'assertive')` fires after the first render
  (`consent-modal.ts:110-114`) *and* the dialog carries `aria-labelledby` + `aria-describedby`.
  Listen for the same text twice, or one talking over the other.
- Does `Tab` cycle inside the dialog and `Shift`+`Tab` too — nothing behind the scrim reachable?
- `Esc` does nothing **by design** (`consent-modal.ts:14-18`): refusing is a labelled button, not a
  cross in a corner. Confirm NVDA does not claim the dialog closed.
- In the elements list: do the legal links say what they are out of context?
- After `Accept`: is the acceptance announced, and where does focus land? `cdkTrapFocus` restores
  it to where it was — judge whether that place makes sense once the dialog is gone.

### 4.3 Navigation and the current page

`routerLinkActive` sets `aria-current="page"` (`site-nav.ts:44`).

- Does NVDA say "current page" on the entry you are on, in each language?
- `D`: are the landmarks distinguishable by name — main navigation, language navigation, footer
  legal? (Two identically named ones were a real finding; axe guards it now, but names are judged
  here.)

### 4.4 The language switcher

Each link carries `lang` and `hreflang` (`site-nav.ts:60-61`) and its own name — "Español", not
"Spanish". Since `enigma2_player-13h` the *visible* entry is a flag plus a two-letter code, and the
name is text that only a reader gets (`site-nav.ts:64-66`): the flag is `aria-hidden` because it is
a picture of a country rather than a language, and the code is `aria-hidden` because "DE Deutsch"
for one link is noise. This section is therefore the test of that decision, not a formality.

- Does the entry announce as the language's own name **alone** — no "graphic", no "image", no
  spelled-out "D E" before it?
- With automatic language switching on: is "Español" spoken *in Spanish*, "Français" in French?
- After switching: "Language changed: X" **in the language switched to**, exactly once
  (`route-announcer.ts:56-62`) — and **not** followed by a page-change announcement for the same
  action.
- Walk at least de → en and en → fr. Also switch on a legal page, where the switcher falls back to
  the target language's landing page: does what is announced match where you ended up?

### 4.5 Page changes inside the application

Single-page navigation announces politely: page-changed plus the title
(`route-announcer.ts:63-69`), and stays silent on the first load.

- Does the announcement arrive after the activation, naming the page that actually appeared?
- Where is focus afterwards? It stays on the activated link; the reading position does **not** move
  to the new `<h1>`. Judge it: if orienting on the new page takes a hunt, the finding is "focus the
  heading after navigation" — a separate bead, not a silent fix here.

### 4.6 The gallery and its lightbox (`/screenshots`)

**Known risk 1 — arrow keys.** `←`/`→` are bound on the dialog element
(`screenshots.ts:56-57`). In **browse mode** NVDA consumes arrow keys for its own cursor, so
stepping through images may work only in **focus mode** (`NVDA`+`Space`). Test both modes, and note
whether anything tells the user which one they need.

**Known risk 2 — threefold caption.** The same string is the dialog's `aria-label`, the image's
`alt` and the `<figcaption>` (`screenshots.ts:52`, `76`, `77`), and `LiveAnnouncer` announces it as
well on open and on every step (`screenshots.ts:139-144`). Count how often you hear it.

**Known risk 3 — glyph buttons.** `✕`, `‹`, `›` carry `aria-label`s. Confirm the labels are read
and not the glyph characters.

Also: `Esc` **does** close here, unlike the cookie dialog, and focus must return to the thumbnail
you opened.

### 4.7 Blocked regions (consent gate)

While consent is refused, a gated area renders a reason with `role="note"` and — only after a
decision exists — an accept button (`consent-gate.ts:27-41`).

- Is the reason read **before** the button, so the button is not an unexplained offer?
- In the buttons list, is its purpose clear without the surrounding text?

### 4.8 The shop frame (`/buy`, `/account`, consent accepted)

- **Known risk:** the iframe's `title` is the same string as the page's `<h1>` (`shop.ts:32`, `41`).
  Listen for "heading Buy … Buy frame" duplication.
- Is entering and leaving the frame announced at all? In Firefox and in Chrome.
- The "open in a tab" fallback link must be reachable by keyboard
  (`shop.ts:44-46`).
- What is **inside** the frame is the licence server's responsibility and out of scope for this
  bead. Note it, do not grade it.

### 4.9 The content pages

`/`, `/features`, `/downloads`, `/changelog`, `/docs`, `/faq`, `/pricing`, `/license`, `/contact`:

- `NVDA`+`F7` → headings: does the list read as an outline of the page, or as fragments?
- `NVDA`+`F7` → links: six links all called "Download" is a finding (WCAG 2.4.4). The downloads
  page is the one to check hardest.
- Are dates read as dates? They go through `Intl.DateTimeFormat` per language — the `DatePipe` it
  replaced rendered **nothing** for de/es/fr/it and silently emptied the heading it stood in.
- Empty states are states, not errors: no release → no download list, no price models → "soon".
  Does the page say so audibly, or is there just silence where content would be?

### 4.10 The legal pages

Long prose, and the place a screen-reader user is most likely to be looking for one specific fact.

- Is the heading outline usable for finding a section (`H`, or the headings list)?
- **Expected, already filed:** the identity values are still placeholders and NVDA will read
  `⟨COMPANY_LEGAL_NAME⟩` and friends as glyph soup (`site/src/app/legal/entity.ts`). That is
  `enigma2_player-i2z`, deferred until the company exists. Note it and move on — do not file it
  again.

## 5. There are no forms on this site

The bead's acceptance criteria name form errors announced via `aria-describedby` on the field.
Checked 2026-10-15: there is no `<form>`, `<input>`, `<textarea>` or `<select>` anywhere in
`site/src/app`. Contact is links only; buying and the account are the licence server's, inside the
iframe. So that clause has **no surface here** — record it as not applicable rather than as
untested, and note that it applies again the day a form is added.

## 6. Recording the result

One line per surface, pasted from the Speech Viewer rather than retold:

```text
NVDA <version> · <browser> <version> · <date>
4.1  skip link              PASS | FAIL | NOTE — what was heard
4.2  cookie dialog          …
4.3  navigation / current   …
4.4  language switcher      …
4.5  page change            …
4.6  gallery + lightbox     …
4.7  blocked regions        …
4.8  shop frame             …
4.9  content pages          …
4.10 legal pages            …
5    forms                  N/A — no form exists in site/src/app
```

Then:

```bash
bd update enigma2_player-iaa --notes "<the block above>"
# all PASS:
bd close enigma2_player-iaa --reason "NVDA pass done, protocol in docs/a11y/nvda-protocol.md"
```

A FAIL becomes its own bead rather than a fix squeezed into the close:

```bash
bd create --type=bug --priority=1 --title="…" --deps discovered-from:enigma2_player-iaa
```

## 7. What counts as a defect

**Defect:** an announcement that is wrong, missing, doubled, or arrives at the wrong moment; a
control that cannot be reached or operated by keyboard; a focus trap that leaks or does not
restore; a reading order that contradicts the intent; a label that does not say what the control
does.

**Not a defect here:** NVDA's verbosity and punctuation settings; a synthesizer mispronouncing a
product name; anything inside the shop iframe (licence server); the legal placeholders
(`enigma2_player-i2z`); the absence of form handling (§5).
