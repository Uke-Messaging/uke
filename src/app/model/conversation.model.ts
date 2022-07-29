import { Message } from "./message.model";
import { User } from "./user.model";

export interface Conversation {
    sender: User;
    recipient: User;
    lastMessage: Message;
    messages: Message[];
}