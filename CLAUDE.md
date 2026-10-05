You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## Playground Structure

- This repo is a personal practice playground, not a product. Exercise status and the backlog of upcoming topics are in `PROGRESS.md`. Read it first, and update it when an exercise changes state.
- Exercises live in `src/app/{practice,interview,builds}/<slug>/` and are registered in `EXERCISES` in `src/app/registry.ts`, which generates the lazy routes and the home page index. Don't hand-edit `app.routes.ts` to add an exercise. Use `extraPaths` (e.g. `[':id']`) for exercises that need route params.
- `src/app/sandbox/` is scratch space; it may be overwritten freely.

## Exercise Conventions

- The user's global CLAUDE.md teaching contract applies: predict → run → reconcile. Don't reveal an exercise's answer before they've predicted and run it.
- `TODO` stubs in exercise files are the user's to write. Don't implement them unless asked. Review, hint, or point at failing tests instead.
- Build exercises with a finished version use this layout (see `builds/stopwatch/`, `builds/key-sequence/`):
  - `<slug>-face.ts`: shared presentational UI (`input()`/`output()`, no logic under practice)
  - `<slug>-reference.ts`: finished, commented solution. **It is a spoiler**: don't quote or summarize it while the user is still working on the practice copy, unless they ask.
  - `<slug>-practice.ts`: the same container with a stub for the user
  - `<slug>.ts`: route page; wraps both in `<app-side-by-side>` (`src/app/shared/side-by-side.ts`) using `reference` / `practice` content-projection attributes
  - `<slug>.spec.ts`: one `describe.each` suite that runs against both versions
- Specs are the check for build exercises. Failing tests for an untouched practice stub are expected. When writing a new spec, verify it against a throwaway correct implementation (and an incorrect one) outside the repo before handing it over.

## Environment

- Node is pinned in `.node-version` (24.x via fnm; the shell's default Node is too old for Angular CLI 22). In non-interactive shells, run tools through `fnm exec -- npx ng ...`.
- Angular 22 and Angular Material 22 use a Material 3 theme in `src/styles.scss`. App-level CSS tokens (`--bg`, `--text`, `--text-muted`, `--border`, `--accent`) alias `--mat-sys-*` variables. `mat-icon` defaults to the Material Symbols font (set in `app.config.ts`).
- Tests use Vitest via `ng test`. Run a subset with `npx ng test --watch=false --filter=<regex>`, which matches suite and test names (e.g. `--filter=practice`).
- The browser pane's automation sends a lone Ctrl keypress with an empty `key`, and scripted `.click()` on a `mat-radio-button` input doesn't select it there. Use real clicks, or verify modifier keys in specs (jsdom), rather than concluding the app is broken.
- Dev server: the `dev` config in `.claude/launch.json`. Restart it after installing packages. If a new file isn't picked up (e.g. the registry was saved before the file existed), touch `registry.ts` to force a rebuild.
