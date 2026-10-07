import { Component, computed, input, model, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { BackendConfig } from './account-backend';
import { METHOD_LABELS, Payment, StepName, accountLabel } from './payment-steps';

/** How a flow ended. */
export type Outcome =
  | { kind: 'paid'; payment: Payment }
  | { kind: 'cancelled'; step: StepName }
  /** Stretch goal only: a step went unanswered for too long. */
  | { kind: 'timed-out'; step: StepName }
  /** The account check before the first step failed. */
  | { kind: 'error' };

export type PaymentFlowState =
  /** Nothing launched yet. */
  | { phase: 'idle' }
  /** Launched, waiting for the account check. No dialog is open yet. */
  | { phase: 'checking' }
  /** The check is back and a step dialog is open. */
  | { phase: 'in-flow' }
  /** The flow ended. Launch is available again. */
  | { phase: 'done'; outcome: Outcome };

export const IDLE: PaymentFlowState = { phase: 'idle' };

/**
 * Presentational payment-flow UI shared by the reference and practice versions. No RxJS here.
 * Two-way binds the backend config, emits `launch`, and renders whatever state it's given.
 * The step dialogs themselves are opened by the container, not by this component.
 */
@Component({
  selector: 'app-payment-flow-face',
  imports: [
    MatCard,
    MatCardContent,
    MatCardActions,
    MatButton,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatSlideToggle,
    MatProgressSpinner,
    MatIcon,
  ],
  template: `
    <mat-card appearance="outlined">
      <mat-card-content>
        <fieldset>
          <legend>Simulated backend</legend>
          <mat-slide-toggle
            data-testid="cfg-method"
            [checked]="config().paymentMethodOnFile"
            (change)="patch({ paymentMethodOnFile: $event.checked })"
          >
            Payment method on file
          </mat-slide-toggle>
          <div class="row">
            <span id="accounts-label">Bills to pay</span>
            <mat-button-toggle-group
              aria-labelledby="accounts-label"
              hideSingleSelectionIndicator
              [value]="config().accountCount"
              (change)="patch({ accountCount: $event.value })"
            >
              <mat-button-toggle [value]="1" data-testid="cfg-accounts-1">1</mat-button-toggle>
              <mat-button-toggle [value]="3" data-testid="cfg-accounts-3">3</mat-button-toggle>
            </mat-button-toggle-group>
          </div>
          <mat-slide-toggle
            data-testid="cfg-fails"
            [checked]="config().checkFails"
            (change)="patch({ checkFails: $event.checked })"
          >
            Account check fails
          </mat-slide-toggle>
        </fieldset>

        <p
          class="status"
          role="status"
          data-testid="status"
          [attr.data-phase]="state().phase"
          [attr.data-outcome]="outcome()?.kind"
        >
          @switch (state().phase) {
            @case ('checking') {
              <mat-progress-spinner mode="indeterminate" diameter="20" aria-hidden="true" />
              Checking your account…
            }
            @case ('in-flow') {
              Payment in progress…
            }
            @case ('done') {
              <mat-icon aria-hidden="true">{{ icon() }}</mat-icon>
              <span data-testid="outcome">{{ message() }}</span>
            }
            @default {
              Set up the backend, then launch.
            }
          }
        </p>
      </mat-card-content>
      <mat-card-actions align="end">
        <button matButton="filled" data-testid="launch" [disabled]="busy()" (click)="launch.emit()">
          <mat-icon>rocket_launch</mat-icon>
          Make a payment
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    fieldset {
      display: grid;
      gap: 0.75rem;
      margin: 0;
      padding: 0.75rem 1rem 1rem;
      border: 1px solid var(--border);
      border-radius: 0.5rem;
    }

    legend {
      padding: 0 0.25rem;
      color: var(--text-muted);
    }

    .row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 2.5rem;
      margin: 1rem 0 0;
    }

    mat-card-actions {
      padding: 0.5rem 1rem 1rem;
    }
  `,
})
export class PaymentFlowFace {
  readonly state = input.required<PaymentFlowState>();
  readonly config = model.required<BackendConfig>();
  readonly launch = output();

  protected readonly busy = computed(() => {
    const phase = this.state().phase;
    return phase === 'checking' || phase === 'in-flow';
  });

  protected readonly outcome = computed(() => {
    const state = this.state();
    return state.phase === 'done' ? state.outcome : null;
  });

  protected readonly message = computed(() => {
    const outcome = this.outcome();
    return outcome ? describeOutcome(outcome) : '';
  });

  protected readonly icon = computed(() => {
    switch (this.outcome()?.kind) {
      case 'paid':
        return 'check_circle';
      case 'error':
        return 'error';
      default:
        return 'cancel';
    }
  });

  protected patch(change: Partial<BackendConfig>): void {
    this.config.update((config) => ({ ...config, ...change }));
  }
}

/** `Paid $25 to Electric ••4821 by card`, `Cancelled at Pick account`, … */
export function describeOutcome(outcome: Outcome): string {
  switch (outcome.kind) {
    case 'paid': {
      const { amount, account, method } = outcome.payment;
      return `Paid $${amount} to ${accountLabel(account)} by ${METHOD_LABELS[method].toLowerCase()}`;
    }
    case 'cancelled':
      return `Cancelled at ${outcome.step}`;
    case 'timed-out':
      return `Timed out at ${outcome.step}`;
    case 'error':
      return `Couldn't load account state`;
  }
}
