export interface Box {
  row: number;
  column: number;
  hasMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  minesAround: number;
}
