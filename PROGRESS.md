# Progress

Where each exercise stands, and what's queued. Update this when an exercise changes state.

## Exercises

| Exercise                           | Route                           | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Route → input() binding            | `/practice/route-inputs`        | **Awaiting predictions.** User is to predict `id` and `tab` for links A–D, then click through. Next: reconcile against what actually rendered.                                                                                                                                                                                                                                                                                                                                                                                 |
| Signal Forms 1 · Model and fields  | `/practice/signal-forms-basics` | **Awaiting predictions.** Four steps listed in the file header. Next: reconcile, and only then write exercise 2 (see the Signal Forms track below).                                                                                                                                                                                                                                                                                                                                                                            |
| Stopwatch (RxJS)                   | `/builds/stopwatch`             | **Core + stretch done** (all 9 practice tests pass, `stretch: true`). Built step by step: scan → switchMap/interval → Timing with banked time → merged commands for reset → clock-based display. Lessons that stuck: scan never emits its seed; startWith emits on subscribe; switchMap's unsubscribe is what stops the interval (mergeMap check); ticks only trigger redraws, the clock is the source of truth. Optional next: `timestamp()` to keep `Date.now()` out of the reducer; laps. Reference is no longer a spoiler. |
| Key sequence detector (RxJS)       | `/builds/key-sequence`          | **Not started.** User writes `state$` in `key-sequence-practice.ts` from `keydown$` + the `combo` signal. Done when `npx ng test --filter="KeySequence.*practice"` passes. Stretch: overlapping attempts (extra leading ↑ in Konami), then chords.                                                                                                                                                                                                                                                                             |
| Payment flow (RxJS dialog flows 1) | `/builds/payment-flow`          | **Not started.** Build 1 of the dialog-flow track below. User writes `state$` in `payment-flow-practice.ts`. Done when `npx ng test --watch=false --include=app/builds/payment-flow/payment-flow.spec.ts --filter=practice` passes (16 core tests; 2 stretch). First step: design the step type and cancel signal on paper.                                                                                                                                                                                                    |

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

**Nudge after exercise 2 (validation) is reconciled:** offer an optional refactor of the RxJS
flow Build 2 (navigable onboarding) dialogs from Reactive Forms to Signal Forms. They use Reactive
Forms only to avoid spoiling this track. It may not be worth doing; just raise it.

Verify behaviour against the installed package (`node_modules/@angular/forms/types/signals.d.ts`
and a real run) before writing predictions or reconciling. Don't rely on memory: Signal Forms was
experimental before v22 (its APIs are marked `@publicApi 22.0`), so older articles and examples
may not match.

## RxJS dialog flows track

Multi-step flows where **each step is a Material dialog, and each dialog is an observable of
one answer** (`afterClosed()` emits once and completes, like an HTTP call). The skill is
chaining those answers. Payment theme throughout. Agreed 2026-10-07 after weighing where RxJS
actually beats signals or async/await. Plain step state (`signal(0)` + Next/Back) is the weak
case. RxJS earns its place through **cancellation** (unsubscribe closes the open dialog),
**racing** (answer vs timeout vs backend change), **nesting** (subflows), and lazily composed
step recipes. Exercises should force those, not just reproduce an async loop.

Write builds **one at a time**: each later reference contains a solved step observable, which
would spoil the earlier build's design question.

### Build 1 · Payment flow (`builds/payment-flow/`, written)

- Config panel stands in for the backend: payment method on file, 1 or 3 bills, check fails.
  `fetchAccountState(config)` is cold and takes 800 ms.
- At Launch, steps are assembled from the check: Add payment method (only if none on file) →
  Pick account (only if 3 bills) → Choose amount ($10/$25/$50) → Confirm. Outcomes: paid,
  cancelled at step X, couldn't load, timed out (stretch).
- Given: face, the four dialogs (close with the value, or `undefined` when dismissed), the backend.
  User's: the step observable (**their own cancel design**), assembly, Launch guard, outcome.
- Stretch: an unanswered Confirm times out after 30 s and closes its dialog (a race).
- **Coaching plan** (one behaviour per step, per the build-exercise coaching memory). Each step
  maps to spec tests:
  1. On paper: what a step emits, when its dialog opens, how it says "backed out". Hand-trace
     `concat` with each candidate cancel signal (complete empty / error / sentinel).
  2. One hard-coded step opened from Launch. Predict when the dialog opens. This is where the
     `dialog.open()` eagerness question comes up.
  3. Backend check → `checking` / `in-flow` / `error` phases.
  4. Assemble and chain steps from the account state; config read at Launch.
  5. Cancel via button / Escape / backdrop.
  6. Launch guard. Let them try switchMap first; the "does not disturb the open step" test is
     the wall.
  7. Launch works again after a failure: catchError placement.
  8. Teardown: destroy closes the open dialog, drops a pending check.
  9. Stretch: timeout.
