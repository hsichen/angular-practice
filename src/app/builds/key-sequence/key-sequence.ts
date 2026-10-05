import { Component } from '@angular/core';
import { SideBySide } from '../../shared/side-by-side';
import { KeySequencePractice } from './key-sequence-practice';
import { KeySequenceReference } from './key-sequence-reference';

/** Route page: the finished reference and the practice copy, side by side. */
@Component({
  selector: 'app-key-sequence',
  imports: [SideBySide, KeySequenceReference, KeySequencePractice],
  template: `
    <h1>Key sequence detector</h1>
    <p class="lede">
      Focus a test zone, then type the selected combination. Wire up yours in
      <code>key-sequence-practice.ts</code>; the finished version is in
      <code>key-sequence-reference.ts</code>. Both run the same spec.
    </p>

    <app-side-by-side>
      <app-key-sequence-reference reference />
      <app-key-sequence-practice practice />
    </app-side-by-side>
  `,
})
export class KeySequence {}
