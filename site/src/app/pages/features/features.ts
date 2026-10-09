import { Component, computed } from '@angular/core';

import { PageBase } from '../page-base';
import { getFeatures } from '../../content/content';

/**
 * The feature list, one card per feature.
 *
 * The content comes from `content.ts` unchanged - the same records the Astro
 * site rendered (enigma2_player-n5j). No sentence lives in this template,
 * which is the rule for every page here: a component holding its own German
 * text would have to be copied to say it in English.
 */
@Component({
  selector: 'site-features',
  template: `
    <main class="page">
      <h1>{{ title() }}</h1>
      <div class="card-grid">
        @for (feature of features(); track feature.title) {
          <article class="card">
            <h2>{{ feature.title }}</h2>
            <p>{{ feature.desc }}</p>
          </article>
        }
      </div>
    </main>
  `,
  styleUrl: '../page.css',
})
export class Features extends PageBase {
  protected readonly title = this.translate.t('nav.features');
  protected readonly features = computed(() => getFeatures(this.lang()));
}
