import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Box } from '../../model/box.model';
import { AlertService } from '../../services/alert-service';
import { CounterPipe } from '../../pipes/counter-pipe';
import { GameConfigService } from '../../services/game-config';

@Component({
  selector: 'app-game',
  imports: [CounterPipe],
  templateUrl: './game.html',
})
export class Game implements OnInit, OnDestroy {
  alertService = inject(AlertService);
  gameConfigService = inject(GameConfigService);

  private timerId: ReturnType<typeof setInterval> | null = null;

  rows = signal(10);
  columns = signal(10);
  mines = signal(15);
  level = signal('Easy');
  board = signal<Box[][]>([]);
  isGameStarted = signal(false);
  isGameOver = signal(false);
  timer = signal(0);

  lossMessages: string[] = [
    'KABOOM! Así se sintió Chernobyl...',
    'Boom!! Viviste lo que vivió un soldado gringo en Vietnam.',
    '¡BOOM! Acabas de recrear Hiroshima en un tablero.',
    'Te fue peor que a la armada argentina en las Malvinas.',
    'KABOOM. Bienvenido a la base de datos de daños colaterales de la ONU.',
    'UY como las gemelas.',
  ];

  winMessages: string[] = [
    'Respiraste la nunca de la muerte.',
    'Counter terrorist win.',
    'Área despejada. Acabas de jubilar a tres escuadrones antibombas.',
    '«MISSION PASSED» No hay efectos de sonido.',
  ];

  minesLeft = computed(() => {
    let flaggedCount = 0;
    for (let x = 0; x < this.rows(); x++) {
      for (let y = 0; y < this.columns(); y++) {
        if (this.board()[x]?.[y]?.isFlagged) {
          flaggedCount++;
        }
      }
    }
    return this.mines() - flaggedCount;
  });

  victory = computed(() => {
    for (let x = 0; x < this.rows(); x++) {
      for (let y = 0; y < this.columns(); y++) {
        const currentBox = this.board()[x][y];
        if (!currentBox.hasMine && !currentBox.isRevealed) {
          return false;
        }
      }
    }
    return true;
  });

  constructor() {
    effect(() => {
      if (this.isGameOver()) {
        const lossMessage = this.getEndGameMessage(this.lossMessages);
        this.alertService.show(lossMessage, 'error');
      }
      if (this.victory()) {
        const winMessage = this.getEndGameMessage(this.winMessages);
        this.alertService.show(winMessage, 'success');
        this.revealNumbers();
        this.flagAllMines();
      }
    });
    effect(() => {
      if (this.isGameStarted() && !this.isGameOver() && !this.victory()) {
        this.timerId = setInterval(() => {
          this.timer.update((time) => time + 1);
        }, 1000);
      } else {
        if (this.timerId) {
          clearInterval(this.timerId);
          this.timerId = null;
        }
      }
    });
  }

  ngOnInit() {
    const config = this.gameConfigService.config();
    this.rows.set(config.rows);
    this.columns.set(config.columns);
    this.mines.set(config.mines);
    this.level.set(config.level);
    this.buildBoard();
  }

  ngOnDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  buildBoard() {
    const matrix: Box[][] = [];
    for (let row = 0; row < this.rows(); row++) {
      const matrixRow: Box[] = [];
      for (let column = 0; column < this.columns(); column++) {
        let box: Box = {
          row: row,
          column: column,
          hasMine: false,
          isRevealed: false,
          isFlagged: false,
          minesAround: 0,
        };
        matrixRow.push(box);
      }
      matrix.push(matrixRow);
    }
    this.board.set(matrix);
  }

  revealBox(rowIndex: number, columnIndex: number) {
    if (this.isGameOver() || this.victory()) {
      return;
    }
    if (!this.isGameStarted()) {
      this.putMines(rowIndex, columnIndex);
      this.isGameStarted.set(true);
    }
    this.board.update((updatedBoard) => {
      const box = updatedBoard[rowIndex][columnIndex];
      if (box.isFlagged) {
        return updatedBoard;
      }
      if (box.hasMine) {
        box.isRevealed = true;
        this.isGameOver.set(true);
        this.revealMines(updatedBoard);
        return [...updatedBoard];
      }
      this.revealWay(rowIndex, columnIndex, updatedBoard);
      return [...updatedBoard];
    });
  }

