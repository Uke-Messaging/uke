import { Injectable } from '@angular/core';
import { Conversation } from '../model/conversation.model';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private selectedConversation: Conversation;

  constructor() {}

  // Selects a conversation to be used later
  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
  }

  // Gets the currently selected conversation
  getSelectedConversation(): Conversation {
    return this.selectedConversation;
  }
}
