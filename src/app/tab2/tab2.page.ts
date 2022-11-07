import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { KeyringPair } from '@polkadot/keyring/types';
import { KeyringService } from '../services/keyring.service';
import { UkePalletService } from '../services/ukepallet.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  username: string = '';

  constructor(
    private uke: UkePalletService,
    private keyring: KeyringService,
    private nav: NavController
  ) {}
  async ngOnInit() {}

  async logout() {
    await this.keyring.logOut();
    await this.nav.navigateRoot('/signup');
  }

  // async getUsername() {
  //   this.username = await (
  //     await this.uke.getUsernameForAccount(this.currentKeypair.address)
  //   ).username;
  // }
}
