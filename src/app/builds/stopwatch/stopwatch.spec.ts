import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { StopwatchPractice } from './stopwatch-practice';
import { StopwatchReference } from './stopwatch-reference';

// Both versions must meet the same spec. Run one with `npx ng test --filter=practice`.
describe.each([
  { name: 'reference', component: StopwatchReference as Type<unknown>, stretch: true },
  // Flip `stretch` to true when you attempt the stretch goal.
  { name: 'practice', component: StopwatchPractice as Type<unknown>, stretch: true },
])('Stopwatch ($name)', ({ component, stretch }) => {
  let fixture: ComponentFixture<unknown>;
  let el: HTMLElement;

  const query = (id: string) => el.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
  const display = () => query('display').textContent!.trim();
  const startPauseLabel = () => query('start-pause').textContent!.trim();

  /** Parses the `mm:ss.cc` display back into milliseconds. */
  const elapsedMs = () => {
    const [, mm, ss, cc] = display().match(/^(\d+):(\d{2})\.(\d{2})$/)!;
    return (Number(mm) * 60 + Number(ss)) * 1000 + Number(cc) * 10;
  };

  /** Display only has 10 ms resolution and timer cadence is up to you, so allow some slack. */
  const expectAbout = (ms: number) => expect(Math.abs(elapsedMs() - ms)).toBeLessThanOrEqual(20);

  const click = (id: 'start-pause' | 'reset') => {
    query(id).click();
    fixture.detectChanges();
  };

  const advance = async (ms: number) => {
    await vi.advanceTimersByTimeAsync(ms);
    fixture.detectChanges();
  };

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-outlined' } },
      ],
    });
    fixture = TestBed.createComponent(component);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  it('starts stopped at 00:00.00', async () => {
    expect(display()).toBe('00:00.00');
    expect(startPauseLabel()).toContain('Start');

    await advance(1000);
    expect(display()).toBe('00:00.00');
  });

  it('counts up while running', async () => {
    click('start-pause');
    expect(startPauseLabel()).toContain('Pause');

    await advance(1000);
    expectAbout(1000);

    await advance(1500);
    expectAbout(2500);
  });

  it('freezes the time on pause', async () => {
    click('start-pause');
    await advance(1500);
    click('start-pause');
    expectAbout(1500);
    const paused = display();
    expect(startPauseLabel()).toContain('Start');

    await advance(2000);
    expect(display()).toBe(paused);
  });

  it('resumes from the paused time, not from zero', async () => {
    click('start-pause');
    await advance(1000);
    click('start-pause');
    await advance(5000);
    click('start-pause');
    await advance(500);

    expectAbout(1500);
  });

  it('resets to zero while paused', async () => {
    click('start-pause');
    await advance(1200);
    click('start-pause');
    expectAbout(1200);
    click('reset');

    expect(display()).toBe('00:00.00');
  });

  it('resets to zero and stops while running', async () => {
    click('start-pause');
    await advance(1200);
    expectAbout(1200);
    click('reset');
    expect(display()).toBe('00:00.00');
    expect(startPauseLabel()).toContain('Start');

    await advance(1000);
    expect(display()).toBe('00:00.00');
  });

  it('can start again after a reset', async () => {
    click('start-pause');
    await advance(1200);
    click('reset');
    click('start-pause');
    await advance(300);

    expectAbout(300);
  });

  it('leaves no timers running after destroy', async () => {
    click('start-pause');
    await advance(100);
    expectAbout(100);
    fixture.destroy();

    expect(vi.getTimerCount()).toBe(0);
  });

  describe('stretch', () => {
    // Simulates a throttled or frozen tab: the wall clock (Date.now) jumps 5 s ahead,
    // but no timer callbacks fire during the gap.
    it.skipIf(!stretch)('stays accurate when timer callbacks are delayed', async () => {
      click('start-pause');
      await advance(100);
      vi.setSystemTime(Date.now() + 5000);
      await advance(20);

      expectAbout(5120);
    });
  });
});
