export interface Alert {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
