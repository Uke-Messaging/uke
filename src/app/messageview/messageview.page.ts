import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyringPair } from '@polkadot/keyring/types';
import { KeyringService } from '../services/keyring.service';
import { Conversation } from '../model/conversation.model';
import { Message } from '../model/message.model';
import { UkePalletService } from '../services/ukepallet.service';

@Component({
  selector: 'app-messageview',
  templateUrl: './messageview.page.html',
  styleUrls: ['./messageview.page.scss'],
})
export class MessageviewPage implements OnInit {
  recipient: string = '';
  sender: string = '';
  messages: Message[] = [];
  message: string = '';
  currentKeypair: KeyringPair;
  currentAddress = '';
  convo: Conversation;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private keyring: KeyringService,
    private uke: UkePalletService
  ) {
    this.route.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.convo = this.router.getCurrentNavigation().extras.state.convo;
        this.sender = this.convo.sender !== this.currentKeypair.address ? this.convo.sender : this.currentKeypair.address;
        this.recipient = this.convo.recipient === this.currentKeypair.address ? this.sender : this.convo.recipient;
        this.messages = this.convo.messages;

        console.log('CONVO RECIPIENT', this.recipient);
        console.log('CONVO SENDER', this.sender);
      }
    });
  }

  async send() {
    
    const time = Date.now();
    const local = new Date(time).toLocaleTimeString('default');

    const msg: Message = {
      recipient: this.recipient,
      sender: this.currentKeypair.address,
      message: this.message,
      time: local,
      hash: '0x0000000000',
    };

    console.log('NEW MESSAGE', msg);
    this.currentKeypair.unlock('default');
    await this.uke.sendMessage(this.currentKeypair, this.convo.id, msg, time);
    this.currentKeypair.lock();
    this.messages.push(msg);
    this.message = '';
  }

  async ngOnInit() {
    try {
      this.currentKeypair = await this.keyring.getCurrentAccount('default');
    } catch (_) {
      await this.keyring.createNewAccount('default', 'default', 'default');
      this.currentKeypair = await this.keyring.getCurrentAccount('default');
    }

    this.currentAddress = this.currentKeypair.address;
    const msgs = await this.uke.getMessages(this.convo.id);
    this.messages = msgs;
    this.uke.api.query.uke.conversations(this.convo.id, async (v) => {
      const newMsgs = this.uke.parseMessages(v);
      this.messages = newMsgs;
    });
  }
}
