import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { Box } from '../../../core/models/box.model';
import { AlertService } from '../../../core/services/alert-service';
import { CounterPipe } from '../../../shared/pipes/counter-pipe';
import { GameConfigService } from '../../../core/services/game-config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  imports: [CounterPipe],
  templateUrl: './game.html',
})
export class Game implements OnInit, OnDestroy {
  alertService = inject(AlertService);
  gameConfigService = inject(GameConfigService);
  router = inject(Router);

  private timerId: ReturnType<typeof setInterval> | null = null;

  alertView = viewChild<ElementRef>('redirect');

  rows = signal(10);
  columns = signal(10);
  mines = signal(15);
  level = signal('Easy');
  board = signal<Box[][]>([]);
  isGameStarted = signal(false);
  isGameOver = signal(false);
  timer = signal(0);

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
    if (this.isGameOver()) {
      return false;
    }

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
      if (this.victory()) {
        const winMessage = this.getEndGameMessage();
        this.alertService.show(winMessage, 'success');
        this.revealNumbers();
        this.flagAllMines();
        this.redirect();
      }
    });

    effect(() => {
      if (this.isGameOver()) {
        const lossMessage = this.getEndGameMessage();
        this.alertService.show(lossMessage, 'error');
        this.redirect();
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
    this.initGameConfig();
    this.buildBoard();
  }

  initGameConfig(): void {
    const config = this.gameConfigService.config();
    this.rows.set(config.rows);
    this.columns.set(config.columns);
    this.mines.set(config.mines);
    this.level.set(config.level);
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
    const withinLimits: boolean = row >= 0 && row < this.rows() && column >= 0 && column < this.columns();
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
    if (!this.isGameStarted()) {
      return;
    }
    this.resetState();
  }

  updateRandomBoard(): void {
    this.gameConfigService.setRandomConfig();
    this.initGameConfig();
    this.resetState();
  }

  resetState(): void {
    this.timer.set(0);
    this.isGameOver.set(false);
    this.isGameStarted.set(false);
    this.buildBoard();
  }

  getEndGameMessage(): string {
    const message = this.gameConfigService.getRandomMessage(this.isGameOver());
    const score = this.gameConfigService.calcScore(this.rows(), this.columns(), this.mines(), this.timer(), this.isGameOver());
    return `${message}. Tu puntaje fue de ${score}`;
  }

  redirect(){
    setTimeout(() => {
      this.alertView()?.nativeElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  }
}


