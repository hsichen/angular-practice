import { Component } from '@angular/core';
import { StopwatchPractice } from './stopwatch-practice';
import { StopwatchReference } from './stopwatch-reference';

/** Route page: the finished reference and the practice copy, side by side. */
@Component({
  selector: 'app-stopwatch',
  imports: [StopwatchReference, StopwatchPractice],
  template: `
    <h1>Stopwatch</h1>
    <p class="lede">
      Same UI, two RxJS pipelines. Wire up yours in <code>stopwatch-practice.ts</code>; the finished
      version is in <code>stopwatch-reference.ts</code>. Both run the same spec.
    </p>

    <div class="versions">
      <section aria-labelledby="stopwatch-reference-heading">
        <h2 id="stopwatch-reference-heading">Reference</h2>
        <app-stopwatch-reference />
      </section>
      <section aria-labelledby="stopwatch-practice-heading">
        <h2 id="stopwatch-practice-heading">Your turn</h2>
        <app-stopwatch-practice />
      </section>
    </div>
  `,
  styles: `
    .lede {
      color: var(--text-muted);
    }

    .versions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
      gap: 1.5rem;
    }

    h2 {
      margin: 0 0 0.5rem;
      font: var(--mat-sys-title-large);
    }
  `,
})
export class Stopwatch {}
