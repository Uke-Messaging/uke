import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Conversation } from '../model/conversation.model';
import { Message } from '../model/message.model';
import { User } from '../model/user.model';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  sampleSenderUser: User = {
    uniqueId: 'user1234',
    accountId: '000000000000',
    isOptedIn: true,
  };

  sampleRecipientUser: User = {
    uniqueId: 'user0000',
    accountId: '11111111111',
    isOptedIn: true,
  };

  sampleSentMessage: Message = {
    recipient: this.sampleRecipientUser,
    sender: this.sampleSenderUser,
    message: 'heyyy you available later?',
    hash: '0x0000000000',
    time: '8:34',
  };

  sampleRecievedMessage: Message = {
    recipient: this.sampleSenderUser,
    sender: this.sampleRecipientUser,
    message: 'i should be, yeah!',
    hash: '0x0000000000',
    time: '8:34',
  };

  convos: Conversation[] = [
    {
      recipient: this.sampleRecipientUser,
      sender: this.sampleSenderUser,
      messages: [
        this.sampleSentMessage,
        this.sampleRecievedMessage,
        this.sampleSentMessage,
        this.sampleRecievedMessage,
        this.sampleSentMessage,
        this.sampleRecievedMessage,
        this.sampleSentMessage,
        this.sampleRecievedMessage,
      ],
      lastMessage: this.sampleRecievedMessage,
    },
  ];

  constructor(private router: Router) {}

  viewMessage(convo: Conversation) {
    console.log(convo);
    const navExtras: NavigationExtras = {
      state: { convo },
    };
    this.router.navigate(['messageview'], navExtras);
  }
}
