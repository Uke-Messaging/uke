import { Component, OnInit } from '@angular/core';
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
  newUsername: string = '';
  currentKeypair: KeyringPair;

  constructor(private uke: UkePalletService, private keyring: KeyringService) {}
  async ngOnInit() {
    try {
      this.currentKeypair = await this.keyring.getCurrentAccount('default');
    } catch (_) {
      await this.keyring.createNewAccount('default', 'default', 'default');
      this.currentKeypair = await this.keyring.getCurrentAccount('default');
    }
    this.currentKeypair = await this.keyring.getCurrentAccount('default');
    
    console.log(this.currentKeypair)

    // await this.getUsername();
  }

  async register() {
    this.currentKeypair.unlock('default');
    await this.uke.assignUsername(this.newUsername, this.currentKeypair);
    // await this.getUsername();
    this.currentKeypair.lock();
  }
  // async getUsername() {
  //   this.username = await (
  //     await this.uke.getUsernameForAccount(this.currentKeypair.address)
  //   ).username;
  // }
}
