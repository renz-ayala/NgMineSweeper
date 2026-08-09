import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { Box } from '../../../core/models/box.model';
import { AlertService } from '../../../core/services/alert-service';
import { CounterPipe } from '../../../shared/pipes/counter-pipe';
import { GameConfigService } from '../../../core/services/game-config-service';
import { Router } from '@angular/router';
import { TimePipe } from '../../../shared/pipes/time-pipe';
import { Alert } from '../../../shared/components/alert/alert';
import { LanguageService } from '../../../core/services/language-service';
import { SoundService } from '../../../core/services/sound-service';
import { DetonationCancel } from '../../../shared/components/detonation-cancel/detonation-cancel';

@Component({
  selector: 'app-game',
  imports: [CounterPipe, Alert, DetonationCancel],
  providers: [TimePipe],
  templateUrl: './game.html',
})
export class Game implements OnInit {
  alertService = inject(AlertService);
  gameConfigService = inject(GameConfigService);
  langService = inject(LanguageService);
  soundService = inject(SoundService);
  router = inject(Router);
  timerPipe = inject(TimePipe);

  alertView = viewChild<ElementRef>('redirect');

  gameSettings = signal<Difficulty>(undefined as unknown as Difficulty);

  board = signal<Box[][]>([]);

  isGameStarted = signal(false);
  isGameOver = signal(false);
  timer = signal(0);

  revertCount = signal(0);
  showAd = signal(false);
  pendingBox = signal<{ pendingRow: number; pendingCol: number } | null>(null);

  isRandomGame = computed(
    () => {
      switch (this.gameSettings().level) {
        case 'Random':
        case 'Hobby':
          return true;
        default:
          return false;
      }
    }
  );

  minesLeft = computed(() => {
    let flaggedCount = 0;
    for (let x = 0; x < this.gameSettings().rows; x++) {
      for (let y = 0; y < this.gameSettings().columns; y++) {
        if (this.board()[x]?.[y]?.isFlagged) {
          flaggedCount++;
        }
      }
    }
    return this.gameSettings().mines - flaggedCount;
  });

  victory = computed(() => {
    if (this.isGameOver()) {
      return false;
    }

    for (let x = 0; x < this.gameSettings().rows; x++) {
      for (let y = 0; y < this.gameSettings().columns; y++) {
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
        this.soundService.playSound('win');
        const winMessage = this.getEndGameMessage();
        this.alertService.show(winMessage, 'success');
        this.revealNumbers();
        this.flagAllMines();
        this.redirect();
        const wasBetterTime = this.gameConfigService.assignBestTime(
          this.gameSettings().level,
          this.timer(),
        );

        if (wasBetterTime) {
          const formattedTimer = this.timerPipe.transform(this.timer());
          this.alertService.show(
            '',
            'achievement',
            `${this.langService.i18n().newRecord} ${formattedTimer}`,
          );
        }
      }
    });

    effect(() => {
      if (this.isGameOver()) {
        this.soundService.playSound('explosion');
        const lossMessage = this.getEndGameMessage();
        this.alertService.show(lossMessage, 'error');
        this.redirect();
      }
    });

    effect((onCleanup) => {
      if (this.isGameStarted() && !this.isGameOver() && !this.victory()) {
        const interval = setInterval(() => {
          this.timer.update((time) => time + 1);
        }, 1000);

        onCleanup(() => clearInterval(interval));
      }
    });
  }

  ngOnInit() {
    this.initGameConfig();
    this.buildBoard();
  }

  initGameConfig(): void {
    const config = this.gameConfigService.config();
    this.gameSettings.set(config);
  }

