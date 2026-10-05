import { Component, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, Subject, of } from 'rxjs';
import { COMBOS } from './key-combos';
import { INITIAL_KEY_STATE, KeySequenceFace, KeySequenceState } from './key-sequence-face';

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

  // TODO: replace `of(INITIAL_KEY_STATE)` with a stream built from keydown$ and combo.
  private readonly state$: Observable<KeySequenceState> = of(INITIAL_KEY_STATE);

  protected readonly state = toSignal(this.state$, { initialValue: INITIAL_KEY_STATE });
}
