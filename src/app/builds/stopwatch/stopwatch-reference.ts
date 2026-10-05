import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Observable,
  Subject,
  Timestamp,
  interval,
  map,
  merge,
  of,
  scan,
  startWith,
  switchMap,
  timestamp,
} from 'rxjs';
import { INITIAL_STATE, StopwatchFace, StopwatchState } from './stopwatch-face';

type Command = 'toggle' | 'reset';

/** What we need to remember between clicks. Elapsed time is derived from it, not stored. */
interface Timing {
  running: boolean;
  /** Time banked from earlier runs (everything before the last pause). */
  bankedMs: number;
  /** Clock time when the current run started. Only meaningful while running. */
  startedAt: number;
}

const STOPPED: Timing = { running: false, bankedMs: 0, startedAt: 0 };

/** Display resolution is 10 ms, so refreshing faster than that is wasted work. */
const TICK_MS = 10;

/**
 * Reference RxJS stopwatch. The pipeline has two stages:
 *
 *   clicks ──scan──▶ Timing (changes only on clicks)
 *          ──switchMap──▶ StopwatchState (ticks only while running)
 *
 * Splitting it this way keeps the ticker out of the state machine: the ticker
 * never changes any state, it only re-reads the clock.
 */
@Component({
  selector: 'app-stopwatch-reference',
  imports: [StopwatchFace],
  template: `
    <app-stopwatch-face
      [state]="state()"
      (startPause)="startPause$.next()"
      (reset)="reset$.next()"
    />
  `,
})
export class StopwatchReference {
  protected readonly startPause$ = new Subject<void>();
  protected readonly reset$ = new Subject<void>();

  private readonly state$: Observable<StopwatchState> = merge(
    // Turn both buttons into a single stream of commands, so one reducer sees them in order.
    this.startPause$.pipe(map((): Command => 'toggle')),
    this.reset$.pipe(map((): Command => 'reset')),
  ).pipe(
    // Stamp each click with the scheduler's clock (Date.now by default). The reducer
    // stays pure: it reads the time from its input instead of calling Date.now() itself.
    timestamp(),

    // Stage 1: fold clicks into Timing. Like Array.reduce, but emits every
    // intermediate result.
    scan(applyCommand, STOPPED),

    // Stage 2: map each Timing to a stream of displayed states. switchMap unsubscribes
    // from the previous inner stream whenever a new Timing arrives. That is what makes
    // pause and reset stop the interval: no explicit stop logic needed.
    switchMap((timing) =>
      timing.running
        ? interval(TICK_MS).pipe(
            // Emit right away so Start/Resume updates the label without waiting a tick.
            startWith(0),
            // Re-read the clock on every tick instead of counting ticks. Timers drift and
            // get throttled in background tabs; the clock doesn't. Counting ticks would
            // make the watch run slow (this is the "stretch" test in the spec).
            map(() => ({
              running: true,
              elapsedMs: timing.bankedMs + Date.now() - timing.startedAt,
            })),
          )
        : of({ running: false, elapsedMs: timing.bankedMs }),
    ),
  );

  // toSignal subscribes immediately and unsubscribes when the component is destroyed,
  // which tears down the whole chain, including any running interval. No
  // takeUntilDestroyed or ngOnDestroy needed.
  protected readonly state = toSignal(this.state$, { initialValue: INITIAL_STATE });
}

function applyCommand(
  timing: Timing,
  { value: command, timestamp: now }: Timestamp<Command>,
): Timing {
  if (command === 'reset') {
    return STOPPED;
  }
  return timing.running
    ? // Pause: bank the time from the run that just ended.
      { running: false, bankedMs: timing.bankedMs + now - timing.startedAt, startedAt: 0 }
    : // Start/resume: keep the bank, start a new run.
      { running: true, bankedMs: timing.bankedMs, startedAt: now };
}
