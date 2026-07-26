import { Injectable, signal } from '@angular/core';
import { RandomParams } from '../models/random-params.model';

@Injectable({
  providedIn: 'root',
})
export class GameConfigService {
  difficulties: Difficulty[] = [
    { level: 'Super Easy', rows: 9, columns: 9, mines: 10 },
    { level: 'Easy', rows: 10, columns: 10, mines: 15 },
    { level: 'Medium', rows: 16, columns: 16, mines: 40 },
    { level: 'Hard', rows: 16, columns: 30, mines: 99 },
    { level: 'Tryhard', rows: 20, columns: 24, mines: 168 },
    { level: 'Random', rows: 0, columns: 0, mines: 0 },
    { level: 'Hobby', rows: 0, columns: 0, mines: 0 },
    //{ level: 'Campaign', rows: 0, columns: 0, mines: 0 },
    //{ level: 'No Flags', rows: 0, columns: 0, mines: 0 },
  ];

  randomCap: RandomParams[] = [
    { level: 'Hobby', min: 20, max: 30, minDensity: 12.6, maxDensity: 14.6 },
    { level: 'Random', min: 9, max: 30, minDensity: 10, maxDensity: 38 },
  ];

  lossMessages: string[] = ['¡Fin del juego!', 'Mala suerte'];

  winMessages: string[] = ['¡Victoria!', '¡Excelente trabajo!'];

  config = signal<Difficulty>(this.difficulties[0]);

  setConfig(difficulty: Difficulty): void {
    if (difficulty.level === 'Random' || difficulty.level === 'Hobby') {
      this.setRandomConfig(difficulty.level);
    } else {
      this.config.set(difficulty);
    }
  }

  setRandomConfig(level: string): void {
    const randomDifficulty = this.generateRandomConfig(level);
    this.config.set(randomDifficulty);
  }

  generateRandomConfig(level: string): Difficulty {
    const params = this.randomCap.find((cap) => cap.level === level) || this.randomCap[0];
    const { min, max, minDensity, maxDensity } = params;

    const { rows, columns } = this.getRandomRowsAndCols(max, min);
    const totalBox = rows * columns;

    const density = this.getRandomDensity(maxDensity, minDensity);

    const mines = Math.max(1, Math.floor(totalBox * density));
    return { level: level, rows, columns, mines };
  }

  getRandomRowsAndCols(max: number, min: number): { rows: number; columns: number } {
    const generate = () => Math.floor(Math.random() * (max - min + 1)) + min;
    return { rows: generate(), columns: generate() };
  }

  getRandomDensity(maxDensity: number, minDensity: number): number {
    return (Math.random() * (maxDensity - minDensity) + minDensity) / 100;
  }

  getNumberColor(minesAround: number): string {
    const colors: Record<number, string> = {
      1: 'text-info font-extrabold',
      2: 'text-success font-extrabold',
      3: 'text-error font-black text-sm',
      4: 'text-secondary font-black text-sm',
      5: 'text-neutral-content bg-neutral p-0.5 rounded',
      6: 'text-error bg-error/20 p-0.5 rounded font-black',
      7: 'text-error bg-error/30 p-0.5 rounded font-black uppercase tracking-tighter',
      8: 'text-black bg-red-600 px-1 rounded font-black text-center',
    };
    return colors[minesAround] || 'text-base-content';
  }

  getRandomMessage(isGameOver: boolean): string {
    const list = isGameOver ? this.lossMessages : this.winMessages;
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  }

  calcScore(rows: number, cols: number, mines: number, time: number, isLoss: boolean) {
    const boxQuantity = rows * cols;
    if (boxQuantity === 0 || mines === 0) return 0;
    const density = mines / boxQuantity;
    const difficultyMultiplier = 1 + density * 3.5;
    const winBaseScore = Math.floor(mines * 250 * difficultyMultiplier);
    if (isLoss) {
      const survivalBonus = Math.min(300, time * 5);
      const lossScore = Math.floor(winBaseScore * 0.02) + survivalBonus;
      return Math.floor(lossScore);
    }
    const targetTime = mines * 3;
    let timeBonus;
    if (time < targetTime) {
      const secondsSaved = targetTime - time;
      timeBonus = Math.floor(secondsSaved * 15 * difficultyMultiplier);
    } else {
      timeBonus = mines;
    }
    return winBaseScore + timeBonus;
  }
}
