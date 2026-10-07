import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject, of } from 'rxjs';
import { DEFAULT_BACKEND_CONFIG } from './account-backend';
import { IDLE, PaymentFlowFace, PaymentFlowState } from './payment-flow-face';

/**
 * Build exercise: RxJS payment flow — your copy.
 *
 * The UI is finished: the config panel writes `config`, the Launch button emits on `launch$`,
 * and the four step dialogs are in payment-steps.ts (read its header for their contract).
 * The fake backend is `fetchAccountState(config)` in account-backend.ts.
 * Your job is `state$`. Run just your copy with
 * `npx ng test --watch=false --include=app/builds/payment-flow/payment-flow.spec.ts --filter=practice`.
 *
 *  1. Nothing happens until Launch: no request, no dialog.
 *  2. Launch shows `checking`, then fetches the account state with the config as it is at
 *     that moment. If the fetch fails, the outcome is `error` and no dialog opens.
 *  3. The steps are assembled from that account state, then run one dialog at a time:
 *       Add payment method  only if no payment method is on file
 *       Pick account        only if there's more than one bill (with one, it's picked for you)
 *       Choose amount       always
 *       Confirm             always, showing the collected Payment
 *     State is `in-flow` while they run. Pay on Confirm ends with a `paid` outcome.
 *  4. Dismissing any step (its Cancel button, Escape, or a backdrop click) ends the flow
 *     with `cancelled` at that step. No later step opens.
 *  5. Launch is ignored while a flow is running (checking or in-flow). It doesn't restart
 *     the flow and doesn't start a second one. After a flow ends, Launch works again.
 *  6. Destroying the component mid-flow closes the open dialog and cancels a pending check.
 *
 * Before writing code, sketch on paper what one step looks like as an observable: what it
 * emits, when its dialog opens, and how it says "the user backed out". That last part is
 * your design decision, and it decides how steps chain together.
 *
 * Feel free to reshape anything below; the template only needs `state()`, `config` and
 * `launch$`.
 *
 * Stretch: set `stretch: true` for the practice row in the spec. An unanswered Confirm
 * times out after CONFIRM_TIMEOUT_MS (payment-steps.ts): its dialog closes and the outcome
 * is `timed-out`. Earlier steps never time out.
 * payment-flow-reference.ts has a finished version — try yours first.
 */
@Component({
  selector: 'app-payment-flow-practice',
  imports: [PaymentFlowFace],
  template: `
    <app-payment-flow-face [state]="state()" [(config)]="config" (launch)="launch$.next()" />
  `,
})
export class PaymentFlowPractice {
  protected readonly config = signal(DEFAULT_BACKEND_CONFIG);
  protected readonly launch$ = new Subject<void>();
  private readonly dialog = inject(MatDialog);

  // TODO: replace `of(IDLE)` with a stream built from launch$, the config, and the dialogs.
  private readonly state$: Observable<PaymentFlowState> = of(IDLE);

  protected readonly state = toSignal(this.state$, { initialValue: IDLE });
}
