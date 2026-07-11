import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Alert } from './pages/alert/alert';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Alert],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('NgMineSweeper');
}
