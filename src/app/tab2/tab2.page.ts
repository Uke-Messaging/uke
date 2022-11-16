import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { KeyringService } from '../services/keyring.service';
import { UkePalletService } from '../services/ukepallet.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  username: string = '';
  address: string = '';
  numberOfActiveConversations: number = 0;

  constructor(
    private uke: UkePalletService,
    private keyring: KeyringService,
    private nav: NavController
  ) {}

  async ngOnInit() {
    await this.uke.init();
    const current = await this.keyring.loadAccount();
    this.username = current.username;
    this.address = current.address;
    const active = await this.uke.getActiveConversations(this.address);
    this.numberOfActiveConversations = active.length;
  }

  async logout() {
    await this.keyring.logOut();
    await this.nav.navigateRoot('/signup');
  }

}
