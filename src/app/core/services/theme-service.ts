import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  themes = [
    { id: 'default', label: 'Default' },
    { id: 'blizzard', label: 'Blizzard' },
    { id: 'dark', label: 'Dark' },
    { id: 'sunset', label: 'Sunset' },
    { id: 'aqua', label: 'Aqua' },
    { id: 'retro', label: 'Retro' },
    { id: 'valentine', label: 'Valentine' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'nord', label: 'Nord' },
    { id: 'emerald', label: 'Emerald' },
    { id: 'light', label: 'Light' },
  ];

  private initialTheme = localStorage.getItem('app-theme') || 'default';

  currentTheme = signal<string>(this.initialTheme);

  constructor() {
    document.documentElement.setAttribute('data-theme', this.initialTheme);
  }

  setTheme(theme: string) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
    this.currentTheme.set(theme);
  }
}
