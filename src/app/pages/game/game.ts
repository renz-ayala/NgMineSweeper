import { Component, OnInit, signal } from '@angular/core';
import { Box } from '../../model/box.model';

@Component({
  selector: 'app-game',
  imports: [],
  templateUrl: './game.html',
  styleUrl: './game.scss',
})
export class Game implements OnInit {
  rows = signal(10);
  columns = signal(10);
  mines = signal(15);
  board = signal<Box[][]>([]);
  isGameStarted = signal(false);
  isGameOver = signal(false);

  ngOnInit() {
    this.buildBoard();
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
    if (this.isGameOver()) {
      return;
    }
    if (!this.isGameStarted()) {
      this.putMines(rowIndex, columnIndex);
      this.isGameStarted.set(true);
    }
    this.board.update( updatedBoard => {
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
    let settedMines = 0;
    this.board.update( updatedBoard => {
      while (settedMines < this.mines()) {
        const randomRow = Math.floor(Math.random() * this.rows());
        const randomColumn = Math.floor(Math.random() * this.columns());
        const isFirstBoxClicked: boolean = randomRow === rowIndex && randomColumn === columnIndex;
        const thereIsMine: boolean = updatedBoard[randomRow][randomColumn].hasMine;
        if (!isFirstBoxClicked && !thereIsMine) {
          updatedBoard[randomRow][randomColumn].hasMine = true;
          settedMines++;
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

  flagBox(event: MouseEvent, rowIndex: number, columnIndex: number) {
    event.preventDefault();
    if (this.isGameOver() || this.board()[rowIndex][columnIndex].isRevealed) {
      return;
    }
    this.board.update( updatedBoard => {
      const box = updatedBoard[rowIndex][columnIndex];
      box.isFlagged = !box.isFlagged;
      return [...updatedBoard];
    });
  }
}


