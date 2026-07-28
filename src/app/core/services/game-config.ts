import { Injectable, signal } from '@angular/core';
import { RandomParams } from '../models/random-params.model';

@Injectable({
  providedIn: 'root',
})
export class GameConfigService {
  difficulties: Difficulty[] = [
    {
      level: 'Super Easy',
      rows: 9,
      columns: 9,
      mines: 10,
      description: 'Tablero 9 x 9 con 10 minas',
    },
    {
      level: 'Easy',
      rows: 10,
      columns: 10,
      mines: 15,
      description: 'Tablero 10 x 10 con 15 minas',
    },
    {
      level: 'Bathrooms Mode',
      rows: 16,
      columns: 9,
      mines: 22,
      description: 'Tablero de 16x9. Ideal para pasar el rato en el celular'
    },
    {
      level: 'Medium',
      rows: 16,
      columns: 16,
      mines: 40,
      description: 'Tablero 16 x 16 con 40 minas',
    },
    {
      level: 'Hard',
      rows: 16,
      columns: 30,
      mines: 99,
      description: 'Tablero 16 x 30 con 99 minas',
    },
    {
      level: 'Tryhard',
      rows: 20,
      columns: 24,
      mines: 168,
      description: 'Tablero 20 x 24 con 168 minas',
    },
    {
      level: 'Random',
      rows: 0,
      columns: 0,
      mines: 0,
      description: 'Tamaño y minas totalmente aleatorios',
    },
    {
      level: 'Hobby',
      rows: 0,
      columns: 0,
      mines: 0,
      description: 'Partidas casuales y aleatorias para pasar el rato',
    },
    {
      level: 'No Flags',
      rows: 13,
      columns: 33,
      mines: 60,
      description: 'Tablero 13 x 33 con 60 minas sin poder usar banderas',
    },
    //{ level: 'Campaign', rows: 0, columns: 0, mines: 0 },
  ];

  randomCap: RandomParams[] = [
    { level: 'Hobby', min: 20, max: 30, minDensity: 12.6, maxDensity: 14.6 },
    { level: 'Random', min: 9, max: 30, minDensity: 10, maxDensity: 38 },
  ];

  lossMessages: string[] = [
    '¡Fin del juego!',
    'Mala suerte',
    'Te recogieron en bolsa de basura.',
    'Tus restos cayeron en tres códigos postales.',
    'Soplaste la vela equivocada.',
    'Murió como vivió: sin pensar.',
    'Te convertiste en contenido educativo.',
    'Moriste haciendo lo que mejor sabes: probarla.',
    'Vitamina Z para los carroñeros.',
    'Como espectador de las gemelas.',
    'En pedacitos, como gringo en Vietnam',
    'Viste lo último que vio un argentino en las Malvinas.',
    'El forense pidió el rompecabezas en modo difícil.',
    'Moriste como leyenda... de los malos ejemplos.',
    'Darwin acaba de sonreír.',
  ];

  winMessages: string[] = [
    '¡Victoria!',
    '¡Excelente trabajo!',
    'Sorpresa: hoy no te lloran.',
    'La parca se quedó con las ganas.',
    'Hoy una familia de cuervos se queda sin comer.',
    'Hoy los cuervos cenan arroz.',
    'Hoy no acabaste como mexicano, en bolsa.',
    'Llegó navidad.',
  ];

  config = signal<Difficulty>(this.difficulties[0]);

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
    const { min, max, minDensity, maxDensity } = params;

    const { rows, columns } = this.getRandomRowsAndCols(max, min);
    const totalBox = rows * columns;

    const density = this.getRandomDensity(maxDensity, minDensity);

    const mines = Math.max(1, Math.floor(totalBox * density));
    return { level, rows, columns, mines };
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

  calcScore(rows: number, cols: number, mines: number, time: number, isLoss: boolean): number {
    const totalCells = rows * cols;
    if (totalCells === 0 || mines === 0) return 0;

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
