import { A11yModule, LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, computed, inject, signal } from '@angular/core';

import { PageBase } from '../page-base';
import { getScreenshots, shotSource } from '../../content/content';

/**
 * The gallery, with a lightbox that is operable by keyboard.
 *
 * The Astro version hand-rolled the lightbox in a plain script: id lookups,
 * no focus management, and nothing that returned focus to the thumbnail the
 * visitor came from. Here it is Angular's own accessibility (PO, 2026-10-09):
 * `cdkTrapFocus` with auto-capture keeps the keyboard inside the overlay and
 * puts it back afterwards, [LiveAnnouncer] says which image is open, and
 * Escape, Arrow-Left and Arrow-Right do what they do everywhere else.
 *
 * Escape closes here, unlike in the cookie dialog, and the difference is the
 * point: this overlay is a convenience the visitor opened, not a question that
 * has to be answered.
 */
@Component({
  selector: 'site-screenshots',
  imports: [A11yModule],
  template: `
    <main class="page">
      <h1>{{ copy().title }}</h1>
      <p>{{ copy().note }}</p>

      <div class="shot-grid">
        @for (shot of shots(); track shot.file; let i = $index) {
          <figure class="shot">
            <button type="button" class="shot__button" (click)="open(i)">
              <img
                class="shot__image"
                [src]="source(shot)"
                [alt]="shot.caption"
                width="1200"
                height="675"
                loading="lazy"
              />
            </button>
            <figcaption>{{ shot.caption }}</figcaption>
          </figure>
        }
      </div>

      @if (openIndex() !== null) {
        <div
          class="lightbox"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="current()!.caption"
          cdkTrapFocus
          [cdkTrapFocusAutoCapture]="true"
          (keydown.escape)="close()"
          (keydown.arrowleft)="step(-1)"
          (keydown.arrowright)="step(1)"
        >
          <button
            type="button"
            class="lightbox__control"
            (click)="close()"
            [attr.aria-label]="copy().close"
          >
            ✕
          </button>
          <button
            type="button"
            class="lightbox__control"
            (click)="step(-1)"
            [attr.aria-label]="copy().previous"
          >
            ‹
          </button>
          <figure class="lightbox__figure">
            <img [src]="source(current()!)" [alt]="current()!.caption" />
            <figcaption>{{ current()!.caption }}</figcaption>
          </figure>
          <button
            type="button"
            class="lightbox__control"
            (click)="step(1)"
            [attr.aria-label]="copy().next"
          >
            ›
          </button>
        </div>
      }
    </main>
  `,
  styleUrls: ['../page.css', './screenshots.css'],
})
export class Screenshots extends PageBase {
  private readonly announcer = inject(LiveAnnouncer);

  protected readonly shots = computed(() => getScreenshots(this.lang()));

  protected readonly openIndex = signal<number | null>(null);

  protected readonly current = computed(() => {
    const index = this.openIndex();
    return index === null ? null : (this.shots()[index] ?? null);
  });

  protected readonly copy = this.translate.group({
    title: 'nav.screenshots',
    note: 'screenshots.note',
    close: 'gallery.close',
    previous: 'gallery.previous',
    next: 'gallery.next',
  });

  /** The shared path builder, reachable from the template. */
  protected readonly source = shotSource;

  protected open(index: number): void {
    this.openIndex.set(index);
    this.announce();
  }

  protected close(): void {
    this.openIndex.set(null);
  }

  /** Next or previous, wrapping - a gallery that dead-ends at the last image
   * makes the visitor walk back through all of them. */
  protected step(by: number): void {
    const count = this.shots().length;
    const index = this.openIndex();
    if (index === null || count === 0) {
      return;
    }
    this.openIndex.set((index + by + count) % count);
    this.announce();
  }

  private announce(): void {
    const shot = this.current();
    if (shot) {
      this.announcer.announce(shot.caption, 'polite');
    }
  }
}
