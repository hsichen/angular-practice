import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES, Category, EXERCISES } from '../registry';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <h1>Angular Practice</h1>
    <p class="lede">
      Playground for drills, interview questions, and quick builds. Need a scratch pad? Use the
      <a routerLink="/sandbox">sandbox</a>.
    </p>

    @for (group of groups; track group.category) {
      <section [attr.aria-labelledby]="group.category + '-heading'">
        <h2 [id]="group.category + '-heading'">{{ group.label }}</h2>
        <p class="blurb">{{ group.blurb }}</p>
        <ul>
          @for (exercise of group.exercises; track exercise.slug) {
            <li>
              <a [routerLink]="['/', exercise.category, exercise.slug]">{{ exercise.title }}</a>
              <span class="summary">{{ exercise.summary }}</span>
            </li>
          } @empty {
            <li class="empty">Nothing here yet.</li>
          }
        </ul>
      </section>
    }
  `,
  styles: `
    .blurb,
    .summary,
    .empty {
      color: var(--text-muted);
    }

    section {
      margin-top: 2rem;
    }

    h2 {
      margin-bottom: 0.25rem;
    }

    .blurb {
      margin-top: 0;
    }

    ul {
      list-style: none;
      padding: 0;
    }

    li {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border);
    }

    .empty {
      font-style: italic;
    }
  `,
})
export class Home {
  protected readonly groups = (Object.keys(CATEGORIES) as Category[]).map((category) => ({
    category,
    ...CATEGORIES[category],
    exercises: EXERCISES.filter((exercise) => exercise.category === category),
  }));
}
