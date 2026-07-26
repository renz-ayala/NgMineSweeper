import { Component, inject } from '@angular/core';
import { AlertService } from '../../../core/services/alert-service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-alert',
  imports: [NgClass],
  templateUrl: './alert.html',
})
export class Alert {
  alertService = inject(AlertService);
  alert = this.alertService.alertState;
}
