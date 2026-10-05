import { Component } from '@angular/core';
import { SideBySide } from '../../shared/side-by-side';
import { StopwatchPractice } from './stopwatch-practice';
import { StopwatchReference } from './stopwatch-reference';

/** Route page: the finished reference and the practice copy, side by side. */
@Component({
  selector: 'app-stopwatch',
  imports: [SideBySide, StopwatchReference, StopwatchPractice],
  template: `
    <h1>Stopwatch</h1>
    <p class="lede">
      Same UI, two RxJS pipelines. Wire up yours in <code>stopwatch-practice.ts</code>; the finished
      version is in <code>stopwatch-reference.ts</code>. Both run the same spec.
    </p>

    <app-side-by-side>
      <app-stopwatch-reference reference />
      <app-stopwatch-practice practice />
    </app-side-by-side>
  `,
})
export class Stopwatch {}
