import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Lang, defaultLang, langFromSegment } from '../../i18n/locales';
import { PageLanguage } from '../../i18n/page-language';

/**
 * The landing page, and for now the proof that the mechanism works.
 *
 * Standalone, like everything here: no NgModule, dependencies are imported on
 * the component and provided by `bootstrapApplication` (PO, 2026-10-09).
 *
 * The text comes from a per-language record rather than from `$localize`. That
 * is a decision with a reason, recorded in enigma2_player_source-bdb: the site
 * it replaces already keeps its content as a typed structure per language, so
 * this is a move rather than a conversion, and it builds once instead of five
 * times. Angular's own i18n would mean one build per language and every string
 * through XLIFF, which buys smaller bundles for a site whose text is its
 * entire payload.
 */
@Component({
  selector: 'site-landing',
  template: `
    <main>
      <h1>{{ copy().headline }}</h1>
      <p>{{ copy().intro }}</p>
    </main>
  `,
})
export class Landing {
  private readonly route = inject(ActivatedRoute);
  private readonly pageLanguage = inject(PageLanguage);

  /**
   * The language this route was declared for.
   *
   * From the route's own data rather than guessed from the URL: the route tree
   * knows which language it built, and guessing is what served `/fr` as German
   * on the old site (enigma2_player_source-w83).
   */
  readonly lang = computed<Lang>(() =>
    langFromSegment(this.route.snapshot.data['lang'] ?? defaultLang),
  );

  readonly copy = computed(() => COPY[this.lang()]);

  constructor() {
    this.pageLanguage.set(this.lang());
  }
}

interface LandingCopy {
  headline: string;
  intro: string;
}

/**
 * Placeholder text in all five languages.
 *
 * The real content moves over in enigma2_player_source-n5j, out of
 * `src/i18n/content.ts` of the Astro site. Five entries rather than one with a
 * fallback, so a missing language fails to compile instead of silently
 * rendering German - the way `/fr` used to.
 */
const COPY: Record<Lang, LandingCopy> = {
  de: {
    headline: 'Enigma2 Player',
    intro: 'Fernsehen, Radio und Aufnahmen von deinem Enigma2-Receiver.',
  },
  en: {
    headline: 'Enigma2 Player',
    intro: 'Live TV, radio and recordings from your Enigma2 receiver.',
  },
  es: {
    headline: 'Enigma2 Player',
    intro: 'Televisión, radio y grabaciones de tu receptor Enigma2.',
  },
  fr: {
    headline: 'Enigma2 Player',
    intro: 'Télévision, radio et enregistrements de votre récepteur Enigma2.',
  },
  it: {
    headline: 'Enigma2 Player',
    intro: 'TV, radio e registrazioni dal tuo ricevitore Enigma2.',
  },
};
