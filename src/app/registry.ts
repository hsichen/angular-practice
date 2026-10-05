import { Type } from '@angular/core';

export type Category = 'practice' | 'interview' | 'builds';

export interface Exercise {
  /** URL segment under its category, e.g. `signals-basics` → `/practice/signals-basics`. */
  slug: string;
  category: Category;
  title: string;
  summary: string;
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
export const EXERCISES: Exercise[] = [];
