import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';

interface Profile {
  name: string;
  email: string;
  newsletter: boolean;
}

/**
 * Signal Forms 1: the model and the field tree.
 *
 * Predict first, then run. For each step, write down your answer before you touch the page.
 * Reload between attempts so you start from a clean form.
 *
 *  1. Type "Al" into Name, but don't leave the input yet. What does the model() panel show:
 *     updated on each keystroke, or only after you leave the field? What are `dirty` and
 *     `touched` at this point? Then Tab out: does either change?
 *  2. Reload. Click A. Does the Name input show "Ada"? What is `dirty`?
 *  3. Reload. Click B. What changes on screen: the input, the model() panel, both, or neither?
 *  4. Reload. Click C. Does the model() panel show "Linus"? What is `dirty`?
 */
@Component({
  selector: 'app-signal-forms-basics',
  imports: [FormField, JsonPipe, MatButton],
  template: `
    <h1>Signal Forms 1 · Model and fields</h1>
    <p class="lede">
      Predict each step in <code>signal-forms-basics.ts</code> before you interact. Reload between
      steps.
    </p>

    <div class="fields">
      <label>
        Name
        <input [formField]="profile.name" />
      </label>
      <label>
        Email
        <input type="email" [formField]="profile.email" />
      </label>
      <label class="checkbox">
        <input type="checkbox" [formField]="profile.newsletter" />
        Newsletter
      </label>
    </div>

    <div class="actions">
      <button matButton="outlined" (click)="replaceModel()">
        A · <code>model.update(m => ({{ '{' }} ...m, name: 'Ada' {{ '}' }}))</code>
      </button>
      <button matButton="outlined" (click)="mutateModel()">
        B · <code>model.update(m => {{ '{' }} m.name = 'Grace'; return m; {{ '}' }})</code>
      </button>
      <button matButton="outlined" (click)="setThroughField()">
        C · <code>profile.name().value.set('Linus')</code>
      </button>
    </div>

    <div class="panels">
      <section aria-labelledby="model-heading">
        <h2 id="model-heading"><code>model()</code></h2>
        <pre>{{ model() | json }}</pre>
      </section>
      <section aria-labelledby="name-state-heading">
        <h2 id="name-state-heading"><code>profile.name()</code></h2>
        <dl>
          <dt><code>value()</code></dt>
          <dd>{{ profile.name().value() | json }}</dd>
          <dt><code>dirty()</code></dt>
          <dd>{{ profile.name().dirty() }}</dd>
          <dt><code>touched()</code></dt>
          <dd>{{ profile.name().touched() }}</dd>
        </dl>
      </section>
    </div>
  `,
  styles: `
    .fields {
      display: grid;
      gap: 1rem;
      max-width: 24rem;
    }

    label {
      display: grid;
      gap: 0.25rem;
      font: var(--mat-sys-label-large);
    }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    input:not([type='checkbox']) {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--mat-sys-outline);
      border-radius: 0.375rem;
      background: transparent;
      color: inherit;
      font: var(--mat-sys-body-large);

      &:focus {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: -1px;
      }
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1.5rem 0;
    }

    .panels {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
      gap: 1.5rem;
    }

    h2 {
      margin: 0 0 0.5rem;
      font: var(--mat-sys-title-medium);
    }

    pre {
      margin: 0;
      padding: 0.75rem;
      border-radius: 0.5rem;
      background: var(--mat-sys-surface-container);
      font-size: 0.875rem;
    }

    dl {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 0.25rem 1rem;
      margin: 0;
    }

    dd {
      margin: 0;
      font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    }
  `,
})
export class SignalFormsBasics {
  protected readonly model = signal<Profile>({ name: '', email: '', newsletter: false });
  protected readonly profile = form(this.model);

  protected replaceModel(): void {
    this.model.update((m) => ({ ...m, name: 'Ada' }));
  }

  protected mutateModel(): void {
    // Deliberately breaks the "don't mutate signal values" rule. That's the point of step 3.
    this.model.update((m) => {
      m.name = 'Grace';
      return m;
    });
  }

  protected setThroughField(): void {
    this.profile.name().value.set('Linus');
  }
}
