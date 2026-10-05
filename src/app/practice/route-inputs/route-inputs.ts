import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Exercise: what does the router bind into these inputs?
 *
 * Before clicking, predict the displayed value of `id` and `tab` for each link.
 * Values are shown via JSON.stringify, so a string renders with quotes.
 */
@Component({
  selector: 'app-route-inputs',
  imports: [RouterLink],
  template: `
    <h1>Route → input() binding</h1>

    <dl>
      <dt><code>id</code> — <code>input('none')</code></dt>
      <dd>{{ show(id()) }}</dd>
      <dt><code>tab</code> — <code>input('overview')</code></dt>
      <dd>{{ show(tab()) }}</dd>
    </dl>

    <ol type="A">
      <li>
        <a routerLink="/practice/route-inputs/42" [queryParams]="{ tab: 'profile' }"
          >/42?tab=profile</a
        >
      </li>
      <li><a routerLink="/practice/route-inputs/42">/42</a></li>
      <li><a routerLink="/practice/route-inputs" [queryParams]="{ id: '7' }">?id=7</a></li>
      <li><a routerLink="/practice/route-inputs/42" [queryParams]="{ id: '7' }">/42?id=7</a></li>
    </ol>
  `,
  styles: `
    dl {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 0.5rem 1.5rem;
    }

    dd {
      margin: 0;
      font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    }

    li {
      padding: 0.25rem 0;
    }
  `,
})
export class RouteInputs {
  readonly id = input('none');
  readonly tab = input('overview');

  protected show(value: unknown): string {
    return value === undefined ? 'undefined' : JSON.stringify(value);
  }
}
