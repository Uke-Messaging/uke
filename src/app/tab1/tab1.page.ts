import '@polkadot/api-augment/substrate';

import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ActiveConversation, Conversation } from '../model/conversation.model';
import { Message } from '../model/message.model';
import { StoredUser, User } from '../model/user.model';
import { KeyringService } from '../services/keyring.service';
import { UkePalletService } from '../services/ukepallet.service';
import { KeyringPair } from '@polkadot/keyring/types';
import { ConversationService } from '../services/conversation.service';
import { NotifService } from '../services/notif.service';

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
  convoIds: string[] = [];
  currentKeypair: KeyringPair;
  recipient: string = 'badery';
  initialMessage: string = 'hihi';
  currentAddress: string = '';
  storedUser: StoredUser;

  constructor(
    private router: Router,
    private keyring: KeyringService,
    private uke: UkePalletService,
    private conversationService: ConversationService,
    private notifService: NotifService
  ) {}

  async ngOnInit() {
    await this.uke.init();
    this.storedUser = await this.keyring.loadAccount();
    this.currentKeypair = this.storedUser.keypair;
    if (this.keyring.getKeypairLockStatus()) {
      await this.notifService.askForPasswordAlert(this.currentKeypair);
    }
    this.currentAddress = this.currentKeypair.address;
    const addrs = await this.uke.getActiveConversations(
      this.currentKeypair.address
    );
    this.convos = await this.uke.getConversationsFromActive(addrs);
    this.convoIds = this.convos.map((c) => c.id);
    console.log(this.convos);
    this.convos.forEach((convo) =>
    // need to find an efficient way to listen to each id on its own stream, and act accordingly
      this.uke
        .watchIncomingMessages(this.convoIds, this.currentAddress)
        .subscribe(async (msg) => {
          console.log(msg);
          await this.notifService.showNotif(
            `${convo.sender.username}: ${msg.message}`
          );
        })
    );

    this.uke
      .watchIncomingConversations(this.currentAddress)
      .subscribe(async (_) => {
        const convo = await this.uke.getConversationFromActive(_);
        if (!this.convoIds.includes(convo.id)) {
          this.convos.push(convo);
        }
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

      const msg: Message = {
        recipient: recipientUserInfo.accountId,
        sender: this.currentKeypair.address,
        message: this.initialMessage,
        time: local,
        hash: '0x0000000000',
      };

      const id = this.uke.generateConvoId(
        this.currentKeypair.address,
        recipientUserInfo.accountId
      );

      this.currentKeypair.lock();
      const convo: Conversation = {
        recipient: recipientUserInfo,
        id,
        sender: senderUserInfo,
        messages: [msg],
        lastMessage: msg,
      };
      const authenticatedPair = this.keyring.loadAuthenticatedKeypair();
      console.log(authenticatedPair);
      await this.uke.sendMessage(
        authenticatedPair,
        id,
        msg,
        time,
        senderUserInfo.username,
        recipientUserInfo.username
      );
      this.convos.push(convo);
      this.keyring.setNewContact({
        address: recipientUserInfo.accountId,
        name: recipientUserInfo.username,
      });
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