- **Traps the spec is verified to catch** (mutation-tested 2026-10-07):
  - Cancel as "complete empty" (6 failures: later steps open)
  - Eager `dialog.open()` in a `concat(...)` design (10 failures; harmless if steps are
    `(draft) => Observable` thunks, which `concatMap` calls late)
  - switchMap or mergeMap for Launch (2 failures each)
  - catchError outside the flattening operator (2 failures)
  - No close on unsubscribe (teardown + stretch)
  - Config captured at construction (7 failures)
  - Timeout on every step (stretch)
- The reference's comments on `defer`, the cancel signal, and catchError placement are spoilers.
- Add-on (backlog): retry the pre-check. Config gains "fail first N calls"; retries up to 2×
  before showing the error.

### Build 2 · Onboarding flow (navigable). Write only after Build 1 is reconciled

- Steps: Terms (required "I agree"; no Back) → Profile (name required, email required + valid) →
  Account type (Personal / Business) → Business details (**only if Business**; company name
  required) → Review (read-only summary; Back / Submit).
- Dialogs use **Reactive Forms** (deliberately not Signal Forms, which would spoil that track's
  validation exercises; say so in a comment). Next is disabled until the step's form is valid
  (given UI). Dialogs close with `{ nav: 'next' | 'back', value }` or `undefined` when dismissed.
  Revisit this contract if Build 1's cancel design suggests a better one.
- Spec behaviours: Back restores entered values (state lives in the stream and is passed back
  in as dialog data). Back goes to the step you came from (Review → Business details or Account
  type), not index − 1. Switching Business → Personal drops the business details from Review and
  the result. Dismissal anywhere cancels with the step name. The outcome shows the submitted data.
- Expected operator: recursion over answers (`expand`), since a fixed list can't go backwards.
- Stretch: autosave a draft with `debounceTime`. Write it against a plain
  `Observable<Partial<Draft>>` so the source is one line: `form.valueChanges` now,
  `toObservable(model)` after a Signal Forms migration. The timing difference
  (`valueChanges` is synchronous per keystroke; `toObservable` coalesces and emits on the next
  change detection) disappears behind the debounce.
- Add-on: resume after reload (save flow position + values; restart from saved state).

### Build 3 · Subflows (later)

A step launches a nested flow and resumes where it left off (e.g. "Add payment method" as its own
multi-step flow inside checkout). Async guard between steps: ignore double-clicks, cancel if the
user hits Back while it's pending.

### Later builds (each its own route)

- **Queue of pending flows**: several flows (approvals, permission prompts) handled one dialog at
  a time; new ones join while one is open (`concatMap` over a growing source).
- **Steps defined as data**: a JSON flow definition (could be server-sent) interpreted into step
  observables. Can reuse Build 1's dialogs.
- **Routed steps instead of dialogs**: each step is a URL; browser Back feeds the flow stream.
  Same flow logic with a different event source, a good test of the step abstraction.
- **Telemetry side stream** (add-on to any flow build): step entered / exited / duration via `tap`
  and a shared subscription, without touching flow logic.

## Backlog

- **Slideshow: autoplay + preload (RxJS build, standalone).** Optional side exercise, any order.
  One persistent Material dialog whose content changes (not dialog-per-step). Autoplay timer that
  restarts on manual prev/next, pauses on hover/focus; user picks the number of slides. The new
  idea: preloading the next image, cancelled if the user skips past it. The rest is
  stopwatch-shaped (restartable interval + merged commands + reducer), so treat it as a refresher.
- **Interview section.** Planned as runnable demos that prove a behaviour, not written Q&A notes.
  - Concepts: change detection (OnPush default, zoneless), signals ↔ RxJS interop, DI scopes and
    tokens, flattening operators, content projection and `@defer`, ControlValueAccessor,
    `takeUntilDestroyed`.
  - Live-coding prompts: typeahead, sortable/paginated table, custom form control,
    timer/polling, modal service, infinite scroll.
  - Not done yet: researching published interview-question lists into a backlog.
