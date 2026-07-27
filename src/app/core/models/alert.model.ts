export interface Alert {
  id: string;
  message: string;
  type: 'success' | 'error' | 'achievement';
  title?: string;
}
