import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private isMuted = signal(false);

  private sounds: Record<string, HTMLAudioElement> = {
    click: new Audio('assets/sounds/Menu_Selection_Click.wav'),
    explosion: new Audio('assets/sounds/explosion.wav'),
    flag: new Audio('assets/sounds/camera.ogg'),
    win: new Audio('assets/sounds/BGM.ogg'),
    alert: new Audio('assets/sounds/sw_school_pa_alert.wav'),
    credits: new Audio('assets/sounds/tom_me_2_128.mp3'),
  };

  constructor() {
    Object.values(this.sounds).forEach((sound) => {
      sound.volume = 0.5;
    });
  }

  playSound(soundName: string): void {
    if (this.isMuted()) {
      return;
    }

    const sound = this.sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  }

  setMuted(mute: boolean): void {
    this.isMuted.set(mute);

    if (mute) {
      Object.values(this.sounds).forEach((sound) => sound.pause());
      this.toggleMute();
    }
  }

  toggleMute(): boolean {
    this.isMuted.set(!this.isMuted());
    return this.isMuted();
  }

}
