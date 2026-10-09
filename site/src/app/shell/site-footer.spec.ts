import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CONSENT_COOKIE, ConsentStore } from '../consent/consent-store';
import { SiteFooter } from './site-footer';

describe('SiteFooter', () => {
  let fixture: ComponentFixture<SiteFooter>;
  let store: ConsentStore;
  let announced: string[];

  function clearCookie(): void {
    document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=${new URL(document.baseURI).pathname}`;
  }

  beforeEach(async () => {
    clearCookie();
    announced = [];
    await TestBed.configureTestingModule({
      imports: [SiteFooter],
      providers: [
        {
          provide: LiveAnnouncer,
          useValue: { announce: (message: string) => void announced.push(message) },
        },
      ],
    }).compileComponents();

    store = TestBed.inject(ConsentStore);
    fixture = TestBed.createComponent(SiteFooter);
    await fixture.whenStable();
  });

  afterEach(clearCookie);

  it('offers the way back out, in the place people look for it', () => {
    const control = fixture.nativeElement.querySelector('footer button');

    expect(control).not.toBeNull();
    expect(control.textContent).toContain('Cookie-Entscheidung');
  });

  it('withdraws the decision, so the question comes back', async () => {
    store.accept();
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('footer button') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(store.decided()).toBe(false);
  });

  it('says out loud that it happened', async () => {
    store.accept();
    (fixture.nativeElement.querySelector('footer button') as HTMLButtonElement).click();
    await fixture.whenStable();

    // The visible consequence is a dialog reappearing above the fold. Someone
    // using a screen reader pressed a button in the footer and has to be told,
    // not left to find out.
    expect(announced.join(' ')).toContain('zurückgenommen');
  });
});
