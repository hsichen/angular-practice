# Angular Practice

Personal playground for Angular 22: concept drills, interview questions, and quick builds.

Node is pinned in `.node-version` (fnm switches to it automatically on `cd`).

```bash
npm start        # dev server at http://localhost:4200
npm test         # Vitest
```

## Layout

```
src/app/
  registry.ts      # every exercise: drives routes + the home page index
  app.routes.ts    # builds lazy routes from the registry
  home/            # index page, grouped by category
  sandbox/         # /sandbox — throwaway scratch space
  practice/        # /practice/<slug>  — focused concept drills
  interview/       # /interview/<slug> — interview-style problems
  builds/          # /builds/<slug>    — small end-to-end apps
```

## Adding an exercise

1. Generate the component in its category folder:

   ```bash
   npx ng g c practice/signals-basics
   ```

2. Add an entry to `EXERCISES` in `src/app/registry.ts`:

   ```ts
   {
     slug: 'signals-basics',
     category: 'practice',
     title: 'Signals basics',
     summary: 'signal, computed, effect',
     load: () => import('./practice/signals-basics/signals-basics').then((m) => m.SignalsBasics),
   },
   ```

It's then routed at `/practice/signals-basics` and listed on the home page. Route params bind
straight to `input()`s (`withComponentInputBinding` is on).
