import { ComponentType } from '@angular/cdk/portal';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogState } from '@angular/material/dialog';
import {
  Observable,
  Subject,
  TimeoutError,
  catchError,
  concat,
  concatMap,
  defer,
  exhaustMap,
  finalize,
  map,
  of,
  startWith,
  switchMap,
  throwError,
  timeout,
} from 'rxjs';
import {
  AccountState,
  BillingAccount,
  DEFAULT_BACKEND_CONFIG,
  PaymentMethod,
  fetchAccountState,
} from './account-backend';
import { IDLE, Outcome, PaymentFlowFace, PaymentFlowState } from './payment-flow-face';
import {
  AddPaymentMethodDialog,
  CONFIRM_TIMEOUT_MS,
  ChooseAmountDialog,
  ConfirmPaymentDialog,
  Payment,
  PickAccountDialog,
  StepName,
} from './payment-steps';

/**
 * How a step reports that the user backed out. A step that is dismissed *errors* with this,
 * so the rest of the flow never runs. `catchError` at the end turns it into an outcome.
 *
 * Why an error rather than completing empty: `concat`/`concatMap` treat "completed with no
 * value" as "done, move on", which would quietly continue to the next step. Errors are the
 * one signal every operator stops for, the same reason `fetch` rejects with an AbortError.
 */
class StepCancelled extends Error {
  constructor(readonly step: StepName) {
    super(`Cancelled at ${step}`);
  }
}

/** What the flow has collected so far. Each step fills in one field. */
interface Draft {
  method: PaymentMethod | null;
  account: BillingAccount | null;
  amount: number | null;
}

/** One step: given the draft so far, open a dialog and emit the draft with its answer added. */
type Step = (draft: Draft) => Observable<Draft>;

/**
 * Reference payment flow. The pipeline:
 *
 *   launch$ ─exhaustMap─▶ check account ─switchMap─▶ steps (assembled from the check) ─▶ outcome
 *
 * Every step is a cold observable: building the step list opens nothing. Dialogs open one at
 * a time, as `concatMap` subscribes to each step after the previous one emits.
 */
@Component({
  selector: 'app-payment-flow-reference',
  imports: [PaymentFlowFace],
  template: `
    <app-payment-flow-face [state]="state()" [(config)]="config" (launch)="launch$.next()" />
  `,
})
export class PaymentFlowReference {
  protected readonly config = signal(DEFAULT_BACKEND_CONFIG);
  protected readonly launch$ = new Subject<void>();
  private readonly dialog = inject(MatDialog);

  private readonly state$: Observable<PaymentFlowState> = this.launch$.pipe(
    // Ignore Launch while a flow is running. switchMap would restart it, closing the open
    // dialog; mergeMap would run two flows at once. Both are double-submit bugs.
    exhaustMap(() =>
      // Read the config when Launch is pressed, not when the stream is built. A plain
      // signal read is fine here: this callback runs once per launch, outside any template.
      fetchAccountState(this.config()).pipe(
        switchMap((account) =>
          concat(of<PaymentFlowState>({ phase: 'in-flow' }), this.runSteps(account)),
        ),
        // Inside exhaustMap, so an error ends this flow only. One level up, it would kill
        // launch$ too, and the next Launch click would do nothing.
        catchError((error: unknown) => of(done(toFailure(error)))),
        startWith<PaymentFlowState>({ phase: 'checking' }),
      ),
    ),
  );

  // toSignal unsubscribes on destroy. That tears down whatever is in flight: the pending
  // timer in fetchAccountState, or the open step, whose finalize closes its dialog.
  protected readonly state = toSignal(this.state$, { initialValue: IDLE });

  /** Builds the step list from the account check, then runs it to a `paid` outcome. */
  private runSteps(account: AccountState): Observable<PaymentFlowState> {
    const steps: Step[] = [];
    if (!account.paymentMethod) {
      steps.push((draft) =>
        this.ask<PaymentMethod>('Add payment method', AddPaymentMethodDialog).pipe(
          map((method) => ({ ...draft, method })),
        ),
      );
    }
    if (account.accounts.length > 1) {
      steps.push((draft) =>
        this.ask<BillingAccount>('Pick account', PickAccountDialog, {
          accounts: account.accounts,
        }).pipe(map((picked) => ({ ...draft, account: picked }))),
      );
    }
    steps.push(
      (draft) =>
        this.ask<number>('Choose amount', ChooseAmountDialog).pipe(
          map((amount) => ({ ...draft, amount })),
        ),
      (draft) =>
        this.ask<true>('Confirm', ConfirmPaymentDialog, toPayment(draft)).pipe(
          // Stretch: race the user's answer against a timer. `first` only limits the wait
          // for the first value. timeout errors with TimeoutError, and unsubscribing from
          // the step closes its dialog.
          timeout({ first: CONFIRM_TIMEOUT_MS }),
          map(() => draft),
        ),
    );

    const start: Draft = {
      method: account.paymentMethod,
      // One bill: nothing to ask, so its step was never added.
      account: account.accounts.length === 1 ? account.accounts[0] : null,
      amount: null,
    };

    // Chain the steps: of(start).pipe(concatMap(step1), concatMap(step2), …). Each step
    // subscribes, and so opens its dialog, only when the one before it emits.
    return steps
      .reduce((flow$, step) => flow$.pipe(concatMap(step)), of(start))
      .pipe(map((draft) => done({ kind: 'paid', payment: toPayment(draft) })));
  }

  /**
   * Turns a dialog into a step: an observable that opens the dialog on subscribe, emits its
   * result once, and errors with StepCancelled if it's dismissed.
   *
   * `defer` is what makes it lazy. `dialog.open()` opens the dialog the moment it's called;
   * `afterClosed()` is only an observable of a dialog that's already open.
   *
   * In this file the steps are functions, so `ask()` is only called when concatMap reaches
   * its step, and that late call happens to hide the problem. Build the steps as observables
   * up front instead, e.g. `concat(ask(a), ask(b), ask(c))`, and without defer every dialog
   * opens at once. With defer, a step is safe to build anywhere: in a list, before a retry,
   * or for a second subscriber.
   */
  private ask<R>(step: StepName, component: ComponentType<unknown>, data?: unknown) {
    return defer(() => {
      const ref = this.dialog.open<unknown, unknown, R>(component, { data });
      return ref.afterClosed().pipe(
        // Dismissed (Cancel button, Escape or backdrop) closes with undefined.
        switchMap((result) =>
          result === undefined ? throwError(() => new StepCancelled(step)) : of(result),
        ),
        // Runs on complete, error and unsubscribe. Only the last one finds the dialog
        // still open: a timeout, a destroyed page, or anything else that abandons the step.
        finalize(() => {
          if (ref.getState() === MatDialogState.OPEN) {
            ref.close();
          }
        }),
      );
    });
  }
}

function done(outcome: Outcome): PaymentFlowState {
  return { phase: 'done', outcome };
}

function toFailure(error: unknown): Outcome {
  if (error instanceof StepCancelled) {
    return { kind: 'cancelled', step: error.step };
  }
  if (error instanceof TimeoutError) {
    return { kind: 'timed-out', step: 'Confirm' };
  }
  return { kind: 'error' };
}

/** By Confirm, every field is filled. If one isn't, the step list was built wrong. */
function toPayment({ method, account, amount }: Draft): Payment {
  if (method === null || account === null || amount === null) {
    throw new Error('Incomplete draft: a step is missing from the flow');
  }
  return { method, account, amount };
}
