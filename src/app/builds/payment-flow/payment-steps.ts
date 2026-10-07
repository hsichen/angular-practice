import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { BillingAccount, PaymentMethod } from './account-backend';

/**
 * The four step dialogs. They're finished, presentational UI. Nothing here knows about any
 * other step or about RxJS.
 *
 * The contract for every step: open it with `MatDialog.open(Component, { data })`. It closes
 * with its result, or with `undefined` when it is dismissed (its Cancel button, Escape, or a
 * backdrop click). Escape and backdrop are Material's defaults, and Cancel matches them.
 *
 *   Component                 data                     closes with
 *   AddPaymentMethodDialog    none                     PaymentMethod | undefined
 *   PickAccountDialog         PickAccountData          BillingAccount | undefined
 *   ChooseAmountDialog        none                     number | undefined
 *   ConfirmPaymentDialog      Payment                  true | undefined
 */

/** Human-readable step names, used in the "Cancelled at …" outcome. */
export type StepName = 'Add payment method' | 'Pick account' | 'Choose amount' | 'Confirm';

/** Everything a finished flow has collected. */
export interface Payment {
  method: PaymentMethod;
  account: BillingAccount;
  amount: number;
}

export interface PickAccountData {
  accounts: BillingAccount[];
}

export const AMOUNTS = [10, 25, 50] as const;

/** Stretch goal: Confirm cancels itself if it goes unanswered this long. */
export const CONFIRM_TIMEOUT_MS = 30_000;

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  card: 'Card',
  bank: 'Bank account',
};

/** `Electric ••4821` */
export function accountLabel(account: BillingAccount): string {
  return `${account.name} ••${account.last4}`;
}

@Component({
  selector: 'app-add-payment-method-dialog',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, MatIcon],
  host: { 'data-testid': 'step-add-payment-method' },
  template: `
    <h2 mat-dialog-title>Add a payment method</h2>
    <mat-dialog-content>
      <p>You don't have a payment method on file yet. Nothing is collected here.</p>
      <div class="choices">
        <button matButton="outlined" [mat-dialog-close]="'card'" data-testid="method-card">
          <mat-icon>credit_card</mat-icon> {{ labels.card }}
        </button>
        <button matButton="outlined" [mat-dialog-close]="'bank'" data-testid="method-bank">
          <mat-icon>account_balance</mat-icon> {{ labels.bank }}
        </button>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton [mat-dialog-close]="undefined" data-testid="cancel">Cancel</button>
    </mat-dialog-actions>
  `,
  styles: `
    .choices {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
  `,
})
export class AddPaymentMethodDialog {
  protected readonly labels = METHOD_LABELS;
}

@Component({
  selector: 'app-pick-account-dialog',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton],
  host: { 'data-testid': 'step-pick-account' },
  template: `
    <h2 mat-dialog-title>Which bill are you paying?</h2>
    <mat-dialog-content>
      <div class="choices">
        @for (account of data.accounts; track account.id) {
          <button
            matButton="outlined"
            [mat-dialog-close]="account"
            [attr.data-testid]="'account-' + account.id"
          >
            {{ label(account) }}
          </button>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton [mat-dialog-close]="undefined" data-testid="cancel">Cancel</button>
    </mat-dialog-actions>
  `,
  styles: `
    .choices {
      display: grid;
      gap: 0.5rem;
    }
  `,
})
export class PickAccountDialog {
  protected readonly data = inject<PickAccountData>(MAT_DIALOG_DATA);
  protected readonly label = accountLabel;
}

@Component({
  selector: 'app-choose-amount-dialog',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton],
  host: { 'data-testid': 'step-choose-amount' },
  template: `
    <h2 mat-dialog-title>How much?</h2>
    <mat-dialog-content>
      <div class="choices">
        @for (amount of amounts; track amount) {
          <button
            matButton="outlined"
            [mat-dialog-close]="amount"
            [attr.data-testid]="'amount-' + amount"
          >
            \${{ amount }}
          </button>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton [mat-dialog-close]="undefined" data-testid="cancel">Cancel</button>
    </mat-dialog-actions>
  `,
  styles: `
    .choices {
      display: flex;
      gap: 0.5rem;
    }
  `,
})
export class ChooseAmountDialog {
  protected readonly amounts = AMOUNTS;
}

@Component({
  selector: 'app-confirm-payment-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    CurrencyPipe,
  ],
  host: { 'data-testid': 'step-confirm' },
  template: `
    <h2 mat-dialog-title>Confirm payment</h2>
    <mat-dialog-content>
      <dl data-testid="summary">
        <dt>Amount</dt>
        <dd>{{ payment.amount | currency: 'USD' : 'symbol' : '1.0-0' }}</dd>
        <dt>To</dt>
        <dd>{{ label(payment.account) }}</dd>
        <dt>Paying with</dt>
        <dd>{{ methods[payment.method] }}</dd>
      </dl>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton [mat-dialog-close]="undefined" data-testid="cancel">Cancel</button>
      <button matButton="filled" [mat-dialog-close]="true" data-testid="pay">Pay</button>
    </mat-dialog-actions>
  `,
  styles: `
    dl {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.25rem 1rem;
      margin: 0;
    }

    dt {
      color: var(--text-muted);
    }

    dd {
      margin: 0;
    }
  `,
})
export class ConfirmPaymentDialog {
  protected readonly payment = inject<Payment>(MAT_DIALOG_DATA);
  protected readonly label = accountLabel;
  protected readonly methods = METHOD_LABELS;
}
