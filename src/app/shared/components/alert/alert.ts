import { Component, inject } from '@angular/core';
import { AlertService } from '../../../core/services/alert-service';
import { NgClass } from '@angular/common';
import { LanguageService } from '../../../core/services/language-service';

@Component({
  selector: 'app-alert',
  imports: [NgClass],
  templateUrl: './alert.html',
})
export class Alert {
  alertService = inject(AlertService);
  langService = inject(LanguageService);

  alert = this.alertService.alertState;
}