  buildBoard() {
    const matrix: Box[][] = [];
    for (let row = 0; row < this.gameSettings().rows; row++) {
      const matrixRow: Box[] = [];
      for (let column = 0; column < this.gameSettings().columns; column++) {
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
    this.soundService.playSound('click');
    if (!this.isGameStarted()) {
      this.putMines(rowIndex, columnIndex);
      this.isGameStarted.set(true);
    }
    this.board.update((updatedBoard) => {
      const box = updatedBoard[rowIndex][columnIndex];
      if (box.isFlagged) {
        return updatedBoard;
      }

      const isReversible = this.revertCount() < this.gameSettings().revertLimit;
      if (box.hasMine && isReversible) {
        this.soundService.playSound('alert');
        this.pendingBox.set({ pendingRow: rowIndex, pendingCol: columnIndex });
        this.showAd.set(true);
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
      while (plantedMines < this.gameSettings().mines) {
        const randomRow = Math.floor(Math.random() * this.gameSettings().rows);
        const randomColumn = Math.floor(Math.random() * this.gameSettings().columns);
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
    for (let x = 0; x < this.gameSettings().rows; x++) {
      for (let y = 0; y < this.gameSettings().columns; y++) {
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
        const withinlimits: boolean =
          xx >= 0 && xx < this.gameSettings().rows && yy >= 0 && yy < this.gameSettings().columns;

        if (withinlimits && updatedBoard[xx][yy].hasMine) {
          counter++;
        }
      }
    }
    return counter;
  }

  revealWay(row: number, column: number, updatedBoard: Box[][]) {
    const withinLimits: boolean =
      row >= 0 &&
      row < this.gameSettings().rows &&
      column >= 0 &&
      column < this.gameSettings().columns;
    if (!withinLimits) {
      return;
    }

    const box = updatedBoard[row][column];
    if (box.isRevealed || box.hasMine) {
      return;
    }

    box.isRevealed = true;
    box.isFlagged = false;

    if (box.minesAround === 0) {
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          this.revealWay(row + x, column + y, updatedBoard);
        }
      }
    }
  }

  revealMines(updatedBoard: Box[][]) {
    for (let x = 0; x < this.gameSettings().rows; x++) {
      for (let y = 0; y < this.gameSettings().columns; y++) {
        if (updatedBoard[x][y].hasMine) {
          updatedBoard[x][y].isRevealed = true;
        }
      }
    }
  }

  revealNumbers() {
    for (let x = 0; x < this.gameSettings().rows; x++) {
      for (let y = 0; y < this.gameSettings().columns; y++) {
        if (!this.board()[x][y].hasMine) {
          this.board()[x][y].isRevealed = true;
        }
      }
    }
  }

  flagAllMines() {
    for (let x = 0; x < this.gameSettings().rows; x++) {
      for (let y = 0; y < this.gameSettings().columns; y++) {
        if (this.board()[x][y].hasMine) {
          this.board()[x][y].isFlagged = true;
        }
      }
    }
  }

  flagBox(event: MouseEvent, rowIndex: number, columnIndex: number) {
    event.preventDefault();
    if (this.isGameOver() || this.victory() || this.gameSettings().isNoFlagMode) {
      return;
    }

    const box = this.board()[rowIndex][columnIndex];
    if (box.isRevealed) {
      return;
    }
    if (!box.isFlagged && this.minesLeft() <= 0) {
      return;
    }

    this.soundService.playSound('flag');
    this.board.update((updatedBoard) => {
      const updateBox = updatedBoard[rowIndex][columnIndex];
      updateBox.isFlagged = !updateBox.isFlagged;
      return [...updatedBoard];
    });
  }

  resetGame(event: MouseEvent) {
    event.preventDefault();
    if (!this.isGameStarted()) {
      return;
    }

    this.soundService.setMuted(true);
    this.resetState();
  }

  updateRandomBoard(): void {
    this.gameConfigService.setRandomConfig(this.gameSettings().level);
    this.initGameConfig();
    this.resetState();
  }

  resetState(): void {
    this.timer.set(0);
    this.isGameOver.set(false);
    this.isGameStarted.set(false);
    this.revertCount.set(0);
    this.buildBoard();
  }

  getEndGameMessage(): string {
    const message = this.gameConfigService.getRandomMessage(this.isGameOver());
    const score = this.gameConfigService.calcScore(
      this.gameSettings().rows,
      this.gameSettings().columns,
      this.gameSettings().mines,
      this.timer(),
      this.isGameOver(),
    );
    const wasBetterScore: boolean = this.gameConfigService.assignBestScore(
      this.gameSettings().level,
      score,
    );

    if (wasBetterScore && this.victory()) {
      this.alertService.show('', 'achievement', this.langService.i18n().highScoreUnlocked);
    }

    return this.langService
      .i18n()
      .scoreMessage.replace('{message}', message)
      .replace('{score}', score.toString());
  }

  redirect() {
    setTimeout(() => {
      this.alertView()?.nativeElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  }

  resumeGame(isExplosionCanceled: boolean): void {
    this.showAd.set(false);

    if (!this.pendingBox()) {
      return;
    }

    const resumeRow = this.pendingBox()!.pendingRow;
    const resumeCol = this.pendingBox()!.pendingCol;

    if (isExplosionCanceled) {
      this.revertCount.update((count) => count + 1);
      this.board.update((updateBoard) => {
        const box = updateBoard[resumeRow][resumeCol];
        box.isFlagged = !this.gameSettings().isNoFlagMode;
        return [...updateBoard];
      });
    } else {
      this.board.update((updateBoar) => {
        const box = updateBoar[resumeRow][resumeCol];
        box.isRevealed = true;
        this.isGameOver.set(true);
        this.revealMines(updateBoar);
        return [...updateBoar];
      });
    }
    this.pendingBox.set(null);
  }
}


