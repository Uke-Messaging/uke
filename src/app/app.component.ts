import { Component, OnInit } from '@angular/core';
import { KeyringService } from './services/keyring.service';
import { UkePalletService } from './services/ukepallet.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private keyring: KeyringService, private uke: UkePalletService) {
  }

  async ngOnInit() {
    await this.keyring.init();
    await this.uke.init();
  }
}
