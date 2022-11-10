import { Injectable } from '@angular/core';
import { Conversation } from '../model/conversation.model';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private selectedConversation: Conversation;

  constructor() {}

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
  }

  getSelectedConversation(): Conversation {
    return this.selectedConversation;
  }
}
