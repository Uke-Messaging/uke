import { Injectable } from '@angular/core';
import { Message } from '../model/message.model';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Codec } from '@polkadot/types-codec/types';
import { hexToStr } from 'hexyjs';
import { KeyringPair } from '@polkadot/keyring/types';
import { sha3_256 } from 'js-sha3';
import { ActiveConversation } from '../model/conversation.model';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root',
})
export class UkePalletService {
  public api: ApiPromise;

  constructor() {}

  async init(url?: string) {
    const wsProvider = new WsProvider(url);
    this.api = await ApiPromise.create({ provider: wsProvider });
  }

  checkIsActiveConvo(obj: any): obj is ActiveConversation {
    return 'initator' in obj;
  }

  async getMessages(id: string): Promise<Message[]> {
    const messages: Codec = await this.api.query.uke.conversations(id);

    console.log('MSGS', messages);
    return this.parseMessages(messages);
  }

  public parseMessages(storage: Codec): Message[] {
    const messages: Message[] = JSON.parse(storage.toString());
    return messages.map((v) => {
      v.message = hexToStr(v.message.slice(2, v.message.length)) as string;
      v.time = new Date(v.time).toLocaleTimeString('default');
      return v;
    });
  }

  generateConvoId(sender: string, recipient: string): string {
    return sha3_256(sender + recipient);
  }

  async getActiveConversations(sender?: string): Promise<ActiveConversation[]> {
    const convoAddrs = await this.api.query.uke.activeConversations(
      sender
    );
    return JSON.parse(convoAddrs.toString());
  }

  // Gets the associated username for an account
  async getAddressFromUser(address: string): Promise<User> {
    const userCodec = await this.api.query.uke.usernames(address);
    const user: User = JSON.parse(userCodec.toString()) as User;
    const username = user.username;
    user.username = hexToStr(username.slice(2, username.length)) as string;
    return user;
  }

  // Assigns a new username and id to the identity mapping
  async assignUsername(username: string, signer: KeyringPair): Promise<any> {
    return await this.api.tx.uke.register(username).signAndSend(signer);
  }

  async sendMessage(
    signer: KeyringPair,
    id: string,
    message: Message,
    time: number
  ): Promise<any> {
    return await this.api.tx.uke
      .storeMessage(message.message, time, id, message.recipient)
      .signAndSend(signer);
  }
}
