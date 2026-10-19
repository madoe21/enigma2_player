/**
 * The release notes, from the markdown GitHub carries to a structure a
 * template can render.
 *
 * The notes are written as markdown in the application's `CHANGELOG.md` and
 * published to the GitHub release, so the body this site bakes in is markdown
 * whether the site wants it or not. The page used to print it verbatim, which
 * put `**bold**`, `- `, `| Platform |` and `### Downloads` on screen and
 * turned ten changes into one wall of text (enigma2_player-ryy).
 *
 * Two things this deliberately does NOT do:
 *
 * - It does not emit HTML. There is no `innerHTML` anywhere in this project
 *   and this is the one place that would have had a reason to: a release body
 *   is written by us but travels through an API, and `bypassSecurityTrustHtml`
 *   on it would make a compromised token an XSS hole on every page view. The
 *   parser returns data; the template decides which element each piece
 *   becomes, so Angular's escaping stays in force.
 * - It does not pull in a markdown library. The dialect here is the one our
 *   own release notes use - paragraphs, `-` lists, `**strong**`, `` `code` ``,
 *   `###` headings, `>` quotes and pipe tables - which is some 120 lines of
 *   parser against a dependency that ships a whole HTML sanitiser we would
 *   not use. Anything it does not know degrades to text rather than to
 *   markers on screen.
 *
 * It is a pure function over a string: no Angular, no injection, no I/O.
 */

/** A run of text inside a block, with the emphasis the source asked for. */
export interface NoteSpan {
  readonly text: string;
  /** `**like this**` - rendered as `<strong>`. */
  readonly strong: boolean;
  /** `` `like this` `` - rendered as `<code>`. */
  readonly code: boolean;
}

/** One line of text: the spans it is made of. */
export type NoteLine = readonly NoteSpan[];

/** One block of a release note, discriminated by `kind` for the template. */
export type NoteBlock =
  | { readonly kind: 'heading'; readonly spans: NoteLine }
  | { readonly kind: 'paragraph'; readonly spans: NoteLine }
  | { readonly kind: 'list'; readonly items: readonly NoteLine[] }
  | { readonly kind: 'quote'; readonly paragraphs: readonly NoteLine[] }
  | {
      readonly kind: 'table';
      readonly head: readonly NoteLine[];
      readonly rows: readonly (readonly NoteLine[])[];
    };

