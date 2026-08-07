import { Injectable, signal } from '@angular/core';
import { Alert } from '../models/alert.model';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private state = signal<Alert[]>([]);
  alertState = this.state.asReadonly();

  show(message: string, type: 'success' | 'error' | 'achievement' = 'success', title?: string) {
    const id = crypto.randomUUID();
    const newAlert: Alert = { id, message, type, title };

    this.state.update((alerts) => [...alerts, newAlert]);

    setTimeout(() => {
      this.close(id);
    }, 10000);
  }

  close(id: string) {
    this.state.update((alerts) => alerts.filter((a) => a.id !== id));
  }
}
