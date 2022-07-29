import { Component } from '@angular/core';
import { Conversation } from '../model/conversation.model';
import { Message } from '../model/message.model';
import { User } from '../model/user.model';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  sampleUser: User = {
    uniqueId: 'user1234',
    accountId: '000000000000',
    isOptedIn: true,
  };

  sampleMessage: Message= {
    recipient: this.sampleUser,
    sender: this.sampleUser,
    message: 'heyyy you available later?',
    hash: '0x0000000000',
    time: "8:34"
  };

  convos: Conversation[] = [
    {
      recipient: this.sampleUser,
      sender: this.sampleUser,
      messages: [this.sampleMessage],
      lastMessage: this.sampleMessage
    },
    {
      recipient: this.sampleUser,
      sender: this.sampleUser,
      messages: [this.sampleMessage],
      lastMessage: this.sampleMessage
    },
    {
      recipient: this.sampleUser,
      sender: this.sampleUser,
      messages: [this.sampleMessage],
      lastMessage: this.sampleMessage
    },
    {
      recipient: this.sampleUser,
      sender: this.sampleUser,
      messages: [this.sampleMessage],
      lastMessage: this.sampleMessage
    },
    {
      recipient: this.sampleUser,
      sender: this.sampleUser,
      messages: [this.sampleMessage],
      lastMessage: this.sampleMessage
    },
  ];

  constructor() {}
}
