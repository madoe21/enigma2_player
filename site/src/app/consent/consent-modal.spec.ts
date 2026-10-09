import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageLanguage } from '../i18n/page-language';
import { ConsentModal } from './consent-modal';
import { CONSENT_COOKIE, ConsentStore } from './consent-store';

describe('ConsentModal', () => {
  let fixture: ComponentFixture<ConsentModal>;
  let store: ConsentStore;
  let announced: string[];

  function clearCookie(): void {
    document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=${new URL(document.baseURI).pathname}`;
  }

  beforeEach(async () => {
    clearCookie();
    announced = [];
    await TestBed.configureTestingModule({
      imports: [ConsentModal],
      providers: [
        {
          provide: LiveAnnouncer,
          useValue: { announce: (message: string) => void announced.push(message) },
        },
      ],
    }).compileComponents();

    store = TestBed.inject(ConsentStore);
    fixture = TestBed.createComponent(ConsentModal);
    await fixture.whenStable();
  });

  afterEach(clearCookie);

  function dialog(): HTMLElement | null {
    return fixture.nativeElement.querySelector('[role="dialog"]');
  }

  function button(label: string): HTMLButtonElement {
    const element = fixture.nativeElement as HTMLElement;
    const found = Array.from(element.querySelectorAll('button')).find(
      (candidate) => candidate.textContent?.trim() === label,
    );
    if (!found) {
      throw new Error(`no button labelled "${label}"`);
    }
    return found;
  }

  it('asks on a first visit', () => {
    expect(dialog()).not.toBeNull();
    expect(dialog()?.textContent).toContain('ein einziges Cookie');
  });

  it('is a dialog a screen reader can make sense of', () => {
    const element = dialog();

    // Each of these is load-bearing: without aria-modal NVDA keeps reading the
    // page behind, and without the two references the dialog announces itself
    // as an unnamed group.
    expect(element?.getAttribute('aria-modal')).toBe('true');
    const titleId = element?.getAttribute('aria-labelledby');
    const bodyId = element?.getAttribute('aria-describedby');
    expect(fixture.nativeElement.querySelector(`#${titleId}`)?.textContent).toContain('Cookies');
    expect(fixture.nativeElement.querySelector(`#${bodyId}`)?.textContent).toBeTruthy();
  });

  it('announces itself, so it is not a silent change of context', () => {
    expect(announced.join(' ')).toContain('Cookies');
  });

  it('offers both answers as real buttons, and nothing else', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');

    // Two, because there is one cookie category: accept, or do not use the
    // site. A third control would imply a choice that does not exist.
    expect(buttons.length).toBe(2);
    expect(button('Einverstanden').tagName).toBe('BUTTON');
    expect(button('Ablehnen').tagName).toBe('BUTTON');
  });

  it('has no way to close without answering', () => {
    // No close button and no Escape: dismissing would leave the visitor in the
    // undecided state this dialog exists to resolve, and it would be back on
    // the next page view.
    dialog()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(dialog()).not.toBeNull();
    expect(store.decided()).toBe(false);
  });

  it('closes and stays closed once accepted', async () => {
    button('Einverstanden').click();
    await fixture.whenStable();

    expect(dialog()).toBeNull();
    expect(store.accepted()).toBe(true);
  });

  it('closes on a refusal too - refusing is an answer', async () => {
    button('Ablehnen').click();
    await fixture.whenStable();

    expect(dialog()).toBeNull();
    expect(store.rejected()).toBe(true);
  });

  it('asks in the language of the page', async () => {
    TestBed.inject(PageLanguage).set('fr');
    await fixture.whenStable();

    expect(dialog()?.textContent).toContain('un seul cookie');
  });
});
