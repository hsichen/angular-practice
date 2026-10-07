import { Component } from '@angular/core';
import { SideBySide } from '../../shared/side-by-side';
import { PaymentFlowPractice } from './payment-flow-practice';
import { PaymentFlowReference } from './payment-flow-reference';

/** Route page: the finished reference and the practice copy, side by side. */
@Component({
  selector: 'app-payment-flow',
  imports: [SideBySide, PaymentFlowReference, PaymentFlowPractice],
  template: `
    <h1>Payment flow</h1>
    <p class="lede">
      Set up the simulated backend, then make a payment. Each step is a dialog, and which steps
      appear depends on the account check that runs when you launch. Wire up yours in
      <code>payment-flow-practice.ts</code>; the finished version is in
      <code>payment-flow-reference.ts</code>. Both run the same spec.
    </p>

    <app-side-by-side>
      <app-payment-flow-reference reference />
      <app-payment-flow-practice practice />
    </app-side-by-side>
  `,
})
export class PaymentFlow {}
