import { Component } from '@angular/core';

/**
 * Two-column layout for build exercises: the finished reference next to the user's copy.
 *
 *   <app-side-by-side>
 *     <app-foo-reference reference />
 *     <app-foo-practice practice />
 *   </app-side-by-side>
 */
@Component({
  selector: 'app-side-by-side',
  template: `
    <section aria-labelledby="side-by-side-reference">
      <h2 id="side-by-side-reference">Reference</h2>
      <ng-content select="[reference]" />
    </section>
    <section aria-labelledby="side-by-side-practice">
      <h2 id="side-by-side-practice">Your turn</h2>
      <ng-content select="[practice]" />
    </section>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
      gap: 1.5rem;
      align-items: start;
    }

    h2 {
      margin: 0 0 0.5rem;
      font: var(--mat-sys-title-large);
    }
  `,
})
export class SideBySide {}
