import { inject, Injectable, signal } from '@angular/core';
import { RandomParams } from '../models/random-params.model';
import { LanguageService } from './language-service';

@Injectable({
  providedIn: 'root',
})
export class GameConfigService {
  langService = inject(LanguageService);

  difficulties: Difficulty[] = [
    { level: 'Super Easy', rows: 9, columns: 9, mines: 10, revertLimit: 1, isNoFlagMode: false },
    { level: 'Easy', rows: 10, columns: 10, mines: 15, revertLimit: 1, isNoFlagMode: false },
    { level: 'Bathrooms', rows: 16, columns: 9, mines: 22, revertLimit: 1, isNoFlagMode: false },
    { level: 'Medium', rows: 16, columns: 16, mines: 40, revertLimit: 2, isNoFlagMode: false },
    { level: 'Hard', rows: 16, columns: 30, mines: 99, revertLimit: 3, isNoFlagMode: false },
    { level: 'Tryhard', rows: 20, columns: 24, mines: 120, revertLimit: 3, isNoFlagMode: false },
    { level: 'Random', rows: 0, columns: 0, mines: 0, revertLimit: 0 },
    { level: 'Hobby', rows: 0, columns: 0, mines: 0, revertLimit: 0 },
    { level: 'No Flags', rows: 13, columns: 33, mines: 60, revertLimit: 1, isNoFlagMode: true },
    {
      level: 'Hobby Static',
      rows: 13,
      columns: 33,
      mines: 60,
      revertLimit: 1,
      isNoFlagMode: false,
    },
    { level: 'Roulette', rows: 3, columns: 3, mines: 8, revertLimit: 0, isNoFlagMode: true},
  ];

  randomCap: RandomParams[] = [
    { level: 'Hobby', min: 6, max: 30, minDensity: 11.6, maxDensity: 13.6, randomRevertLimit: 1 },
    { level: 'Random', min: 9, max: 30, minDensity: 10, maxDensity: 25, randomRevertLimit: 3 },
  ];

  config = signal<Difficulty>(this.difficulties[0]);

  getDifficultDescription(level: string) {
    const descriptions = this.langService.i18n().descriptions as Record<string, string>;
    return descriptions[level] || '';
  }

  getRandomMessage(isGameOver: boolean): string {
    return this.langService.getRandomMessage(isGameOver);
  }

  setConfig(difficulty: Difficulty): void {
    if (difficulty.level === 'Random' || difficulty.level === 'Hobby') {
      this.setRandomConfig(difficulty.level);
    } else {
      this.config.set(difficulty);
    }
  }

  setRandomConfig(level: string): void {
    const randomDifficulty: Difficulty = this.generateRandomConfig(level);
    this.config.set(randomDifficulty);
  }

  generateRandomConfig(level: string): Difficulty {
    const params = this.randomCap.find((cap) => cap.level === level) || this.randomCap[0];
    const { min, max, minDensity, maxDensity, randomRevertLimit } = params;

    const { rows, columns } = this.getRandomRowsAndCols(max, min);
    const totalBox = rows * columns;

    const density = this.getRandomDensity(maxDensity, minDensity);

    const mines = Math.max(1, Math.floor(totalBox * density));
    return { level, rows, columns, mines, revertLimit: randomRevertLimit };
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
      1: 'text-sky-400 font-extrabold',
      2: 'text-emerald-400 font-extrabold',
      3: 'text-rose-500 font-black text-sm',
      4: 'text-purple-400 font-black text-sm',
      5: 'text-amber-400 font-black text-sm',
      6: 'text-teal-300 font-black text-sm',
      7: 'text-pink-400 font-black text-sm',
      8: 'text-zinc-300 font-black text-sm',
    };
    return colors[minesAround] || 'text-zinc-200';
  }

  calcScore(rows: number, cols: number, mines: number, time: number, isLoss: boolean): number {
    const totalCells = rows * cols;

    if (totalCells === 0 || mines === 0) {
      return 0;
    }

    if (isLoss) {
      return Math.min(200, time * 2);
    }

    const density = mines / totalCells;
    const basePoints = Math.floor(totalCells * density * 1000);
    const safeTime = Math.max(1, time);
    const speedBonus = Math.floor((basePoints * 10) / safeTime);

    return basePoints + speedBonus;
  }

  assignBestScore(level: string, score: number) {
    const bestScore = this.recoverBestScore(level);

    if (score > bestScore) {
      localStorage.setItem(level, score.toString());
      return true;
    }

    return false;
  }

  recoverBestScore(level: string) {
    const bestScore = localStorage.getItem(level);
    if (!bestScore) {
      return 0;
    }

    if (Number.isNaN(bestScore)) {
      return 0;
    }

    return Number(bestScore);
  }

  assignBestTime(level: string, time: number) {
    const bestTime = this.recoverBestTime(level);

    if (bestTime === 0 || time < bestTime) {
      localStorage.setItem(`${level}-time`, time.toString());
      return true;
    }

    return false;
  }

  recoverBestTime(level: string) {
    const bestTime = localStorage.getItem(`${level}-time`);

    if (!bestTime) {
      return 0;
    }

    if (Number.isNaN(bestTime)) {
      return 0;
    }
    return Number(bestTime);
  }
}
