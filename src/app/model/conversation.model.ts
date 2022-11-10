import { Message } from './message.model';
import { User } from './user.model';

export interface Conversation {
  sender: User;
  id: string;
  recipient: User;
  lastMessage: Message;
  messages: Message[];
}

export interface ActiveConversation {
  initiator: User;
  recipient: User;
}

export interface ActiveConversationSerialized {
  initiatorAddress: string;
  initiatorName: string;
  recipientAddress: string;
  recipientName: string;
}
