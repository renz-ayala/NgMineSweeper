interface Difficulty {
  level: 'Super Easy' | 'Easy' | 'Medium' | 'Hard' | 'Tryhard' | 'Random';
  rows: number;
  columns: number;
  mines: number;
}
