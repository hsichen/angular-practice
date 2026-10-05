# Progress

Where each exercise stands, and what's queued. Update this when an exercise changes state.

## Exercises

| Exercise                     | Route                    | Status                                                                                                                                                                                                                                             |
| ---------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route → input() binding      | `/practice/route-inputs` | **Awaiting predictions.** User is to predict `id` and `tab` for links A–D, then click through. Next: reconcile against what actually rendered.                                                                                                     |
| Stopwatch (RxJS)             | `/builds/stopwatch`      | **Not started.** User writes `state$` in `stopwatch-practice.ts`. Done when `npx ng test --filter=practice` passes. Stretch goals: the delayed-timer test (flip `stretch: true` in the spec), then laps.                                           |
| Key sequence detector (RxJS) | `/builds/key-sequence`   | **Not started.** User writes `state$` in `key-sequence-practice.ts` from `keydown$` + the `combo` signal. Done when `npx ng test --filter="KeySequence.*practice"` passes. Stretch: overlapping attempts (extra leading ↑ in Konami), then chords. |

## Backlog

- **Signal Forms** (`@angular/forms/signals`), several Practice routes. This is the main gap: no
  hands-on experience yet, so treat it as new material rather than a refresher.
- **Interview section.** Planned as runnable demos that prove a behaviour, not written Q&A notes.
  - Concepts: change detection (OnPush default, zoneless), signals ↔ RxJS interop, DI scopes and
    tokens, flattening operators, content projection and `@defer`, ControlValueAccessor,
    `takeUntilDestroyed`.
  - Live-coding prompts: typeahead, sortable/paginated table, custom form control,
    timer/polling, modal service, infinite scroll.
  - Not done yet: researching published interview-question lists into a backlog.