  putMines(rowIndex: number, columnIndex: number) {
    let plantedMines = 0;
    this.board.update((updatedBoard) => {
      while (plantedMines < this.mines()) {
        const randomRow = Math.floor(Math.random() * this.rows());
        const randomColumn = Math.floor(Math.random() * this.columns());
        const isFirstBoxClicked: boolean = randomRow === rowIndex && randomColumn === columnIndex;
        const thereIsMine: boolean = updatedBoard[randomRow][randomColumn].hasMine;
        if (!isFirstBoxClicked && !thereIsMine) {
          updatedBoard[randomRow][randomColumn].hasMine = true;
          plantedMines++;
        }
      }
      this.putNumbers(updatedBoard);
      return [...updatedBoard];
    });
  }

  putNumbers(updatedBoard: Box[][]) {
    for (let x = 0; x < this.rows(); x++) {
      for (let y = 0; y < this.columns(); y++) {
        if (!updatedBoard[x][y].hasMine) {
          updatedBoard[x][y].minesAround = this.countMinesAround(x, y, updatedBoard);
        }
      }
    }
  }

  countMinesAround(row: number, column: number, updatedBoard: Box[][]) {
    let counter = 0;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        const xx = row + x;
        const yy = column + y;
        const withinlimits: boolean = xx >= 0 && xx < this.rows() && yy >= 0 && yy < this.columns();
        if (withinlimits && updatedBoard[xx][yy].hasMine) {
          counter++;
        }
      }
    }
    return counter;
  }

  revealWay(row: number, column: number, updatedBoard: Box[][]) {
    const withinLimits: boolean =
      row >= 0 && row < this.rows() && column >= 0 && column < this.columns();
    if (!withinLimits) {
      return;
    }

    const box = updatedBoard[row][column];
    if (box.isRevealed || box.hasMine) {
      return;
    }

    box.isRevealed = true;
    if (box.minesAround === 0) {
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          this.revealWay(row + x, column + y, updatedBoard);
        }
      }
    }
  }

  revealMines(updatedBoard: Box[][]) {
    for (let x = 0; x < this.rows(); x++) {
      for (let y = 0; y < this.columns(); y++) {
        if (updatedBoard[x][y].hasMine) {
          updatedBoard[x][y].isRevealed = true;
        }
      }
    }
  }

  revealNumbers() {
    for (let x = 0; x < this.rows(); x++) {
      for (let y = 0; y < this.columns(); y++) {
        if (!this.board()[x][y].hasMine) {
          this.board()[x][y].isRevealed = true;
        }
      }
    }
  }

  flagAllMines() {
    for (let x = 0; x < this.rows(); x++) {
      for (let y = 0; y < this.columns(); y++) {
        if (this.board()[x][y].hasMine) {
          this.board()[x][y].isFlagged = true;
        }
      }
    }
  }

  flagBox(event: MouseEvent, rowIndex: number, columnIndex: number) {
    event.preventDefault();
    if (this.isGameOver() || this.victory() || this.board()[rowIndex][columnIndex].isRevealed) {
      return;
    }
    this.board.update((updatedBoard) => {
      const box = updatedBoard[rowIndex][columnIndex];
      box.isFlagged = !box.isFlagged;
      return [...updatedBoard];
    });
  }

  resetGame(event: MouseEvent) {
    event.preventDefault();
    this.timer.set(0);
    this.isGameOver.set(false);
    this.isGameStarted.set(false);
    this.buildBoard();
  }

  getEndGameMessage(list: string[]): string {
    const index = Math.floor(Math.random() * list.length);
    return `${list[index]}. Tu puntaje fue de ${this.timer()} en el nivel ${this.level()}[${this.mines()}]`;
  }

  getNumberColor(minesAround: number): string {
    const colors: Record<number, string> = {
      1: 'text-info font-extrabold',
      2: 'text-success font-extrabold',
      3: 'text-error font-black text-sm',
      4: 'text-secondary font-black text-sm',
      5: 'text-neutral-content bg-neutral p-0.5 rounded animate-pulse',
      6: 'text-error bg-error/20 p-0.5 rounded font-black animate-bounce',
      7: 'text-error bg-error/30 p-0.5 rounded font-black uppercase tracking-tighter',
      8: 'text-black bg-red-600 px-1 rounded font-black text-center',
    };
    return colors[minesAround] || 'text-base-content';
  }
}


