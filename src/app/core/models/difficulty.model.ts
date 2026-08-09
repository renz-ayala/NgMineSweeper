interface Difficulty {
  level: string;
  rows: number;
  columns: number;
  mines: number;
  revertLimit: number;
  isNoFlagMode?: boolean;
}
