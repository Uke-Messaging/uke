import { User } from "./user.model";

export interface Message {
    recipient: User;
    sender: User;
    message: string;
    hash: string;
    time: string;
}