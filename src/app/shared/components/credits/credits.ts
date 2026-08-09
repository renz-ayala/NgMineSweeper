import { Component, output, signal } from '@angular/core';

export interface Credit {
  name: string;
  author: string;
  uri: string;
  license: 'CC-BY 3.0' | 'CC0' | 'CC BY 4.0';
}

@Component({
  selector: 'app-credits',
  imports: [],
  templateUrl: './credits.html',
})
export class Credits {
  close = output();
  creditList = signal<Credit[]>([
    { name: 'sw_school_pa_alert', author: 'jppi_Stu', uri: 'Freesound.org', license: 'CC BY 4.0' },
    {
      name: 'WGS Music #40 - vs Tom #2 [Loops]',
      author: 'Retimer',
      uri: 'OpenGameArt.org',
      license: 'CC-BY 3.0',
    },
    { name: 'Bomb explosion', author: 'Alekei', uri: 'OpenGameArt.org', license: 'CC-BY 3.0' },
    {
      name: 'Evolutius (Music)',
      author: 'VividReality',
      uri: 'OpenGameArt.org',
      license: 'CC-BY 3.0',
    },
    {
      name: 'Menu Selection Click',
      author: 'NenadSimic',
      uri: 'OpenGameArt.org',
      license: 'CC-BY 3.0',
    },
    {
      name: 'Virus Warning Icon (Modified color via CSS)',
      author: 'knik1985',
      uri: 'OpenGameArt.org',
      license: 'CC-BY 3.0',
    },
    { name: 'clapperboard - claqueta',
      author: 'DREAM_SEARCH_REPEAT',
      uri: 'OpenGameArt.org',
      license: 'CC0',
    },
    { name: 'Bomb Sprite', author: 'Znevs', uri: 'OpenGameArt.org', license: 'CC0' },
    { name: 'Swords Icon', author: 'BorisMedvedev', uri: 'OpenGameArt.org', license: 'CC0' },
    { name: 'Dynamite', author: 'Kutejnikov', uri: 'OpenGameArt.org', license: 'CC0' },
    {
      name: 'Red Horn Land Monster',
      author: 'bevouliin.com',
      uri: 'OpenGameArt.org',
      license: 'CC0',
    },
    { name: 'Cubikopp smilies', author: 'Sebastian Kraft', uri: 'OpenGameArt.org', license: 'CC0' },
    { name: 'Minesweeper Tile Set', author: 'eugeneloza', uri: 'OpenGameArt.org', license: 'CC0' },
    { name: 'Eye of Sender', author: 'Umplix', uri: 'OpenGameArt.org', license: 'CC0' },
    { name: 'Explosion SFX', author: 'TinyWorlds', uri: 'OpenGameArt.org', license: 'CC0' },
    { name: 'CameraShudder', author: 'FacadeGaikan', uri: 'OpenGameArt.org', license: 'CC0' },
  ]);

  closeCredits() {
    this.close.emit();
  }

  getLicenseColorClass(license: string): string {
    switch (license) {
      case 'CC-BY 3.0':
        return 'text-emerald-400';
      case 'CC BY 4.0':
        return 'text-sky-400';
      default:
        return 'text-slate-400';
    }
  }
}
