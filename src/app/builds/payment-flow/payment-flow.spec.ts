import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { BACKEND_LATENCY_MS } from './account-backend';
import { PaymentFlowFace } from './payment-flow-face';
import { PaymentFlowPractice } from './payment-flow-practice';
import { PaymentFlowReference } from './payment-flow-reference';
import { CONFIRM_TIMEOUT_MS } from './payment-steps';

// Both versions must meet the same spec. Run one with
// `npx ng test --watch=false --include=app/builds/payment-flow/payment-flow.spec.ts --filter=practice`.
describe.each([
  { name: 'reference', component: PaymentFlowReference as Type<unknown>, stretch: true },
  // Flip `stretch` to true when you attempt the stretch goal.
  { name: 'practice', component: PaymentFlowPractice as Type<unknown>, stretch: false },
])('PaymentFlow ($name)', ({ component, stretch }) => {
  let fixture: ComponentFixture<unknown>;
  let el: HTMLElement;

  // Dialogs render in the CDK overlay container on <body>, outside the fixture.
  const steps = () => [...document.querySelectorAll<HTMLElement>('[data-testid^="step-"]')];
  const openStep = () => {
    const open = steps();
    expect(open, 'expected exactly one step dialog to be open').toHaveLength(1);
    return open[0].dataset['testid'];
  };

  const status = () => el.querySelector<HTMLElement>('[data-testid="status"]')!;
  const phase = () => status().dataset['phase'];
  const outcome = () => status().dataset['outcome'];
  const message = () => el.querySelector('[data-testid="outcome"]')?.textContent?.trim();

  const advance = async (ms: number) => {
    await vi.advanceTimersByTimeAsync(ms);
    fixture.detectChanges();
  };

  /** Lets dialogs finish opening or closing (no animations in tests, but still async). */
  const settle = () => advance(0);

  const launch = () => el.querySelector<HTMLButtonElement>('[data-testid="launch"]')!.click();

  /** Launches and waits out the account check, so the first step is open (if any). */
  const launchAndCheck = async () => {
    launch();
    await advance(BACKEND_LATENCY_MS);
  };

  /** Clicks a button inside the open step dialog. */
  const choose = async (testid: string) => {
    document
      .querySelector<HTMLElement>(`[data-testid^="step-"] [data-testid="${testid}"]`)!
      .click();
    await settle();
  };

  const DISMISSALS: Record<string, () => void> = {
    'its Cancel button': () =>
      document.querySelector<HTMLElement>('[data-testid^="step-"] [data-testid="cancel"]')!.click(),
    Escape: () =>
      document.body.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }),
      ),
    'a backdrop click': () => document.querySelector<HTMLElement>('.cdk-overlay-backdrop')!.click(),
  };

  /** Sets the simulated backend through the config panel. */
  const configure = async (config: { methodOnFile: boolean; accounts: 1 | 3; fails?: boolean }) => {
    const toggle = (testid: string, on: boolean) => {
      const button = el.querySelector<HTMLElement>(`[data-testid="${testid}"] button`)!;
      if ((button.getAttribute('aria-checked') === 'true') !== on) {
        button.click();
      }
    };
    toggle('cfg-method', config.methodOnFile);
    toggle('cfg-fails', config.fails ?? false);
    el.querySelector<HTMLElement>(
      `[data-testid="cfg-accounts-${config.accounts}"] button`,
    )!.click();
    await settle();
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-outlined' } },
        { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
      ],
    });
    fixture = TestBed.createComponent(component);
    el = fixture.nativeElement;
    await settle();
  });

  afterEach(async () => {
    fixture.destroy();
    await vi.runOnlyPendingTimersAsync();
    vi.useRealTimers();
  });

  it('opens nothing until Launch', async () => {
    await advance(5 * BACKEND_LATENCY_MS);

    expect(phase()).toBe('idle');
    expect(steps()).toHaveLength(0);
  });

  it('checks the account before opening the first step', async () => {
    launch();
    await advance(BACKEND_LATENCY_MS - 1);
    expect(phase()).toBe('checking');
    expect(steps()).toHaveLength(0);

    await advance(1);
    expect(phase()).toBe('in-flow');
    expect(openStep()).toBe('step-pick-account');
  });

  it('runs every step, one at a time, when nothing is set up', async () => {
    await configure({ methodOnFile: false, accounts: 3 });
    await launchAndCheck();

    expect(openStep()).toBe('step-add-payment-method');
    await choose('method-bank');

    expect(openStep()).toBe('step-pick-account');
    await choose('account-water');

    expect(openStep()).toBe('step-choose-amount');
    await choose('amount-25');

    expect(openStep()).toBe('step-confirm');
    const summary = document.querySelector('[data-testid="summary"]')!.textContent;
    expect(summary).toContain('$25');
    expect(summary).toContain('Water ••0937');
    expect(summary).toContain('Bank account');
    await choose('pay');

    expect(steps()).toHaveLength(0);
    expect(phase()).toBe('done');
    expect(outcome()).toBe('paid');
    expect(message()).toBe('Paid $25 to Water ••0937 by bank account');
  });

  it('skips steps the account check makes unnecessary', async () => {
    await configure({ methodOnFile: true, accounts: 1 });
    await launchAndCheck();

    expect(openStep()).toBe('step-choose-amount');
    await choose('amount-10');

    expect(openStep()).toBe('step-confirm');
    await choose('pay');

    expect(outcome()).toBe('paid');
    expect(message()).toBe('Paid $10 to Electric ••4821 by card');
  });

  it('reads the config when Launch is pressed', async () => {
    await configure({ methodOnFile: true, accounts: 1 });
    await launchAndCheck();
    await choose('cancel');

    await configure({ methodOnFile: false, accounts: 1 });
    await launchAndCheck();

    expect(openStep()).toBe('step-add-payment-method');
  });

  it.each(Object.keys(DISMISSALS))(
    'cancels the flow when a step is dismissed by %s',
    async (how) => {
      await launchAndCheck();
      expect(openStep()).toBe('step-pick-account');

      DISMISSALS[how]();
      await settle();

      expect(steps()).toHaveLength(0);
      expect(outcome()).toBe('cancelled');
      expect(message()).toBe('Cancelled at Pick account');

      // ...and nothing opens afterwards.
      await advance(CONFIRM_TIMEOUT_MS);
      expect(steps()).toHaveLength(0);
    },
  );

  it('cancels at Confirm without paying', async () => {
    await configure({ methodOnFile: true, accounts: 1 });
    await launchAndCheck();
    await choose('amount-50');
    await choose('cancel');

    expect(steps()).toHaveLength(0);
    expect(message()).toBe('Cancelled at Confirm');
  });

  it('reports a failed account check without opening a step', async () => {
    await configure({ methodOnFile: true, accounts: 3, fails: true });
    await launchAndCheck();

    expect(steps()).toHaveLength(0);
    expect(phase()).toBe('done');
    expect(outcome()).toBe('error');
    expect(message()).toBe(`Couldn't load account state`);
  });

  it('launches again after a flow ends, including after a failure', async () => {
    await configure({ methodOnFile: true, accounts: 3, fails: true });
    await launchAndCheck();
    expect(outcome()).toBe('error');

    await configure({ methodOnFile: true, accounts: 3, fails: false });
    await launchAndCheck();
    expect(openStep()).toBe('step-pick-account');

    await choose('cancel');
    await launchAndCheck();
    expect(openStep()).toBe('step-pick-account');
  });

  describe('Launch while a flow is running', () => {
    // The button is disabled while busy, but a disabled button isn't a guarantee: a double
    // click can land before the re-render, and other triggers (a shortcut, a second button)
    // may not check. These tests fire the face's `launch` output directly.
    const launchAnyway = () =>
      (
        fixture.debugElement.query(By.directive(PaymentFlowFace))
          .componentInstance as PaymentFlowFace
      ).launch.emit();

    it('does not start a second flow', async () => {
      launch();
      launchAnyway();
      await advance(BACKEND_LATENCY_MS);

      expect(openStep()).toBe('step-pick-account');
    });

    it('does not restart the account check', async () => {
      launch();
      await advance(BACKEND_LATENCY_MS / 2);
      launchAnyway();
      await advance(BACKEND_LATENCY_MS / 2);

      expect(phase()).toBe('in-flow');
      expect(openStep()).toBe('step-pick-account');
    });

    it('does not disturb the open step', async () => {
      await launchAndCheck();
      await choose('account-internet');
      expect(openStep()).toBe('step-choose-amount');

      launchAnyway();
      await advance(BACKEND_LATENCY_MS);

      expect(phase()).toBe('in-flow');
      expect(openStep()).toBe('step-choose-amount');
    });
  });

  describe('teardown', () => {
    it('closes the open dialog when the component is destroyed', async () => {
      await launchAndCheck();
      expect(openStep()).toBe('step-pick-account');

      fixture.destroy();
      await vi.advanceTimersByTimeAsync(0);

      expect(steps()).toHaveLength(0);
    });

    it('drops a pending account check when the component is destroyed', async () => {
      launch();
      await advance(BACKEND_LATENCY_MS / 2);

      fixture.destroy();
      await vi.advanceTimersByTimeAsync(BACKEND_LATENCY_MS);

      expect(steps()).toHaveLength(0);
    });
  });

  describe('stretch', () => {
    it.skipIf(!stretch)('times out an unanswered Confirm and closes it', async () => {
      await configure({ methodOnFile: true, accounts: 1 });
      await launchAndCheck();
      await choose('amount-25');
      expect(openStep()).toBe('step-confirm');

      await advance(CONFIRM_TIMEOUT_MS - 1);
      expect(openStep()).toBe('step-confirm');

      await advance(1);
      expect(steps()).toHaveLength(0);
      expect(outcome()).toBe('timed-out');
      expect(message()).toBe('Timed out at Confirm');
    });

    it.skipIf(!stretch)('never times out the earlier steps', async () => {
      await launchAndCheck();
      await advance(CONFIRM_TIMEOUT_MS * 2);

      expect(openStep()).toBe('step-pick-account');
      expect(phase()).toBe('in-flow');
    });
  });
});
