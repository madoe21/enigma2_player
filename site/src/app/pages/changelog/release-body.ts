import { Component, input } from '@angular/core';

import { NoteBlock, NoteLine } from '../../content/release-notes';

/**
 * One line of a release note: its plain, strong and code runs.
 *
 * Its own component because every block shape needs it - a paragraph, a list
 * item, a quote and each table cell - and the alternative is the same four
 * lines of template repeated five times, where the fifth copy is the one that
 * forgets `<code>`.
 */
@Component({
  selector: 'site-note-text',
  template: `@for (span of spans(); track $index) {
    @if (span.strong) {
      <strong>{{ span.text }}</strong>
    } @else if (span.code) {
      <code>{{ span.text }}</code>
    } @else {
      {{ span.text }}
    }
  }`,
})
export class NoteText {
  readonly spans = input.required<NoteLine>();
}

/**
 * A parsed release note, as the markup each block shape calls for.
 *
 * The parser decides what a piece of the note IS (`content/release-notes.ts`),
 * this decides what element it becomes - so the text goes through Angular's
 * interpolation and there is no `innerHTML` in the path from the GitHub API to
 * the page (enigma2_player-ryy).
 *
 * Heading levels: the entry's version is the `<h2>` on the changelog page, so
 * a `###` inside a note is an `<h3>`. Markdown's own level is ignored - the
 * notes use `###` for sections of one release, and honouring the hash count
 * would skip from `h2` to `h4` and break the outline (WCAG 1.3.1).
 */
@Component({
  selector: 'site-release-body',
  imports: [NoteText],
  template: `
    @for (block of blocks(); track $index) {
      @switch (block.kind) {
        @case ('heading') {
          <h3 class="note__heading"><site-note-text [spans]="block.spans" /></h3>
        }
        @case ('list') {
          <ul class="note__list">
            @for (item of block.items; track $index) {
              <li><site-note-text [spans]="item" /></li>
            }
          </ul>
        }
        @case ('quote') {
          <blockquote class="note__quote">
            @for (paragraph of block.paragraphs; track $index) {
              <p><site-note-text [spans]="paragraph" /></p>
            }
          </blockquote>
        }
        @case ('table') {
          <!--
            The wrapper scrolls instead of the page: a three-column table of
            file names does not fit 320 px (= 400 % zoom, WCAG 1.4.10), and
            the tabindex is what lets a keyboard reach the scroll it creates.
          -->
          <div class="note__table-wrap" tabindex="0">
            <table class="note__table">
              @if (block.head.length > 0) {
                <thead>
                  <tr>
                    @for (cell of block.head; track $index) {
                      <th scope="col"><site-note-text [spans]="cell" /></th>
                    }
                  </tr>
                </thead>
              }
              <tbody>
                @for (row of block.rows; track $index) {
                  <tr>
                    @for (cell of row; track $index) {
                      <td><site-note-text [spans]="cell" /></td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
        @default {
          <p><site-note-text [spans]="block.spans" /></p>
        }
      }
    }
  `,
  styleUrl: './release-body.css',
})
export class ReleaseBody {
  readonly blocks = input.required<readonly NoteBlock[]>();
}
