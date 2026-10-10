import { Component } from '@angular/core';

import { PageBase } from '../page-base';

/**
 * How to reach us, with the links the Astro page had.
 *
 * The e-mail address is still the placeholder the old page carried
 * (`support@enigma2player.app`) - it is not a real mailbox yet, and that is
 * tracked where it belongs rather than invented here: the reporting channel
 * and the monitored mailbox hang on the company existing
 * (`enigma2_player_source-dnh`, `license_server-xwl0.3`). The imprint carries
 * the same open question as an unfilled identity value, so both say the same
 * thing - and the placeholder check lists it.
 */
@Component({
  selector: 'site-contact',
  template: `
    <main class="page">
      <h1>{{ copy().title }}</h1>
      <p>{{ copy().intro }}</p>
      <!--
        The link-list class gives each link a 44px row. Plain list items put
        them about 20px apart, which fails WCAG 2.2 target size (2.5.8) -
        three links that close together is a coin toss on a touchscreen.
      -->
      <ul class="link-list">
        <li>
          <a [href]="profile">{{ copy().github }}</a>
        </li>
        <li>
          <a [href]="issues">{{ copy().issues }}</a>
        </li>
        <li>
          <a [href]="'mailto:' + email">{{ copy().email }}: {{ email }}</a>
        </li>
      </ul>
      <p>{{ copy().buy }}</p>
    </main>
  `,
  styleUrl: '../page.css',
})
export class Contact extends PageBase {
  protected readonly profile = 'https://github.com/madoe21';
  protected readonly issues = 'https://github.com/madoe21/enigma2_player/issues';
  protected readonly email = 'support@enigma2player.app';

  protected readonly copy = this.translate.group({
    title: 'nav.contact',
    intro: 'contact.intro',
    github: 'contact.github',
    issues: 'contact.issues',
    email: 'contact.email',
    buy: 'contact.buy',
  });
}
