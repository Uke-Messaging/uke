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
    this.currentKeypair = (await this.keyring.loadAccount()).keypair;
    this.currentAddress = this.currentKeypair.address;
    const addrs = await this.uke.getActiveConversations(
      this.currentKeypair.address
    );
    addrs.forEach(async (addr) => {
      console.log(addr.initiator, addr.recipient)
      const id = this.uke.generateConvoId(addr.initiator, addr.recipient);
      const msgs = await this.uke.getMessages(id);
      const convo: Conversation = {
        recipient: addr.recipient,
        id,
        sender: addr.initiator,
        messages: msgs,
        lastMessage: msgs[0],
      };
      this.convos.push(convo);
    });
  }

  // TODO: To active convo check to make sure one doesnt already exist for that id.
  async new() {
    const time = Date.now();
    const local = new Date(time).toLocaleTimeString('default');
    const msg: Message = {
      recipient: this.recipient,
      sender: this.currentKeypair.address,
      message: this.initialMessage,
      time: local,
      hash: '0x0000000000',
    };
    const id = this.uke.generateConvoId(this.currentKeypair.address, this.recipient);
    this.currentKeypair.lock();
    const convo: Conversation = {
      recipient: this.recipient,
      id,
      sender: this.currentKeypair.address,
      messages: [msg],
      lastMessage: msg,
    };
    await this.uke.sendMessage(this.currentKeypair, id, 'password', msg, time);
    this.convos.push(convo);
  }

  viewMessage(convo: Conversation) {
    console.log(convo);
    const navExtras: NavigationExtras = {
      state: { convo },
    };
    //TODO: replace this with dedicated service for convo passing
    this.router.navigate(['messageview'], navExtras);
  }
}
