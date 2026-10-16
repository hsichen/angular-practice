import { Component, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, Subject, filter, map, of, scan, startWith, switchMap, timer } from 'rxjs';
import { COMBOS, keyName } from './key-combos';
import {
  INITIAL_KEY_STATE,
  KeySequenceFace,
  KeySequenceState,
  SUCCESS_MS,
} from './key-sequence-face';

/**
 * Build exercise: RxJS key-sequence detector — your copy.
 *
 * The UI is finished. Every keydown in the focused test zone arrives on `keydown$`,
 * and the selected combination is the `combo` signal (the radio group writes it).
 * Your job is `state$`. key-sequence.spec.ts checks these requirements; run just
 * your copy with `npx ng test --filter="KeySequence.*practice"`.
 *
 *  1. Starts with progress 0 and no success.
 *  2. Each correct next key advances progress by one. A wrong key silently resets it to 0.
 *  3. Completing the combo sets `success`, and progress goes back to 0.
 *     `success` clears after SUCCESS_MS.
 *  4. Holding a key down auto-repeats keydown; repeats don't count as presses.
 *  5. Letters match regardless of case. Compare keys using `keyName()` from key-combos.ts.
 *  6. Selecting a different combination resets progress and matches the new one.
 *  7. No leaks: all timers stop when the component is destroyed.
 *
 * Feel free to reshape anything below the inputs; the template only needs `state()`.
 *
 * Stretch: set `stretch: true` for the practice row in the spec. Typing ↑ ↑ ↑ ↓ ↓ ← → ← → B A
 * should still count as the Konami code. Then try chords (e.g. Ctrl+K Ctrl+S).
 * key-sequence-reference.ts has a finished version — try yours first.
 *
 * Done (core + overlap stretch). Compared with key-sequence-reference.ts afterwards:
 *  - Shape: one stream here (scan → switchMap(timer)). The reference runs scan → share(),
 *    splits it into progress$ and success$, and recombines them with combineLatest.
 *  - A key while "Matched!" shows: here it clears success at once (a deliberate choice).
 *    The reference keeps success up for the full SUCCESS_MS, because success$ only listens
 *    to completions. The split is what makes that cheap: in one stream you'd carry success
 *    through the reducer, and every key in the window would restart the timer.
 *  - share(): not needed here, since each stage has one subscriber. The reference needs it,
 *    or its two subscribers would each run their own scan.
 *  - Intermediate states: none here, one complete state per key. The reference's
 *    combineLatest emits twice on a completing key ({0, false}, then {0, true}). That's
 *    harmless, because both are synchronous and the signal keeps only the last.
 *  - Matcher: the same rule (longest tail of matched keys + new key that starts the combo).
 *    Here a while + shift returns a number and the caller checks for completion; the
 *    reference loops over start indexes and returns { progress, completed }.
 */
@Component({
  selector: 'app-key-sequence-practice',
  imports: [KeySequenceFace],
  template: `
    <app-key-sequence-face [state]="state()" [(combo)]="combo" (keyPress)="keydown$.next($event)" />
  `,
})
export class KeySequencePractice {
  protected readonly combo = signal(COMBOS[0]);
  protected readonly keydown$ = new Subject<KeyboardEvent>();

  private readonly state$: Observable<KeySequenceState> = toObservable(this.combo).pipe(
    switchMap((combo) =>
      this.keydown$.pipe(
        filter((event) => !event.repeat),
        map(keyName),
        scan(({ progress }, key) => {
          const next = nextProgress(combo.keys, progress, key);
          return next === combo.keys.length
            ? { progress: 0, success: true } // completed the combo
            : { progress: next, success: false };
        }, INITIAL_KEY_STATE),
        // On a match: show success now, clear it after SUCCESS_MS. Any later key cancels the
        // pending timer, because switchMap drops the previous inner stream.
        switchMap((state) =>
          state.success
            ? timer(SUCCESS_MS).pipe(
                map(() => INITIAL_KEY_STATE),
                startWith(state),
              )
            : of(state),
        ),
        // Each combo gets a fresh inner pipe; emit a reset as soon as it starts.
        startWith(INITIAL_KEY_STATE),
      ),
    ),
  );

  protected readonly state = toSignal(this.state$, { initialValue: INITIAL_KEY_STATE });
}

function nextProgress(keys: readonly string[], progress: number, key: string): number {
  const typed = [...keys.slice(0, progress), key]; // the tail you know was typed
  // Find the longest tail of `typed` that is also a start of the combo, by dropping keys
  // from the front until it matches. A full match returns keys.length, which the caller
  // treats as completion; no match returns 0.
  // Compare key by key: joined strings would let 'F1' match the start of 'F10'.
  while (typed.length > 0 && !typed.every((k, i) => k === keys[i])) {
    typed.shift();
  }
  return typed.length;
}
