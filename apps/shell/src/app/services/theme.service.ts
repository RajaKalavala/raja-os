import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDarkMode = signal(false);

  private readonly storageKey = 'raja-os-theme';
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.initTheme();
    this.mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem(this.storageKey)) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  toggleTheme(): void {
    const next = this.isDarkMode() ? 'light' : 'dark';
    localStorage.setItem(this.storageKey, next);
    this.applyTheme(next);
  }

  private initTheme(): void {
    const current = document.documentElement.getAttribute('data-theme');
    this.isDarkMode.set(current === 'dark');
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    this.isDarkMode.set(theme === 'dark');
  }
}
