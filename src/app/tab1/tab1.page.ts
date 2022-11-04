import '@polkadot/api-augment/substrate';

import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ActiveConversation, Conversation } from '../model/conversation.model';
import { Message } from '../model/message.model';
import { User } from '../model/user.model';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { KeyringService } from '../services/keyring.service';
import { UkePalletService } from '../services/ukepallet.service';
import { KeyringPair } from '@polkadot/keyring/types';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  sampleRecievedMessage: Message = {
    recipient: '1',
    sender: '2',
    message: 'i should be, yeah!',
    hash: '0x0000000000',
    time: 1,
  };

  convos: Conversation[] = [];
  currentKeypair: KeyringPair;
  recipient: string = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  initialMessage: string = 'hihi';
  currentAddress: string = '';

  constructor(
    private router: Router,
    private keyring: KeyringService,
    private uke: UkePalletService
  ) {
    console.log('oh lawd jetson made anotha one');
  }
  async ngOnInit() {
    await this.uke.init();
    try {
      this.currentKeypair = await this.keyring.getCurrentAccount('default');
    } catch (_) {
      await this.keyring.createNewAccount('default', 'default', 'default');
      this.currentKeypair = await this.keyring.getCurrentAccount('default');
    }
    this.currentKeypair = await this.keyring.getCurrentAccount('default');

    this.currentAddress = this.currentKeypair.address;
    const addrs = await this.uke.getActiveConversations(
      this.currentKeypair.address
    );

    console.log("ACTIVE", addrs);

    addrs.forEach(async (addr) => {
      const id = this.uke.generateConvoId(addr.initator, addr.recipient);
      const msgs = await this.uke.getMessages(id);

      const convo: Conversation = {
        recipient: addr.recipient,
        id,
        sender: addr.initator,
        messages: msgs,
        lastMessage: msgs[0],
      };
      this.convos.push(convo);
    });
  }

  async new() {
    const time = Date.now();
    const msg: Message = {
      recipient: this.recipient,
      sender: this.currentKeypair.address,
      message: this.initialMessage,
      hash: '0x0000000000',
    };
    this.currentKeypair.unlock('default');
    const newActiveConvo: ActiveConversation = {
      initator: this.currentKeypair.address,
      recipient: this.recipient,
    };
    const id = this.uke.generateConvoId(newActiveConvo.initator, newActiveConvo.recipient);
    await this.uke.sendMessage(this.currentKeypair, id, msg, time);
    this.currentKeypair.lock();
    const msgs = await this.uke.getMessages(id);
    const convo: Conversation = {
      recipient: newActiveConvo.recipient,
      id,
      sender: newActiveConvo.initator,
      messages: msgs,
      lastMessage: msgs[0],
    };
    this.convos.push(convo);
  }

  viewMessage(convo: Conversation) {
    console.log(convo);
    const navExtras: NavigationExtras = {
      state: { convo },
    };
    this.router.navigate(['messageview'], navExtras);
  }
}
