import '@polkadot/api-augment/substrate';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Conversation } from '../model/conversation.model';
import { Message } from '../model/message.model';
import { StoredUser, User } from '../model/user.model';
import { KeyringService } from '../services/keyring.service';
import { UkePalletService } from '../services/ukepallet.service';
import { KeyringPair } from '@polkadot/keyring/types';
import { ConversationService } from '../services/conversation.service';
import { NotifService } from '../services/notif.service';
import { u8aToHex } from '@polkadot/util';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  convos: Conversation[] = [];
  convoIds: string[] = [];
  currentKeypair: KeyringPair;
  recipient: string = '';
  initialMessage: string = '';
  currentAddress: string = '';
  storedUser: StoredUser;
  messageSubscription: Subscription;
  messageObservable: Observable<Message>;
  audio: HTMLAudioElement;

  constructor(
    private router: Router,
    private keyring: KeyringService,
    private uke: UkePalletService,
    private conversationService: ConversationService,
    private notifService: NotifService
  ) {}
  async ngOnInit() {
    this.audio = new Audio('../../assets/uke-notif-sound.mp3');
    this.audio.volume = 0.08;

    await this.uke.init();
    this.storedUser = await this.keyring.loadAccount();
    this.currentKeypair = this.storedUser.keypair;
    this.currentAddress = this.currentKeypair.address;
    const addrs = await this.uke.getActiveConversations(
      this.currentKeypair.address
    );
    this.convos = await this.uke.getConversationsFromActive(
      addrs,
      this.currentAddress
    );
    this.convoIds = this.convos.map((c) => c.id);

    this.messageObservable = this.uke.watchIncomingMessages(
      this.convoIds,
      this.currentAddress
    );

    this.messageSubscription = this.messageObservable.subscribe(
      async (msg) => {
        console.log(msg);
        await this.notifService.showNotif(`New message: ${msg.message}`)
      }
    );

    this.uke
      .watchIncomingConversations(this.currentAddress)
      .subscribe(async (_) => {
        const convo = await this.uke.getConversationFromActive(
          _,
          this.currentAddress
        );
        if (!this.convoIds.includes(convo.id)) {
          this.addNewConvoAndListener(convo);
        }
      });
  }

  addNewConvoAndListener(convo: Conversation) {
    this.messageSubscription.unsubscribe();
    this.convos.push(convo);
    this.convoIds.push(convo.id);
    this.messageSubscription = this.messageObservable.subscribe(async (msg) => {
      await this.notifService.showNotif(`New message: ${msg.message}`);
      this.audio.play();
    });
  }

  async new() {
    const time = Date.now();
    const local = new Date(time).toLocaleTimeString('default');

    try {
      const recipientUserInfo = await this.uke.getUserInfo(this.recipient);
      const senderUserInfo = await this.uke.getUserInfo(
        this.storedUser.username
      );

      const encryptedMessage = this.keyring.encrypt(
        this.initialMessage,
        recipientUserInfo.accountId
      );

      const msg: Message = {
        recipient: recipientUserInfo.accountId,
        sender: this.currentKeypair.address,
        message: u8aToHex(encryptedMessage),
        time: local,
        hash: '0x0000000000',
      };

      const id = this.uke.generateConvoId(
        this.currentKeypair.address,
        recipientUserInfo.accountId
      );

      const decryptedMessage = this.keyring.decryptMessage(
        msg,
        this.currentAddress
      );

      const convo: Conversation = {
        recipient: recipientUserInfo,
        id,
        sender: senderUserInfo,
        messages: [decryptedMessage],
        lastMessage: decryptedMessage,
      };

      const authenticatedPair = this.keyring.loadAuthenticatedKeypair();
      await this.uke.sendMessage(
        authenticatedPair,
        id,
        msg,
        time,
        senderUserInfo.username,
        recipientUserInfo.username
      );
      this.addNewConvoAndListener(convo);
    } catch (_) {
      this.notifService.generalErrorAlert(
        `User ${this.recipient} does not exist!`
      );
    }
  }

  viewMessage(convo: Conversation) {
    this.conversationService.selectConversation(convo);
    this.router.navigate(['messageview']);
  }
}
