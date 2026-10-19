import { NoteBlock, NoteLine, parseReleaseNotes } from './release-notes';
import { releaseNotes } from './site-data';

/**
 * The markdown subset the release notes are written in.
 *
 * These tests are mostly about what the reader must NOT see: a marker. The
 * body comes from the GitHub API, so the parser meets whatever the release
 * author wrote, including a typo - and the old page's answer to anything it
 * did not understand was to print it (enigma2_player-ryy).
 */
describe('parseReleaseNotes', () => {
  /** The visible text of a line, as a reader would read it. */
  function read(spans: NoteLine): string {
    return spans.map((span) => span.text).join('');
  }

  /** Every piece of text in the parsed blocks, flattened. */
  function allText(blocks: readonly NoteBlock[]): string {
    return blocks
      .map((block) => {
        switch (block.kind) {
          case 'list':
            return block.items.map(read).join(' ');
          case 'quote':
            return block.paragraphs.map(read).join(' ');
          case 'table':
            return [block.head, ...block.rows].map((row) => row.map(read).join(' ')).join(' ');
          default:
            return read(block.spans);
        }
      })
      .join('\n');
  }

  it('has nothing to show for a release published without notes', () => {
    // All three are states the data can be in: GitHub omits the body, the
    // generator writes an empty string, the field is missing entirely.
    expect(parseReleaseNotes('')).toEqual([]);
    expect(parseReleaseNotes(null)).toEqual([]);
    expect(parseReleaseNotes(undefined)).toEqual([]);
    expect(parseReleaseNotes('\n\n   \n')).toEqual([]);
  });

  it('folds a hard-wrapped paragraph back into one paragraph', () => {
    const blocks = parseReleaseNotes('One sentence that was\nwrapped at eighty columns.');

    // The old page rendered the wrap as a line break, which is why a note
    // read like poetry.
    expect(blocks).toHaveLength(1);
    expect(blocks[0].kind).toBe('paragraph');
    expect(allText(blocks)).toBe('One sentence that was wrapped at eighty columns.');
  });

  it('breaks a paragraph where the source breaks it', () => {
    const blocks = parseReleaseNotes('First thing.\n\nSecond thing.');

    expect(blocks.map((block) => block.kind)).toEqual(['paragraph', 'paragraph']);
  });

  it('renders a list as a list, continuation lines included', () => {
    const blocks = parseReleaseNotes(
      '- **First item.** With a sentence\n  that wrapped.\n- Second item.\n',
    );

    expect(blocks).toHaveLength(1);
    const block = blocks[0];
    if (block.kind !== 'list') {
      throw new Error(`expected a list, got ${block.kind}`);
    }
    expect(block.items).toHaveLength(2);
    expect(read(block.items[0])).toBe('First item. With a sentence that wrapped.');
    expect(read(block.items[1])).toBe('Second item.');
    // The lead-in of an item is emphasised, which is how the notes are written.
    expect(block.items[0][0]).toEqual({ text: 'First item.', strong: true, code: false });
  });

  it('keeps a list and the paragraph after it apart', () => {
    const blocks = parseReleaseNotes('- Only item.\n\nA closing remark.');

    expect(blocks.map((block) => block.kind)).toEqual(['list', 'paragraph']);
  });

  it('takes `code` out of the text and leaves the spacing alone', () => {
    const blocks = parseReleaseNotes('Reads `satellites.xml` from the box.');

    const spans = blocks[0].kind === 'paragraph' ? blocks[0].spans : [];
    expect(spans.map((span) => span.code)).toEqual([false, true, false]);
    expect(read(spans)).toBe('Reads satellites.xml from the box.');
  });

  it('leaves a wildcard star alone', () => {
    // `enigma2_player-windows-x64-setup-*.exe` is a file name, not emphasis -
    // treating a single star as italics would eat it.
    const blocks = parseReleaseNotes('Run `enigma2_player-*-setup.exe` or the *.deb package.');

    expect(allText(blocks)).toBe('Run enigma2_player-*-setup.exe or the *.deb package.');
  });

  it('makes a `###` section an own heading block', () => {
    const blocks = parseReleaseNotes('### Downloads\nPick a file.');

    expect(blocks[0].kind).toBe('heading');
    expect(blocks[0].kind === 'heading' && read(blocks[0].spans)).toBe('Downloads');
    expect(blocks[1].kind).toBe('paragraph');
  });

  it('keeps a quoted remark as a quote', () => {
    const blocks = parseReleaseNotes('> Needs licence server 0.4.0\n> or newer.\n>\n> And this.');

    const block = blocks[0];
    if (block.kind !== 'quote') {
      throw new Error(`expected a quote, got ${block.kind}`);
    }
    expect(block.paragraphs.map(read)).toEqual([
      'Needs licence server 0.4.0 or newer.',
      'And this.',
    ]);
  });

  it('reads a pipe table as head row plus data rows', () => {
    const blocks = parseReleaseNotes(
      '| Platform | File |\n|----------|------|\n| Windows | `setup.exe` |\n| macOS | `app.dmg` |',
    );

    const block = blocks[0];
    if (block.kind !== 'table') {
      throw new Error(`expected a table, got ${block.kind}`);
    }
    expect(block.head.map(read)).toEqual(['Platform', 'File']);
    expect(block.rows.map((row) => row.map(read))).toEqual([
      ['Windows', 'setup.exe'],
      ['macOS', 'app.dmg'],
    ]);
  });

  it('keeps a table without a rule line as data only', () => {
    // No head row to announce is better than announcing the first data row as
    // one (WCAG 1.3.1): a `<th>` that is not a header is a lie.
    const blocks = parseReleaseNotes('| a | b |\n| c | d |');

    const block = blocks[0];
    if (block.kind !== 'table') {
      throw new Error(`expected a table, got ${block.kind}`);
    }
    expect(block.head).toEqual([]);
    expect(block.rows).toHaveLength(2);
  });

  it('shows a malformed note as text rather than as markers', () => {
    const blocks = parseReleaseNotes(
      '**Unclosed bold and an open `code\n\n-\n\n#\n\n|\n\n> \n\nStill readable.',
    );

    const text = allText(blocks);
    expect(text).toContain('Unclosed bold and an open code');
    expect(text).toContain('Still readable.');
    expect(text).not.toContain('**');
    expect(text).not.toContain('`');
  });

  it('leaves no marker on screen for any committed release note', () => {
    const notes = releaseNotes();
    expect(notes.length).toBeGreaterThan(0);

    for (const note of notes) {
      const blocks = parseReleaseNotes(note.body);
      const text = allText(blocks);

      // The real data, not a fixture: this is the content the page ships, and
      // every marker in this list was visible on it before the parse.
      expect(blocks.length, note.tag).toBeGreaterThan(0);
      expect(text, note.tag).not.toContain('**');
      expect(text, note.tag).not.toContain('`');
      expect(text, note.tag).not.toContain('|');
      expect(text, note.tag).not.toMatch(/^#/m);
      expect(text, note.tag).not.toMatch(/^[-*] /m);
      expect(text, note.tag).not.toMatch(/^> /m);
    }
  });

  it('finds the shapes the committed notes are actually written in', () => {
    // A guard for the subset: if a future release note uses something this
    // parser does not know, it still renders - but the shapes it does know
    // have to keep working on the real bodies.
    const kinds = new Set(parseReleaseNotes(releaseNotes()[0].body).map((block) => block.kind));

    expect([...kinds].sort()).toEqual(['heading', 'list', 'paragraph', 'quote', 'table']);
  });
});
