import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { Downloads } from './downloads';
import { SITE_DATA, latestRelease } from '../../content/site-data';

/**
 * The download list, which is now built from data the BUILD fetched.
 *
 * So these tests are also the check that the baked-in file is usable: if
 * `tool/fetch-site-data.mjs` wrote something this page cannot render, the
 * failure belongs here and not in a visitor's browser.
 */
describe('Downloads', () => {
  async function render(lang = 'de'): Promise<ComponentFixture<Downloads>> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Downloads],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { data: { lang } } } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Downloads);
    await fixture.whenStable();
    return fixture;
  }

  function rows(fixture: ComponentFixture<Downloads>): HTMLElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.download-row'));
  }

  it('offers one row per platform the release has a file for', async () => {
    const fixture = await render();
    const release = latestRelease();

    expect(release, 'the committed site-data.json has no release').not.toBeNull();
    expect(rows(fixture).length).toBe(release!.downloads.length);
  });

  it('names the version on offer', async () => {
    const fixture = await render();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain(latestRelease()!.version!);
  });

  it('links the file itself, not a page about it', async () => {
    const fixture = await render();

    for (const row of rows(fixture)) {
      const href = row.querySelector('a')?.getAttribute('href') ?? '';
      // A download button that opens a release page is one extra step for
      // someone who already said which platform they are on.
      expect(href).toMatch(/^https:\/\/github\.com\/.+\/releases\/download\//);
    }
  });

  it('shows the platform and the file name, so a visitor can tell what they get', async () => {
    const fixture = await render();
    const first = rows(fixture)[0];

    expect(first.textContent).toContain('Windows');
    expect(first.textContent).toMatch(/\.(exe|msi)/);
  });

  it('translates its own labels', async () => {
    const german = (await render('de')).nativeElement as HTMLElement;
    const english = (await render('en')).nativeElement as HTMLElement;

    expect(german.querySelector('h1')?.textContent?.trim()).toBe('Downloads');
    expect(english.textContent).toContain('Download');
    expect(german.textContent).toContain('Herunterladen');
  });

  it('points at the releases page of the public repository', async () => {
    const fixture = await render();
    const text = (fixture.nativeElement as HTMLElement).innerHTML;

    expect(text).toContain(`https://github.com/${SITE_DATA.repo}/releases`);
  });
});
