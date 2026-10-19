import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangFlag } from './lang-flag';
import { Lang, locales } from '../i18n/locales';

/**
 * The switcher's flags.
 *
 * Three properties are worth a test here, and all three are things the change
 * could silently lose (enigma2_player-13h): every language has a flag, the
 * flags are drawn and not fetched, and none of them says anything to a screen
 * reader - the name does that.
 */
describe('LangFlag', () => {
  async function render(lang: Lang): Promise<ComponentFixture<LangFlag>> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [LangFlag] }).compileComponents();
    const fixture = TestBed.createComponent(LangFlag);
    fixture.componentRef.setInput('lang', lang);
    await fixture.whenStable();
    return fixture;
  }

  function host(fixture: ComponentFixture<LangFlag>): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('draws a flag for every language the site publishes', async () => {
    for (const lang of locales) {
      const fixture = await render(lang);
      const svg = host(fixture).querySelector('svg');

      expect(svg, lang).not.toBeNull();
      // Two shapes at the very least - an empty `<svg>` would pass "has an
      // svg" and show nothing.
      expect(svg?.querySelectorAll('rect, path').length ?? 0, lang).toBeGreaterThan(1);
    }
  });

  it('puts the shapes in the SVG namespace', async () => {
    const fixture = await render('de');

    // The trap this guards: control flow inside an `<svg>` can hand the
    // shapes the HTML namespace, and an HTML `<rect>` is a valid element that
    // draws absolutely nothing. Nothing on the screen, nothing in a snapshot.
    for (const shape of Array.from(host(fixture).querySelectorAll('rect, path'))) {
      expect(shape.namespaceURI).toBe('http://www.w3.org/2000/svg');
    }
  });

  it('gives each language a flag of its own', async () => {
    const drawings = new Map<Lang, string>();
    for (const lang of locales) {
      const fixture = await render(lang);
      drawings.set(lang, host(fixture).querySelector('svg')?.innerHTML.trim() ?? '');
    }

    // Five flags, not one flag five times: the `@switch` falling through to a
    // single case is the failure that looks fine until you read the colours.
    expect(new Set(drawings.values()).size).toBe(locales.length);
  });

  it('says nothing to a screen reader', async () => {
    for (const lang of locales) {
      const fixture = await render(lang);
      const svg = host(fixture).querySelector('svg');

      // The flag is decoration; the language's own name is the accessible
      // name of the switcher entry. An unlabelled graphic here is exactly the
      // "image" NVDA must not read out.
      expect(svg?.getAttribute('aria-hidden'), lang).toBe('true');
      expect(svg?.getAttribute('focusable'), lang).toBe('false');
      expect(svg?.querySelectorAll('title, desc, text').length ?? 0, lang).toBe(0);
    }
  });

  it('fetches nothing', async () => {
    for (const lang of locales) {
      const fixture = await render(lang);
      const svg = host(fixture).querySelector('svg');

      // No `<image>`, no `<use>` pointing at a sprite, no CSS url(): a flag
      // that needs a request is a request made before anyone consented to
      // anything.
      expect(svg?.querySelectorAll('image, use').length ?? 0, lang).toBe(0);
      expect(svg?.outerHTML ?? '', lang).not.toMatch(/url\(|https?:|xlink:href/);
    }
  });
});
