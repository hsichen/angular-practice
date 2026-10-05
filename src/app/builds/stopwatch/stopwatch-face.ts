import { Component, computed, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

export interface StopwatchState {
  running: boolean;
  elapsedMs: number;
}

export const INITIAL_STATE: StopwatchState = { running: false, elapsedMs: 0 };

/** Presentational stopwatch UI shared by the reference and practice versions. No RxJS here. */
@Component({
  selector: 'app-stopwatch-face',
  imports: [MatCard, MatCardContent, MatCardActions, MatButton, MatIcon],
  template: `
    <mat-card appearance="outlined">
      <mat-card-content>
        <div class="display" role="timer" aria-label="Elapsed time" data-testid="display">
          {{ display() }}
        </div>
      </mat-card-content>
      <mat-card-actions align="end">
        <button
          matButton="outlined"
          data-testid="reset"
          [disabled]="!state().running && state().elapsedMs === 0"
          (click)="reset.emit()"
        >
          <mat-icon>restart_alt</mat-icon>
          Reset
        </button>
        <button matButton="filled" data-testid="start-pause" (click)="startPause.emit()">
          <mat-icon>{{ state().running ? 'pause' : 'play_arrow' }}</mat-icon>
          {{ state().running ? 'Pause' : 'Start' }}
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    .display {
      padding: 1.5rem 0 0.5rem;
      text-align: center;
      font: var(--mat-sys-display-large);
      font-variant-numeric: tabular-nums;
    }

    mat-card-actions {
      gap: 0.5rem;
      padding: 0.5rem 1rem 1rem;
    }
  `,
})
export class StopwatchFace {
  readonly state = input.required<StopwatchState>();
  readonly startPause = output();
  readonly reset = output();

  protected readonly display = computed(() => formatElapsed(this.state().elapsedMs));
}

/** Formats milliseconds as `mm:ss.cc` (minutes keep counting past 59). */
export function formatElapsed(ms: number): string {
  const centis = Math.floor(ms / 10);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(centis / 6000))}:${pad(Math.floor(centis / 100) % 60)}.${pad(centis % 100)}`;
}
