import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

declare const window: any;

async function start() {
  if (window.CrazyGames?.SDK) {
    try {
      await window.CrazyGames.SDK.init();
    } catch (err) {
      console.error('CrazyGames SDK error:', err);
    }
  }
  bootstrapApplication(App, appConfig).catch((err) => console.error(err));
}

start();
