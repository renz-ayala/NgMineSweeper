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
  mines = signal(10);
  board = signal<Box[][]>([]);
  isGameStarted = signal(false);

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
          isMarked: false,
          minesAround: 0,
        };
        matrixRow.push(box);
      }
      matrix.push(matrixRow);
    }
    this.board.set(matrix);
  }

  revealBox(rowIndex: number, columnIndex: number) {
    if (!this.isGameStarted()) {
      this.putMines(rowIndex, columnIndex);
      this.isGameStarted.set(true);
    }
    this.board.update( boardUpdated => {
      const box = boardUpdated[rowIndex][columnIndex];
      box.isRevealed = true;
      return [...boardUpdated];
    });
  }

  putMines(rowIndex: number, columnIndex: number) {
    let settedMines = 0;

    this.board.update( updatedBoard => {
      while (settedMines < this.mines()) {
        const randomRow = Math.floor(Math.random() * this.rows());
        const randomColumn = Math.floor(Math.random() * this.columns());
        const isFirstBoxClicked = randomRow === rowIndex && randomColumn === columnIndex;
        const thereIsMine = updatedBoard[randomRow][randomColumn].hasMine;
        if ( !isFirstBoxClicked && !thereIsMine ) {
          updatedBoard[randomRow][randomColumn].hasMine = true;
          settedMines++;
        }
      }
      return [...updatedBoard];
    });
  }
}


