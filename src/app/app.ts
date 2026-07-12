import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Alert } from './pages/alert/alert';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Alert],
  templateUrl: './app.html',
})
export class App implements OnInit {
  router = inject(Router);
  protected readonly title = signal('NgMineSweeper');

  ngOnInit() {
    this.router.navigate(['/menu']);
  }

}
