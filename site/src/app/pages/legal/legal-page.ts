import { Component, computed, input } from '@angular/core';

import { LegalLang, LEGAL_COPY, LegalPage, isLegalLang } from '../../legal/legal-copy';
import { PageBase } from '../page-base';

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
 * A section's labelled facts (purpose, legal basis, retention) are a `<dl>` for
 * the same reason: they are term/definition pairs, and promoting each of them
 * to a heading would bury the section list they belong to in sixty entries.
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
          @if (section.entries) {
            <dl class="legal__facts">
              @for (entry of section.entries; track entry.term) {
                <dt>{{ entry.term }}</dt>
                <dd>{{ entry.detail }}</dd>
              }
            </dl>
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
export class LegalPageComponent extends PageBase {
  /** Which text to show. Set by the route, not by a parent component. */
  readonly which = input.required<LegalPageId>();

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

  /** "Impressum", "Privacy policy" - the text's own title, from its own copy. */
  protected override titleText(): string {
    return this.page().title;
  }
}
