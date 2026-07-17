import { Component, inject } from '@angular/core';
import { AlertService } from '../../../core/services/alert-service';

@Component({
  selector: 'app-alert',
  imports: [],
  templateUrl: './alert.html',
})
export class Alert {
  alertService = inject(AlertService);
  alert = this.alertService.alertState;
}
