import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GameConfigService {
  config = signal<Difficulty>({
    level: 'Easy',
    rows: 10,
    columns: 8,
    mines: 7,
  });

  setConfig(difficulty: Difficulty): void {
    if (difficulty.level === 'Random') {
      const randomDifficulty = this.generateRandomConfig();
      this.config.set(randomDifficulty);
    } else {
      this.config.set(difficulty);
    }
  }

  generateRandomConfig(): Difficulty {
    const rows = Math.floor(Math.random() * (30 - 10 + 1)) + 8;
    const columns = Math.floor(Math.random() * (20 - 8 + 1)) + 8;
    const totalCells = rows * columns;
    const density = (Math.random() * (18 - 13) + 13) / 100;
    const mines = Math.floor(totalCells * density);
    return { level: 'Random', rows, columns, mines };
  }
}
