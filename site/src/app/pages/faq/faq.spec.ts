import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { Faq } from './faq';
import { getFaq } from '../../content/content';
import { routeStub } from '../page-route.stub';

/**
 * The FAQ page: one disclosure per question.
 *
 * What these tests guard is the property the PO asked for and the one the
 * rewrite could silently lose: the answers are collapsed, and they are still
 * THERE (enigma2_player-a23). A scripted accordion that renders the answer
 * only once opened looks identical on screen and is invisible to a crawler,
 * to find-in-page, and to a visitor with JavaScript off.
 *
 * Clicking is not tested here - jsdom does not implement the open/close
 * behaviour of `<details>`, and that behaviour is the browser's anyway. The
 * keyboard and the toggle are covered against a real engine in
 * `e2e/faq.spec.ts`.
 */
describe('Faq', () => {
  async function render(lang = 'de'): Promise<ComponentFixture<Faq>> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Faq],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: routeStub({ lang }) }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Faq);
    await fixture.whenStable();
    return fixture;
  }

  function element(fixture: ComponentFixture<Faq>): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('gives every question its own disclosure', async () => {
    const fixture = await render();
    const host = element(fixture);

    const items = getFaq('de');
    expect(items.length).toBeGreaterThan(3);
    expect(host.querySelectorAll('details.faq__item').length).toBe(items.length);
    expect(host.querySelectorAll('summary').length).toBe(items.length);
  });

  it('starts with every answer collapsed', async () => {
    const fixture = await render();

    // The point of the change: the page is a list of questions, not a wall of
    // answers. Nothing is pre-opened, so nothing is special.
    expect(element(fixture).querySelectorAll('details[open]').length).toBe(0);
  });

  it('keeps the answer in the markup while it is collapsed', async () => {
    const fixture = await render();
    const host = element(fixture);

    for (const item of getFaq('de')) {
      expect(host.textContent, item.q).toContain(item.a);
    }
  });

  it('exposes each question as a heading inside its control', async () => {
    const fixture = await render();
    const host = element(fixture);

    // One h1 for the page, one h2 per question, nothing deeper: the heading
    // list is the list of questions (WCAG 1.3.1, 2.4.6).
    expect(host.querySelectorAll('h1').length).toBe(1);
    const headings = host.querySelectorAll('summary > h2');
    expect(headings.length).toBe(getFaq('de').length);
    expect(host.querySelectorAll('h3,h4,h5,h6').length).toBe(0);
    expect(headings[0].textContent?.trim()).toBe(getFaq('de')[0].q);
  });

  it('leaves the state to the element rather than to our own attributes', async () => {
    const fixture = await render();

    // `aria-expanded` or `role="button"` on a `<summary>` fights the mapping
    // the browser already provides, and a hand-managed attribute is the one
    // that drifts out of sync with the real state.
    for (const summary of Array.from(element(fixture).querySelectorAll('summary'))) {
      expect(summary.hasAttribute('aria-expanded')).toBe(false);
      expect(summary.hasAttribute('role')).toBe(false);
      expect(summary.hasAttribute('tabindex')).toBe(false);
    }
  });

  it('asks the questions in the language of the page', async () => {
    const fixture = await render('it');
    const host = element(fixture);

    const italian = getFaq('it');
    expect(host.textContent).toContain(italian[0].q);
    expect(host.textContent).not.toContain(getFaq('de')[0].q);
  });
});
