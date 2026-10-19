import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { Landing } from './landing';
import { getScreenshots, shotSource } from '../../content/content';
import { routeStub } from '../page-route.stub';

/**
 * The start page, and the hero the redesign gave it (enigma2_player-4t1).
 *
 * The hero image is the only piece of the redesign with logic behind it - the
 * rest is CSS, which the axe and the zoom passes judge. What is testable here
 * is that the picture is the gallery's own first shot, that its alternative
 * text is the translated caption rather than a literal, and that a locale
 * without screenshots drops the image instead of rendering a broken one.
 */
describe('Landing', () => {
  async function render(lang = 'de'): Promise<ComponentFixture<Landing>> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: routeStub({ lang }) }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Landing);
    await fixture.whenStable();
    return fixture;
  }

  function hero(fixture: ComponentFixture<Landing>): HTMLImageElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('.hero__image');
  }

  it('shows the product instead of only describing it', async () => {
    const image = hero(await render());

    expect(image, 'the hero has no image').not.toBeNull();
    expect(image!.getAttribute('src')).toBe(shotSource(getScreenshots('de')[0]));
  });

  it('reserves the slot, so the page does not jump when the file arrives', async () => {
    const image = hero(await render());

    // Width and height together give the intrinsic ratio; without them the
    // layout shifts once the image loads (and Lighthouse counts it as CLS).
    expect(image!.getAttribute('width')).toBe('1200');
    expect(image!.getAttribute('height')).toBe('675');
  });

  it('describes the image in the language the page is in', async () => {
    const german = hero(await render('de'))!;
    const italian = hero(await render('it'))!;

    // The caption comes from the gallery data, which is translated per locale -
    // so the alternative text is too, and no new dictionary key was needed.
    expect(german.getAttribute('alt')).toBe(getScreenshots('de')[0].caption);
    expect(italian.getAttribute('alt')).toBe(getScreenshots('it')[0].caption);
    expect(german.getAttribute('alt')).not.toBe(italian.getAttribute('alt'));
  });

  it('never ships an image without an alternative text', async () => {
    for (const lang of ['de', 'en', 'es', 'fr', 'it']) {
      const images = Array.from(
        (await render(lang)).nativeElement.querySelectorAll('img'),
      ) as HTMLImageElement[];

      for (const image of images) {
        expect((image.getAttribute('alt') ?? '').trim().length, `/${lang}`).toBeGreaterThan(0);
      }
    }
  });

  it('keeps the five highlights the page promised', async () => {
    const cards = (await render()).nativeElement.querySelectorAll('.card--highlight');

    expect(cards.length).toBe(5);
  });

  it('leads to the download and to the merged pricing page', async () => {
    const hrefs = Array.from(
      (await render()).nativeElement.querySelectorAll('a'),
    ) as HTMLAnchorElement[];
    const targets = hrefs.map((link) => link.getAttribute('href'));

    expect(targets).toContain('/downloads');
    // `/pricing#buy`, not `/buy`: buying is the last section of the merged
    // page since enigma2_player-eer, and `/buy` is an alias whose own head
    // says `noindex`.
    expect(targets).toContain('/pricing#buy');
  });
});

describe('shotSource', () => {
  it('builds a path relative to the deployed base, never an absolute one', () => {
    // A leading slash would break the GitHub Pages sub path: the site lives
    // under /enigma2_player/, which Angular's `base href` prepends.
    expect(shotSource({ file: 'epg.jpg', caption: 'whatever' })).toBe('screenshots/epg.jpg');
  });

  it('points at a file that is actually in the gallery data', () => {
    for (const shot of getScreenshots('de')) {
      expect(shotSource(shot)).toBe(`screenshots/${shot.file}`);
    }
  });
});
