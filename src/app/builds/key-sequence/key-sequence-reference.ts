import { Component, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  Observable,
  Subject,
  combineLatest,
  filter,
  map,
  scan,
  share,
  startWith,
  switchMap,
  timer,
} from 'rxjs';
import { COMBOS, keyName } from './key-combos';
import {
  INITIAL_KEY_STATE,
  KeySequenceFace,
  KeySequenceState,
  SUCCESS_MS,
} from './key-sequence-face';

/** Result of feeding one key to the matcher. */
interface Step {
  progress: number;
  completed: boolean;
}

const NO_PROGRESS: Step = { progress: 0, completed: false };

/**
 * Reference RxJS key-sequence detector.
 *
 *   combo (signal) ──toObservable──switchMap──▶ per-combo matcher
 *   keydown$ ──filter repeats──map keyName──scan──share──┬─▶ progress$
 *                                                         └─▶ success$ (true, then false after a delay)
 *                                         combineLatest ──▶ KeySequenceState
 */
@Component({
  selector: 'app-key-sequence-reference',
  imports: [KeySequenceFace],
  template: `
    <app-key-sequence-face [state]="state()" [(combo)]="combo" (keyPress)="keydown$.next($event)" />
  `,
})
export class KeySequenceReference {
  protected readonly combo = signal(COMBOS[0]);
  protected readonly keydown$ = new Subject<KeyboardEvent>();

  // Holding a key fires keydown repeatedly with `repeat: true`. Those aren't new presses.
  private readonly keys$ = this.keydown$.pipe(
    filter((event) => !event.repeat),
    map(keyName),
  );

  private readonly state$: Observable<KeySequenceState> = toObservable(this.combo).pipe(
    // Each combo gets a fresh matcher. switchMap drops the old one (its scan state and any
    // pending success timer), so switching combos resets everything.
    switchMap((combo) => {
      const step$ = this.keys$.pipe(
        scan((step, key) => advance(combo.keys, step.progress, key), NO_PROGRESS),
        // Two subscribers below (progress$ and success$). Without share() each would run its
        // own scan. Here that would happen to give the same answers, but it would be
        // duplicated work and a trap if the reducer ever had side effects.
        share(),
      );

      const progress$ = step$.pipe(
        map((step) => step.progress),
        startWith(0),
      );

      const success$ = step$.pipe(
        filter((step) => step.completed),
        // true now, false after SUCCESS_MS. Another match within that window restarts the
        // countdown, because switchMap cancels the previous timer.
        switchMap(() =>
          timer(SUCCESS_MS).pipe(
            map(() => false),
            startWith(true),
          ),
        ),
        startWith(false),
      );

      return combineLatest({ progress: progress$, success: success$ });
    }),
  );

  // toSignal unsubscribes on destroy, which also cancels a pending success timer.
  protected readonly state = toSignal(this.state$, { initialValue: INITIAL_KEY_STATE });
}

/**
 * Feeds one key into the matcher. A wrong key doesn't always mean starting from zero.
 * Typing ↑ ↑ ↑ for the Konami code breaks the first attempt at the third ↑, but the
 * last two ↑ are a valid start of a new attempt. So find the longest tail of
 * (matched keys + new key) that is also a prefix of the target.
 */
function advance(target: string[], progress: number, key: string): Step {
  const typed = [...target.slice(0, progress), key];
  for (let start = 0; start < typed.length; start++) {
    const tail = typed.slice(start);
    if (tail.every((k, i) => k === target[i])) {
      return tail.length === target.length
        ? { progress: 0, completed: true }
        : { progress: tail.length, completed: false };
    }
  }
  return NO_PROGRESS;
}
