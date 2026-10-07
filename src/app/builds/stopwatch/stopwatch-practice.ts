import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Observable,
  Subject,
  of,
  tap,
  scan,
  map,
  startWith,
  switchMap,
  mergeMap,
  interval,
  merge,
} from 'rxjs';
import { INITIAL_STATE, StopwatchFace, StopwatchState } from './stopwatch-face';

interface Timing {
  running: boolean;
  startTimeMs: number;
  bankedMs: number;
}
const STOPPED_STATE: Timing = { running: false, startTimeMs: 0, bankedMs: 0 };

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

  private readonly state$: Observable<StopwatchState> = merge(
    this.startPause$.pipe(map(() => 'startPause' as const)),
    this.reset$.pipe(map(() => 'reset' as const)),
  ).pipe(
    scan((acc, command) => {
      if (command === 'reset') {
        // RESET
        return STOPPED_STATE;
      }

      // default branch is startPaus
      if (acc.running) {
        // PAUSE
        // stop the timer and calculate the elapsed time -
        // which the incrementally banked time + total already-accumulated time
        return {
          ...acc,
          running: false,
          bankedMs: acc.bankedMs + (Date.now() - acc.startTimeMs),
        };
      } else {
        // START
        // start the timer, setting the start time to now
        return { ...acc, running: true, startTimeMs: Date.now() };
      }
    }, STOPPED_STATE),
    switchMap((timing) =>
      timing.running
        ? interval(10).pipe(
            map(() => ({
              running: true,
              elapsedMs: timing.bankedMs + Date.now() - timing.startTimeMs,
            })),
            startWith({ running: true, elapsedMs: timing.bankedMs }),
          )
        : of({ running: false, elapsedMs: timing.bankedMs }),
    ),

    // tap((state) => console.log('state$ emitted', state)),
  );

  protected readonly state = toSignal(this.state$, { initialValue: INITIAL_STATE });
}
