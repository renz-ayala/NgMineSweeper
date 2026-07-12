import { Injectable, signal } from '@angular/core';
import { Alert } from '../model/alert.model';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  defaultAlert = signal<Alert>({ show: false, message: '', type: 'info' });

  private state = signal<Alert>(this.defaultAlert());
  alertState = this.state.asReadonly();

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    const newAlert: Alert = { show: true, message, type, };
    this.state.set(newAlert);

    setTimeout(() => {
      this.close();
    }, 10000);
  }

  close() {
    this.state.update((current) => ({ ...current, show: false }));
  }
}
