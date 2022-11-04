import { Message } from './message.model';
import { User } from './user.model';

export interface Conversation {
  sender: string;
  id: string;
  recipient: string;
  lastMessage: Message;
  messages: Message[];
}

export interface ActiveConversation {
  initator: string;
  recipient: string;
}
