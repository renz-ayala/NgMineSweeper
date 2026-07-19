import { Injectable, signal } from '@angular/core';

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
  ];

  lossMessages: string[] = [
    '¡Fin del juego! Has detonado una mina.',
    'Intento fallido. El tablero ha explotado, ¡inténtalo de nuevo!',
    'Operación cancelada. Una mina ha sido activada en el terreno.',
    'Juego terminado. Has caído en una zona inestable.',
    '¡BOOM! Fin de la partida. Suerte para la próxima.',
    'Desactivación fallida. El área no pudo ser despejada a tiempo.',
    'Partida concluida. Tu racha ha terminado en esta casilla.'
  ];

  winMessages: string[] = [
    '¡Felicidades! Has despejado el tablero con éxito.',
    '¡Victoria! Todas las minas han sido localizadas de forma segura.',
    'Misión cumplida. Terreno asegurado y libre de peligros.',
    '¡Excelente trabajo! Has completado el juego sin errores.',
    '¡Estrategia perfecta! Has ganado la partida.'
  ];

  config = signal<Difficulty>(this.difficulties[0]);

  setConfig(difficulty: Difficulty): void {
    if (difficulty.level === 'Random') {
      this.setRandomConfig();
    } else {
      this.config.set(difficulty);
    }
  }

  setRandomConfig(): void {
    const randomDifficulty = this.generateRandomConfig();
    this.config.set(randomDifficulty);
  }

  generateRandomConfig(): Difficulty {
    const rows = Math.floor(Math.random() * (30 - 9 + 1)) + 9;
    const columns = Math.floor(Math.random() * (30 - 9 + 1)) + 9;
    const totalBox = rows * columns;
    const density = (Math.random() * (38 - 10) + 10) / 100;
    const mines = Math.max(1, Math.floor(totalBox * density));
    return { level: 'Random', rows, columns, mines };
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
    const difficultyMultiplier = 1 + (density * 3.5);
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
