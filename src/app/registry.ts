import { Type } from '@angular/core';

export type Category = 'practice' | 'interview' | 'builds';

export interface Exercise {
  /** URL segment under its category, e.g. `signals-basics` → `/practice/signals-basics`. */
  slug: string;
  category: Category;
  title: string;
  summary: string;
  /** Extra path segments that load the same component, e.g. `[':id']` → `/practice/<slug>/:id`. */
  extraPaths?: string[];
  load: () => Promise<Type<unknown>>;
}

export const CATEGORIES: Record<Category, { label: string; blurb: string }> = {
  practice: {
    label: 'Practice',
    blurb: 'Focused drills on a single API or concept.',
  },
  interview: {
    label: 'Interview',
    blurb: 'Timed-style problems and common interview questions.',
  },
  builds: {
    label: 'Builds',
    blurb: 'Small end-to-end apps and components.',
  },
};

/**
 * Every exercise in the playground. Adding an entry here registers its lazy route
 * and lists it on the home page — no other wiring needed.
 *
 * Example:
 *   {
 *     slug: 'signals-basics',
 *     category: 'practice',
 *     title: 'Signals basics',
 *     summary: 'signal, computed, effect',
 *     load: () => import('./practice/signals-basics/signals-basics').then((m) => m.SignalsBasics),
 *   },
 */
export const EXERCISES: Exercise[] = [
  {
    slug: 'route-inputs',
    category: 'practice',
    title: 'Route → input() binding',
    summary: 'withComponentInputBinding: path params, query params, defaults',
    extraPaths: [':id'],
    load: () => import('./practice/route-inputs/route-inputs').then((m) => m.RouteInputs),
  },
  {
    slug: 'signal-forms-basics',
    category: 'practice',
    title: 'Signal Forms 1 · Model and fields',
    summary: 'form(), [formField], and who owns the value',
    load: () =>
      import('./practice/signal-forms-basics/signal-forms-basics').then((m) => m.SignalFormsBasics),
  },
  {
    slug: 'stopwatch',
    category: 'builds',
    title: 'Stopwatch',
    summary: 'RxJS: button clicks → timer state. Reference + practice copy',
    load: () => import('./builds/stopwatch/stopwatch').then((m) => m.Stopwatch),
  },
  {
    slug: 'key-sequence',
    category: 'builds',
    title: 'Key sequence detector',
    summary: 'RxJS: recognize key combos like the Konami code. Reference + practice copy',
    load: () => import('./builds/key-sequence/key-sequence').then((m) => m.KeySequence),
  },
];
