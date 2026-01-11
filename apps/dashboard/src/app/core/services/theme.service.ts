import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSignal = signal(false);

  isDarkMode = this.darkModeSignal.asReadonly();

  constructor() {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      this.darkModeSignal.set(saved === 'true');
    } else {
      this.darkModeSignal.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    effect(() => {
      if (this.darkModeSignal()) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }

  toggleDarkMode(): void {
    this.darkModeSignal.update(v => !v);
    localStorage.setItem('darkMode', this.darkModeSignal().toString());
  }

  setDarkMode(value: boolean): void {
    this.darkModeSignal.set(value);
    localStorage.setItem('darkMode', value.toString());
  }
}
