import { Component, OnInit, ViewChild } from '@angular/core';
import { KeyringPair } from '@polkadot/keyring/types';
import { KeyringService } from '../services/keyring.service';
import { Conversation } from '../model/conversation.model';
import { Message } from '../model/message.model';
import { UkePalletService } from '../services/ukepallet.service';
import { ConversationService } from '../services/conversation.service';
import { User } from '../model/user.model';
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
    private conversationService: ConversationService
  ) {}

  // Sends a new message
  async send() {
    if (this.message.length > 0 || this.message !== '') {
      const time = Date.now();
      const local = new Date(time).toLocaleTimeString('default');
      const encryptedMessage = this.keyring.encrypt(
        this.message,
        this.recipient.accountId
      );
      const msg: Message = {
        recipient: this.recipient.accountId,
        sender: this.currentKeypair.address,
        message: u8aToHex(encryptedMessage),
        time: local,
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
  }

  // Gets the component ready for usage.
  async ngOnInit() {
    this.convo = this.conversationService.getSelectedConversation();
    this.currentKeypair = await (await this.keyring.loadAccount()).keypair;
    this.currentAddress = this.currentKeypair.address;
    console.log(this.currentAddress);
    this.sender = this.convo.sender;
    this.recipient =
      this.convo.recipient.accountId === this.currentKeypair.address
        ? this.sender
        : this.convo.recipient;
    const msgs = await this.uke.getMessages(this.convo.id, this.currentAddress);
    this.messages = msgs;
    console.log(msgs);

    this.uke
      .watchIncomingMessages([this.convo.id], this.currentKeypair.address)
      .subscribe((v) => {
        console.log(v);
        const recipientMessages = this.messages.filter(
          (v) =>
            v.recipient == this.recipient.accountId ||
            v.sender == this.recipient.accountId
        );
        if (v.time != recipientMessages[recipientMessages.length - 1].time)
          this.messages.push(v);
      });
  }
}