const HEADING = /^#{1,6}\s+(.*)$/;
const BULLET = /^[-*]\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const TABLE_ROW = /^\|(.*)\|\s*$/;
/** The `|---|:--:|` line under a table's head row: a separator, not data. */
const TABLE_RULE = /^\|[\s|:-]+\|?\s*$/;
/** `**strong**` or `` `code` `` - the only inline markup the notes use. */
const INLINE = /\*\*([^*]+)\*\*|`([^`]+)`/g;

/**
 * The blocks of one release body, in source order.
 *
 * Absent or blank input is an empty list, not an error: a release published
 * without notes is a state the page renders (AGENTS.md §2b), and the heading
 * with the version and the date carries it on its own.
 */
export function parseReleaseNotes(body: string | null | undefined): readonly NoteBlock[] {
  if (!body) {
    return [];
  }
  const lines = body.replace(/\r\n?/g, '\n').split('\n');
  const blocks: NoteBlock[] = [];
  let at = 0;
  while (at < lines.length) {
    const line = lines[at];
    if (line.trim() === '') {
      at += 1;
    } else if (HEADING.test(line)) {
      blocks.push({ kind: 'heading', spans: spansOf(HEADING.exec(line)![1]) });
      at += 1;
    } else {
      at = push(blocks, lines, at);
    }
  }
  return blocks;
}

/** Reads the multi-line block at `at`, appends it, and returns the next line. */
function push(blocks: NoteBlock[], lines: readonly string[], at: number): number {
  const line = lines[at];
  if (BULLET.test(line)) {
    return takeList(blocks, lines, at);
  }
  if (QUOTE.test(line)) {
    return takeQuote(blocks, lines, at);
  }
  if (TABLE_ROW.test(line)) {
    return takeTable(blocks, lines, at);
  }
  return takeParagraph(blocks, lines, at);
}

/** True for a line that starts a different block, so the current one ends. */
function startsBlock(line: string): boolean {
  return (
    line.trim() === '' ||
    HEADING.test(line) ||
    BULLET.test(line) ||
    QUOTE.test(line) ||
    TABLE_ROW.test(line)
  );
}

/**
 * A paragraph: every following line until a blank one or another block.
 *
 * The lines are joined with a space rather than kept apart, because a single
 * newline in markdown is a soft break - the notes are hard-wrapped at 80
 * columns, and `white-space: pre-line` printed every one of those wraps as if
 * the author had meant it.
 */
function takeParagraph(blocks: NoteBlock[], lines: readonly string[], at: number): number {
  const text: string[] = [];
  let cursor = at;
  while (cursor < lines.length && !startsBlock(lines[cursor])) {
    text.push(lines[cursor].trim());
    cursor += 1;
  }
  blocks.push({ kind: 'paragraph', spans: spansOf(text.join(' ')) });
  return cursor;
}

/**
 * A bullet list, with the indented continuation lines folded into their item.
 *
 * Every item in our notes is a sentence or three wrapped over several lines,
 * so without the folding each wrap became its own list item.
 */
function takeList(blocks: NoteBlock[], lines: readonly string[], at: number): number {
  const items: string[] = [];
  let cursor = at;
  while (cursor < lines.length) {
    const bullet = BULLET.exec(lines[cursor]);
    if (bullet) {
      items.push(bullet[1].trim());
    } else if (items.length > 0 && !startsBlock(lines[cursor])) {
      items[items.length - 1] = `${items[items.length - 1]} ${lines[cursor].trim()}`;
    } else {
      break;
    }
    cursor += 1;
  }
  blocks.push({ kind: 'list', items: items.map(spansOf) });
  return cursor;
}

/**
 * A `>` quote, as paragraphs.
 *
 * Soft breaks are folded like anywhere else - the quoted remarks are wrapped
 * at the same 80 columns as the rest - and an empty quoted line starts the
 * next paragraph.
 */
function takeQuote(blocks: NoteBlock[], lines: readonly string[], at: number): number {
  const paragraphs: string[][] = [[]];
  let cursor = at;
  while (cursor < lines.length) {
    const quoted = QUOTE.exec(lines[cursor]);
    if (!quoted) {
      break;
    }
    const text = quoted[1].trim();
    if (text === '') {
      paragraphs.push([]);
    } else {
      paragraphs[paragraphs.length - 1].push(text);
    }
    cursor += 1;
  }
  blocks.push({
    kind: 'quote',
    paragraphs: paragraphs
      .filter((paragraph) => paragraph.length > 0)
      .map((paragraph) => spansOf(paragraph.join(' '))),
  });
  return cursor;
}

/**
 * A pipe table: the head row, the rule line, the body rows.
 *
 * A table because that is what the content is - platform, file, note - and a
 * `<table>` with `<th scope="col">` is the only shape a screen reader can
 * announce a cell's column in (WCAG 1.3.1). Without a rule line there is no
 * head row and every row is data, which is still a valid table.
 */
function takeTable(blocks: NoteBlock[], lines: readonly string[], at: number): number {
  const rows: string[][] = [];
  let cursor = at;
  let ruled = false;
  while (cursor < lines.length && TABLE_ROW.test(lines[cursor])) {
    if (TABLE_RULE.test(lines[cursor])) {
      ruled = rows.length === 1;
    } else {
      rows.push(cellsOf(lines[cursor]));
    }
    cursor += 1;
  }
  const head = ruled ? rows.shift()! : [];
  blocks.push({
    kind: 'table',
    head: head.map(spansOf),
    rows: rows.map((row) => row.map(spansOf)),
  });
  return cursor;
}

/** The cells of one pipe row, outer pipes dropped. */
function cellsOf(line: string): string[] {
  return TABLE_ROW.exec(line)![1]
    .split('|')
    .map((cell) => cell.trim());
}

/**
 * One line of text split into its emphasised and plain runs.
 *
 * Leftover markers are stripped from the plain runs: a release note with an
 * unclosed `**` is malformed, and the reader should see the sentence rather
 * than the author's typo. A single `*` is left alone - the notes are full of
 * `enigma2_player-windows-x64-setup-*.exe`, where it is a wildcard and not
 * emphasis.
 */
function spansOf(text: string): NoteLine {
  const spans: NoteSpan[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    plain(spans, text.slice(last, match.index));
    spans.push({
      text: match[1] ?? match[2],
      strong: match[1] !== undefined,
      code: match[1] === undefined,
    });
    last = match.index + match[0].length;
  }
  plain(spans, text.slice(last));
  return spans;
}

/** Appends a run of plain text, markers stripped, if anything is left of it. */
function plain(spans: NoteSpan[], text: string): void {
  const clean = text.replace(/\*\*/g, '').replace(/`/g, '');
  if (clean !== '') {
    spans.push({ text: clean, strong: false, code: false });
  }
}
