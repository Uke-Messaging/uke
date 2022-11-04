import { User } from "./user.model";

export interface Message {
    recipient: string;
    sender: string;
    message: string;
    hash: string;
    time?: number | string;
}

export interface ApiMessage {
    sender: string;
    message: string;
}