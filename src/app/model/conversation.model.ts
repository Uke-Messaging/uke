import { Message } from './message.model';
import { User } from './user.model';

/**
 * Conversation
 *
 * @interface Conversation
 * @member {User} sender The conversation's The sender.
 * @member {string} id The conversation's id.
 * @member {User} recipient The conversation's recipient.
 * @member {Message} lastMessage The last message sent.
 * @member {Message[]} messages Conversation's messages.
 */
export interface Conversation {
  sender: User;
  id: string;
  recipient: User;
  lastMessage: Message;
  messages: Message[];
}

/**
 * Active Conversation.
 *
 * @interface ActiveConversation
 * @member {User} initiator The conversation's original initiator.
 * @member {User} recipient The conversation's original recipient.
 */
export interface ActiveConversation {
  initiator: User;
  recipient: User;
}
/**
 * Serialized Active Conversation.
 *
 * @interface ActiveConversationSerialized
 * @member {string} initiatorAddress The conversation's initiator's address.
 * @member {string} initiatorName The conversation's initiator's username.
 * @member {string} recipientAddress The conversation's recipient's address.
 * @member {string} recipientName The conversation's recipient's address.
 */
export interface ActiveConversationSerialized {
  initiatorAddress: string;
  initiatorName: string;
  recipientAddress: string;
  recipientName: string;
}
