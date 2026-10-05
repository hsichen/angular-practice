import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, Subject, of } from 'rxjs';
import { INITIAL_STATE, StopwatchFace, StopwatchState } from './stopwatch-face';

/**
 * Build exercise: RxJS stopwatch — your copy.
 *
 * The UI is finished. Your job is `state$`: turn the two button streams into
 * stopwatch state. stopwatch.spec.ts checks these requirements; run just your
 * copy with `npx ng test --filter=practice`.
 *
 *  1. Starts stopped at 00:00.00.
 *  2. Start/Pause toggles running. Resuming continues from the paused time.
 *  3. Reset zeros the time and stops the watch, whether running or paused.
 *  4. While running, the display refreshes often enough to look smooth.
 *  5. No leaks: all timers stop when the component is destroyed.
 *
 * Feel free to reshape anything below the subjects; the template only needs `state()`.
 *
 * Stretch: set `stretch: true` for the practice row in the spec, then add laps.
 * stopwatch-reference.ts has a finished version — try yours first.
 */
@Component({
  selector: 'app-stopwatch-practice',
  imports: [StopwatchFace],
  template: `
    <app-stopwatch-face
      [state]="state()"
      (startPause)="startPause$.next()"
      (reset)="reset$.next()"
    />
  `,
})
export class StopwatchPractice {
  protected readonly startPause$ = new Subject<void>();
  protected readonly reset$ = new Subject<void>();

  // TODO: replace `of(INITIAL_STATE)` with a stream built from startPause$ and reset$.
  private readonly state$: Observable<StopwatchState> = of(INITIAL_STATE);

  protected readonly state = toSignal(this.state$, { initialValue: INITIAL_STATE });
}
