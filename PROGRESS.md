# Progress

Where each exercise stands, and what's queued. Update this when an exercise changes state.

## Exercises

| Exercise                          | Route                           | Status                                                                                                                                                                                                                                             |
| --------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route → input() binding           | `/practice/route-inputs`        | **Awaiting predictions.** User is to predict `id` and `tab` for links A–D, then click through. Next: reconcile against what actually rendered.                                                                                                     |
| Signal Forms 1 · Model and fields | `/practice/signal-forms-basics` | **Awaiting predictions.** Four steps listed in the file header. Next: reconcile, and only then write exercise 2 (see the Signal Forms track below).                                                                                                |
| Stopwatch (RxJS)                  | `/builds/stopwatch`             | **Core + stretch done** (all 9 practice tests pass, `stretch: true`). Built step by step: scan → switchMap/interval → Timing with banked time → merged commands for reset → clock-based display. Lessons that stuck: scan never emits its seed; startWith emits on subscribe; switchMap's unsubscribe is what stops the interval (mergeMap check); ticks only trigger redraws, the clock is the source of truth. Optional next: `timestamp()` to keep `Date.now()` out of the reducer; laps. Reference is no longer a spoiler. |
| Key sequence detector (RxJS)      | `/builds/key-sequence`          | **Not started.** User writes `state$` in `key-sequence-practice.ts` from `keydown$` + the `combo` signal. Done when `npx ng test --filter="KeySequence.*practice"` passes. Stretch: overlapping attempts (extra leading ↑ in Konami), then chords. |

## Signal Forms track

New material for the user (no hands-on experience yet), so it follows predict → run → reconcile
strictly. Write **one exercise at a time**: the next exercise is written only after the user has
run the current one and the reconcile is done. Planned order (adjust as reconciles reveal gaps):

1. **Model and fields**: `form()`, `[formField]`, the model signal as the source of truth (written)
2. **Validation**: schema function, built-in validators, `errors()`, touched-gated messages,
   `valid()` vs `invalid()`
3. **Field logic**: `disabled` / `hidden` / `readonly`, `applyWhen`
4. **Cross-field validation**: `validate` on a parent path, `validateTree` (password confirm)
5. **Async validation**: `validateAsync` / `validateHttp`, `pending()`, `debounce()`
6. **Arrays**: `applyEach`, adding and removing items
7. **Custom controls**: `FormValueControl` (the replacement for ControlValueAccessor)
8. **Submission**: `submit()`, mapping server errors onto fields

Verify behaviour against the installed package (`node_modules/@angular/forms/types/signals.d.ts`
and a real run) before writing predictions or reconciling. Don't rely on memory: Signal Forms was
experimental before v22 (its APIs are marked `@publicApi 22.0`), so older articles and examples
may not match.

## Backlog

- **Interview section.** Planned as runnable demos that prove a behaviour, not written Q&A notes.
  - Concepts: change detection (OnPush default, zoneless), signals ↔ RxJS interop, DI scopes and
    tokens, flattening operators, content projection and `@defer`, ControlValueAccessor,
    `takeUntilDestroyed`.
  - Live-coding prompts: typeahead, sortable/paginated table, custom form control,
    timer/polling, modal service, infinite scroll.
  - Not done yet: researching published interview-question lists into a backlog.
