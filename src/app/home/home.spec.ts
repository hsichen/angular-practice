import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
  it('should list every category', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const headings = (fixture.nativeElement as HTMLElement).querySelectorAll('h2');
    expect([...headings].map((h) => h.textContent?.trim())).toEqual([
      'Practice',
      'Interview',
      'Builds',
    ]);
  });
});
