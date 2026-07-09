export interface Box {
  row: number;
  column: number;
  hasMine: boolean;
  isRevealed: boolean;
  isMarked: boolean;
  minesAround: number;
}
