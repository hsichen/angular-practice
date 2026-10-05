import { Component, input, model, output, signal } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { COMBOS, KeyCombo, keyLabel } from './key-combos';

export interface KeySequenceState {
  /** How many keys of the selected combo have been matched so far. */
  progress: number;
  /** True for `SUCCESS_MS` after the full combo is entered. */
  success: boolean;
}

export const INITIAL_KEY_STATE: KeySequenceState = { progress: 0, success: false };

/** How long the success feedback stays up. */
export const SUCCESS_MS = 1500;

/**
 * Presentational key-sequence UI shared by the reference and practice versions. No RxJS here.
 * Emits every keydown in the focused test zone, and two-way binds the selected combo.
 */
@Component({
  selector: 'app-key-sequence-face',
  imports: [MatCard, MatIcon, MatRadioGroup, MatRadioButton],
  template: `
    <mat-card appearance="outlined">
      <div
        class="zone"
        [class.success]="state().success"
        tabindex="0"
        role="group"
        aria-label="Test zone. Focus here and type the sequence."
        data-testid="zone"
        [attr.data-progress]="state().progress"
        [attr.data-success]="state().success"
        (keydown)="onKeydown($event)"
        (focus)="focused.set(true)"
        (blur)="focused.set(false)"
      >
        <ol class="keys" aria-label="Sequence">
          @for (key of combo().keys; track $index) {
            <li [class.matched]="$index < state().progress">
              <kbd>{{ keyLabel(key) }}</kbd>
            </li>
          }
        </ol>
        <p class="status" aria-live="polite">
          @if (state().success) {
            <mat-icon>check_circle</mat-icon> Matched!
          } @else if (focused()) {
            Listening, type the sequence
          } @else {
            Click or Tab here, then type
          }
        </p>
      </div>
    </mat-card>

    <mat-radio-group
      class="combos"
      aria-label="Key combination"
      [value]="combo().id"
      (change)="select($event.value)"
    >
      @for (option of combos; track option.id) {
        <mat-radio-button [value]="option.id" [attr.data-testid]="'combo-' + option.id">
          {{ option.label }}
        </mat-radio-button>
      }
    </mat-radio-group>
  `,
  styles: `
    .zone {
      padding: 1.25rem 1rem;
      border-radius: inherit;
      outline: none;
      cursor: text;
      transition:
        background-color 150ms,
        box-shadow 150ms;

      &:focus {
        background: color-mix(in srgb, var(--mat-sys-primary) 8%, transparent);
        box-shadow: inset 0 0 0 2px var(--mat-sys-primary);
      }

      // After :focus so it wins while the zone is focused, which it always is when matching.
      &.success {
        background: light-dark(#dcf5e1, #1d3b25);
        box-shadow: inset 0 0 0 2px light-dark(#1b6b2f, #8fdc9f);
      }
    }

    .keys {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    kbd {
      display: inline-block;
      min-width: 2.25rem;
      padding: 0.25rem 0.5rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 0.375rem;
      text-align: center;
      font: var(--mat-sys-label-large);
      transition:
        background-color 100ms,
        color 100ms;
    }

    .matched kbd {
      background: var(--mat-sys-primary);
      border-color: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
    }

    .status {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      min-height: 1.5rem;
      margin: 1rem 0 0;
      color: var(--text-muted);
    }

    .success .status {
      color: light-dark(#1b6b2f, #8fdc9f);
      font-weight: 500;
    }

    .combos {
      display: flex;
      flex-direction: column;
      margin-top: 0.75rem;
    }
  `,
})
export class KeySequenceFace {
  readonly state = input.required<KeySequenceState>();
  readonly combo = model.required<KeyCombo>();
  readonly keyPress = output<KeyboardEvent>();

  protected readonly combos = COMBOS;
  protected readonly focused = signal(false);
  protected readonly keyLabel = keyLabel;

  protected onKeydown(event: KeyboardEvent): void {
    // Keep arrows from scrolling the page and Ctrl+F from opening find. Tab still moves
    // focus out, and Cmd shortcuts (reload, close tab) still work.
    if (event.key !== 'Tab' && !event.metaKey) {
      event.preventDefault();
    }
    this.keyPress.emit(event);
  }

  protected select(id: string): void {
    this.combo.set(COMBOS.find((option) => option.id === id)!);
  }
}
