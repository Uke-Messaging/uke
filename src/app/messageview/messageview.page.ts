import { Component, OnInit } from '@angular/core';
import { KeyringPair } from '@polkadot/keyring/types';
import { KeyringService } from '../services/keyring.service';
import { Conversation } from '../model/conversation.model';
import { Message } from '../model/message.model';
import { UkePalletService } from '../services/ukepallet.service';
import { ConversationService } from '../services/conversation.service';
import { User } from '../model/user.model';
import { AlertController } from '@ionic/angular';
import { u8aToHex } from '@polkadot/util';

@Component({
  selector: 'app-messageview',
  templateUrl: './messageview.page.html',
  styleUrls: ['./messageview.page.scss'],
})
export class MessageviewPage implements OnInit {
  recipient: User;
  sender: User;
  messages: Message[] = [];
  message: string = '';
  currentKeypair: KeyringPair;
  currentAddress = '';
  convo: Conversation;

  constructor(
    private keyring: KeyringService,
    private uke: UkePalletService,
    private conversationService: ConversationService,
  ) {}

  async send() {
    const time = Date.now();
    const local = new Date(time).toLocaleTimeString('default');
    const encryptedMessage = this.keyring.encrypt(this.message, this.recipient.accountId);
    const msg: Message = {
      recipient: this.recipient.accountId,
      sender: this.currentKeypair.address,
      message: u8aToHex(encryptedMessage),
      time: local,
      hash: '0x0000000000',
    };
    const authenticatedPair = this.keyring.loadAuthenticatedKeypair();

    await this.uke.sendMessage(
      authenticatedPair,
      this.convo.id,
      msg,
      time,
      this.sender.username,
      this.recipient.username
    );
    this.messages.push(this.keyring.decryptMessage(msg, this.currentAddress));
    this.message = '';
  }

  async ngOnInit() {
    this.convo = this.conversationService.getSelectedConversation();
    this.currentKeypair = await (await this.keyring.loadAccount()).keypair;
    this.currentAddress = this.currentKeypair.address;
    this.sender = this.convo.sender;
    this.recipient =
      this.convo.recipient.accountId === this.currentKeypair.address
        ? this.sender
        : this.convo.recipient;
    this.messages = this.convo.messages;
    const msgs = await this.uke.getMessages(this.convo.id, this.currentAddress);
    this.messages = msgs;

    this.uke.watchIncomingMessages([this.convo.id], this.currentKeypair.address).subscribe((v) => {
      this.messages.push(v);
    });
  }
}
