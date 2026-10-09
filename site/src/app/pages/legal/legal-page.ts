import { Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LegalLang, LEGAL_COPY, LegalPage, isLegalLang } from '../../legal/legal-copy';
import { PageLanguage } from '../../i18n/page-language';
import { Lang, defaultLang, langFromSegment } from '../../i18n/locales';

/** Which of the three texts a route wants. */
export type LegalPageId = 'imprint' | 'privacy' | 'cookies';

/**
 * Renders one of the three legal texts.
 *
 * One component for all three rather than three near-identical ones: they
 * differ in their content, not in their structure, and three copies of the
 * same template is three places to fix a heading level.
 *
 * The headings are a real `h1` followed by `h2`s with nothing skipped, because
 * a screen reader user navigates a long legal text by its heading list - a
 * page of `<p><strong>` would be one flat wall of text (WCAG 1.3.1, 2.4.6).
 */
@Component({
  selector: 'site-legal-page',
  template: `
    <main class="legal">
      <h1>{{ page().title }}</h1>
      @if (page().lead) {
        <p class="legal__lead">{{ page().lead }}</p>
      }
      @for (section of page().sections; track section.heading) {
        <section class="legal__section">
          <h2>{{ section.heading }}</h2>
          @for (line of section.lines; track line) {
            <p>{{ line }}</p>
          }
        </section>
      }
      @if (showsLanguageNote()) {
        <p class="legal__note">{{ copy().languageNote }}</p>
      }
    </main>
  `,
  styleUrl: './legal-page.css',
})
export class LegalPageComponent {
  /** Which text to show. Set by the route, not by a parent component. */
  readonly which = input.required<LegalPageId>();

  private readonly route = inject(ActivatedRoute);
  private readonly pageLanguage = inject(PageLanguage);

  /** The language the route was declared for - never guessed from the URL. */
  readonly lang = computed<Lang>(() =>
    langFromSegment(this.route.snapshot.data['lang'] ?? defaultLang),
  );

  /**
   * Whether a legal text exists in this page's language.
   *
   * Only German and English do, deliberately: an unchecked machine translation
   * of a privacy policy states facts about data processing that nobody here
   * can verify (see `legal-copy.ts`).
   */
  readonly hasOwnLanguage = computed(() => isLegalLang(this.lang()));

  /**
   * Whether to print which version is binding.
   *
   * On every page except the German one - not only on the fallback languages.
   * "The German version is the binding one" is a statement about this text's
   * legal weight, and an English reader needs it as much as a French one; a
   * German reader is already reading the binding version.
   */
  readonly showsLanguageNote = computed(() => this.lang() !== 'de');

  protected readonly copy = computed(() => LEGAL_COPY[this.legalLang()]);

  protected readonly page = computed<LegalPage>(() => this.copy()[this.which()]);

  private legalLang(): LegalLang {
    const lang = this.lang();
    return isLegalLang(lang) ? lang : 'en';
  }

  constructor() {
    this.pageLanguage.set(this.lang());
  }
}
