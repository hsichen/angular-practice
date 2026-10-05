import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { SUCCESS_MS } from './key-sequence-face';
import { KeySequencePractice } from './key-sequence-practice';
import { KeySequenceReference } from './key-sequence-reference';

const CTRL_MFE = ['Control', 'm', 'f', 'e'];
const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

// Both versions must meet the same spec. Run one with `npx ng test --filter="KeySequence.*practice"`.
describe.each([
  { name: 'reference', component: KeySequenceReference as Type<unknown>, stretch: true },
  // Flip `stretch` to true when you attempt the stretch goal.
  { name: 'practice', component: KeySequencePractice as Type<unknown>, stretch: false },
])('KeySequence ($name)', ({ component, stretch }) => {
  let fixture: ComponentFixture<unknown>;
  let el: HTMLElement;

  const zone = () => el.querySelector<HTMLElement>('[data-testid="zone"]')!;
  const progress = () => Number(zone().dataset['progress']);
  const success = () => zone().dataset['success'] === 'true';

  const press = (key: string, init: KeyboardEventInit = {}) => {
    zone().dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
    );
    fixture.detectChanges();
  };
  const type = (...keys: string[]) => keys.forEach((key) => press(key));

  /** Picks a combo in the radio group, then flushes effects (e.g. toObservable). */
  const select = (id: string) => {
    el.querySelector<HTMLInputElement>(`[data-testid="combo-${id}"] input`)!.click();
    TestBed.tick();
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
    TestBed.tick();
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  it('starts with no progress and no success', () => {
    expect(progress()).toBe(0);
    expect(success()).toBe(false);
  });

  it('advances progress on each correct key', () => {
    type('Control', 'm');
    expect(progress()).toBe(2);

    press('f');
    expect(progress()).toBe(3);
  });

  it('resets progress on a wrong key, then still matches from scratch', () => {
    type('Control', 'm', 'x');
    expect(progress()).toBe(0);

    type(...CTRL_MFE);
    expect(success()).toBe(true);
  });

  it('signals success on a full match and goes back to 0', () => {
    type(...CTRL_MFE);

    expect(success()).toBe(true);
    expect(progress()).toBe(0);
  });

  it(`clears success after ${SUCCESS_MS} ms`, async () => {
    type(...CTRL_MFE);

    await advance(SUCCESS_MS - 1);
    expect(success()).toBe(true);

    await advance(1);
    expect(success()).toBe(false);
  });

  it('tracks a new attempt right after a match', () => {
    type(...CTRL_MFE);
    type('Control', 'm');

    expect(progress()).toBe(2);
  });

  it('ignores auto-repeated keydowns from a held key', () => {
    type('Control', 'm');
    press('m', { repeat: true });
    press('m', { repeat: true });
    type('f', 'e');

    expect(success()).toBe(true);
  });

  it('matches letters regardless of case', () => {
    type('Control', 'M', 'F', 'E');

    expect(success()).toBe(true);
  });

  it('resets progress when the combo changes, and matches the new one', () => {
    type('Control', 'm');
    expect(progress()).toBe(2);

    select('konami');
    expect(progress()).toBe(0);

    type(...CTRL_MFE);
    expect(success()).toBe(false);

    type(...KONAMI);
    expect(success()).toBe(true);
  });

  it('leaves no timers running after destroy', () => {
    type(...CTRL_MFE);
    expect(success()).toBe(true);
    fixture.destroy();

    expect(vi.getTimerCount()).toBe(0);
  });

  describe('stretch', () => {
    // The extra leading ↑ breaks the first attempt at the third ↑, but the last two ↑
    // are a valid start, so the sequence as a whole should still match.
    it.skipIf(!stretch)('starts a new attempt when the wrong key could begin one', () => {
      select('konami');
      type('ArrowUp', ...KONAMI);

      expect(success()).toBe(true);
    });
  });
});
