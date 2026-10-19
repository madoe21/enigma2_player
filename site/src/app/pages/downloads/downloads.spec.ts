import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { Downloads } from './downloads';
import { SITE_DATA, latestRelease } from '../../content/site-data';
import { SiteContent } from '../../content/site-content';
import { routeStub } from '../page-route.stub';

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
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: routeStub({ lang }) }],
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

  describe('against an invented release', () => {
    /**
     * A release as the build would write it: one file per desktop platform.
     *
     * Invented rather than the committed one, because the committed one is
     * whatever GitHub had on the day - and the cases worth testing are the
     * ones it does not happen to show: an Android asset slipping in, a lookup
     * that failed, a version the page must not hardcode (enigma2_player-oik).
     *
     * `9.9.9` is deliberately NOT a plausible version. The real releases run
     * v1.0.0 to v1.1.1 and the current one is v1.1.1, which is what
     * `site-data.json` carries; a fixture that looked like a real version
     * would be mistaken for one the first time this test fails.
     */
    const invented = {
      version: 'v9.9.9',
      publishedAt: '2026-12-24T10:00:00Z',
      url: 'https://github.com/madoe21/enigma2_player/releases/tag/v9.9.9',
      downloads: [
        {
          platform: 'windows',
          label: 'Windows',
          file: 'enigma2_player-windows-x64-setup-9.9.9.exe',
          url: 'https://github.com/madoe21/enigma2_player/releases/download/v9.9.9/win.exe',
          size: 42,
        },
        {
          platform: 'linux',
          label: 'Linux',
          file: 'enigma2_player-linux-x64-9.9.9.deb',
          url: 'https://github.com/madoe21/enigma2_player/releases/download/v9.9.9/linux.deb',
          size: 43,
        },
      ],
    };

    it('offers exactly what the release contains, no more', async () => {
      const fixture = await render();
      TestBed.inject(SiteContent).release.set(invented);
      fixture.detectChanges();
      await fixture.whenStable();

      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelectorAll('.download-row').length).toBe(2);
      expect(element.textContent).toContain('enigma2_player-windows-x64-setup-9.9.9.exe');
      expect(element.textContent).toContain('v9.9.9');
    });

    it('never offers an Android or iOS build', async () => {
      // They exist only in the private repository and the store route is not
      // decided (PO, 2026-07-07). The generator filters by platform; this is
      // the assertion that the page adds no row of its own on top.
      const fixture = await render();
      TestBed.inject(SiteContent).release.set({
        ...invented,
        downloads: [
          ...invented.downloads,
          {
            platform: 'android',
            label: 'Android',
            file: 'app-release.apk',
            url: 'https://example.invalid/app-release.apk',
            size: 1,
          },
        ],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).not.toContain('.apk');
      expect(text).not.toContain('.ipa');
    });

    it('stays usable when the release lookup failed', async () => {
      // The generator writes null when GitHub could not be reached. The page
      // then has to point at the releases page rather than show an empty list:
      // somebody who came to download something must not land on nothing.
      const fixture = await render();
      TestBed.inject(SiteContent).release.set(null);
      fixture.detectChanges();
      await fixture.whenStable();

      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelectorAll('.download-row').length).toBe(0);
      expect(element.textContent).toContain('Noch keine Releases');
      const hrefs = Array.from(element.querySelectorAll('a')).map((a) => a.getAttribute('href'));
      expect(hrefs).toContain('https://github.com/madoe21/enigma2_player/releases');
    });

    it('carries no version number of its own', async () => {
      // The site is not versioned and stays at 1.0.0 (PO, 2026-10-09). The
      // only version on the page is the release's, and it comes from the
      // generated data rather than from any source file.
      const fixture = await render();
      TestBed.inject(SiteContent).release.set(invented);
      fixture.detectChanges();
      await fixture.whenStable();

      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      const versions = [...text.matchAll(/\d+\.\d+\.\d+/g)].map((match) => match[0]);
      expect(new Set(versions)).toEqual(new Set(['9.9.9']));
    });
  });
});
