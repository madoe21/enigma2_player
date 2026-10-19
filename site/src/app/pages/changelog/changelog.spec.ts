import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { Changelog } from './changelog';
import { ReleaseNote } from '../../content/site-data';
import { SiteContent } from '../../content/site-content';
import { routeStub } from '../page-route.stub';

/**
 * The changelog page: a heading per release and its notes as markup.
 *
 * The page renders the committed data, so these tests run against it rather
 * than against a fixture wherever they can - what is on the page is what a
 * visitor gets. The fixture is for the states the data is not in today: no
 * releases at all, and a release whose body is unusable.
 */
describe('Changelog', () => {
  async function render(lang = 'de'): Promise<ComponentFixture<Changelog>> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Changelog],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: routeStub({ lang }) }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Changelog);
    await fixture.whenStable();
    return fixture;
  }

  async function withNotes(
    fixture: ComponentFixture<Changelog>,
    notes: readonly ReleaseNote[],
  ): Promise<HTMLElement> {
    TestBed.inject(SiteContent).notes.set(notes);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  function note(body: string, over: Partial<ReleaseNote> = {}): ReleaseNote {
    return {
      tag: 'v9.9.9',
      name: 'Enigma2 Player v9.9.9',
      publishedAt: '2026-03-04T10:00:00Z',
      url: 'https://example.invalid/releases/tag/v9.9.9',
      prerelease: false,
      body,
      ...over,
    };
  }

  it('heads every release with its version and its date', async () => {
    const fixture = await render();
    const element = await withNotes(fixture, [note('A change.')]);

    const heading = element.querySelector('h2');
    expect(heading?.querySelector('.release__version')?.textContent?.trim()).toBe(
      'Enigma2 Player v9.9.9',
    );
    // Through `formatDate`, so the date is in the page's language and not in
    // the ISO form the API delivers.
    expect(heading?.querySelector('.release__date')?.textContent?.trim()).toBe('4. März 2026');
  });

  it('formats the date in the language of the page it is on', async () => {
    const fixture = await render('en');
    const element = await withNotes(fixture, [note('A change.')]);

    expect(element.querySelector('.release__date')?.textContent?.trim()).toBe('March 4, 2026');
  });

  it('renders a list in a note as a list, and bold as bold', async () => {
    const fixture = await render();
    const element = await withNotes(fixture, [
      note('Lead text.\n\n- **First.** Wrapped\n  over two lines.\n- Second.'),
    ]);

    const items = element.querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0].textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'First. Wrapped over two lines.',
    );
    expect(items[0].querySelector('strong')?.textContent).toBe('First.');
    expect(element.querySelectorAll('p').length).toBeGreaterThan(0);
  });

  it('renders a table with column headers a reader can be told about', async () => {
    const fixture = await render();
    const element = await withNotes(fixture, [
      note('| Platform | File |\n|---|---|\n| Windows | `setup.exe` |'),
    ]);

    const headers = Array.from(element.querySelectorAll('th'));
    expect(headers.map((cell) => cell.textContent?.trim())).toEqual(['Platform', 'File']);
    // Without `scope`, a cell in a multi-column table is not tied to its
    // column (WCAG 1.3.1).
    expect(headers.every((cell) => cell.getAttribute('scope') === 'col')).toBe(true);
    expect(element.querySelector('td code')?.textContent).toBe('setup.exe');
    // The table scrolls inside its wrapper instead of widening the page, and
    // a keyboard has to be able to reach that scroll.
    expect(element.querySelector('.note__table-wrap')?.getAttribute('tabindex')).toBe('0');
  });

  it('keeps a section of a note below the release heading in the outline', async () => {
    const fixture = await render();
    const element = await withNotes(fixture, [note('### Downloads\nPick a file.')]);

    // `h2` for the release, `h3` for its sections: the note writes `###`, but
    // the level on the page is the one the outline needs, not the hash count.
    expect(element.querySelectorAll('h1').length).toBe(1);
    expect(element.querySelectorAll('h2').length).toBe(1);
    expect(element.querySelector('h3')?.textContent?.trim()).toBe('Downloads');
    expect(element.querySelectorAll('h4').length).toBe(0);
  });

  it('marks a pre-release in words', async () => {
    const fixture = await render();
    const element = await withNotes(fixture, [note('A change.', { prerelease: true })]);

    expect(element.querySelector('.release__badge')?.textContent?.trim()).toBe('Vorab-Version');
  });

  it('says so when there is no release note at all', async () => {
    const fixture = await render();
    const element = await withNotes(fixture, []);

    expect(element.textContent).toContain('Noch keine Versionshinweise.');
    expect(element.querySelectorAll('.release').length).toBe(0);
  });

  it('still shows the heading for a release with an empty or broken body', async () => {
    const fixture = await render();
    const element = await withNotes(fixture, [
      note(''),
      note('**', { tag: 'v9.9.8', name: 'Enigma2 Player v9.9.8' }),
    ]);

    // A release published without usable notes is a state, not an error: the
    // version and the date are the useful part and they stay (AGENTS.md §2b).
    expect(element.querySelectorAll('.release').length).toBe(2);
    expect(element.textContent).not.toContain('**');
  });

  it('leaves no markdown marker on the page for the committed notes', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    const text = element.textContent ?? '';

    expect(element.querySelectorAll('.release').length).toBeGreaterThan(0);
    expect(text).not.toContain('**');
    expect(text).not.toContain('|---');
    expect(text).not.toContain('### ');
  });
});
