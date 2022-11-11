import { Injectable } from '@angular/core';
import { Message } from '../model/message.model';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Codec } from '@polkadot/types-codec/types';
import { hexToStr } from 'hexyjs';
import { KeyringPair } from '@polkadot/keyring/types';
import { sha3_256 } from 'js-sha3';
import {
  ActiveConversation,
  ActiveConversationSerialized,
  Conversation,
} from '../model/conversation.model';
import { User } from '../model/user.model';
import { Observable } from 'rxjs';

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

  private hexStrParser(hex: string): string {
    return hexToStr(hex.slice(2, hex.length)) as string;
  }

  async getActiveConversations(sender?: string): Promise<ActiveConversation[]> {
    const convoAddrs = await this.api.query.uke.activeConversations(sender);
    const serializedActiveConversations: ActiveConversationSerialized[] =
      JSON.parse(convoAddrs.toString());
    return serializedActiveConversations.map((convo) => {
      return {
        initiator: {
          accountId: convo.initiatorAddress,
          username: this.hexStrParser(convo.initiatorName),
        },
        recipient: {
          accountId: convo.recipientAddress,
          username: this.hexStrParser(convo.recipientName),
        },
      };
    });
  }

  async getConversationsFromActive(
    convos: ActiveConversation[]
  ): Promise<Conversation[]> {
    return Promise.all(
      convos.map(async (activeConvo) => {
        console.log(activeConvo);
        const id = this.generateConvoId(
          activeConvo.initiator.accountId,
          activeConvo.recipient.accountId
        );
        const msgs = await this.getMessages(id);
        const convo: Conversation = {
          recipient: activeConvo.recipient,
          id,
          sender: activeConvo.initiator,
          messages: msgs,
          lastMessage: msgs[0],
        };
        return convo;
      })
    );
  }

  async getConversationFromActive(
    activeConvo: ActiveConversation
  ): Promise<Conversation> {
    const id = this.generateConvoId(
      activeConvo.initiator.accountId,
      activeConvo.recipient.accountId
    );
    const msgs = await this.getMessages(id);
    const convo: Conversation = {
      recipient: activeConvo.recipient,
      id,
      sender: activeConvo.initiator,
      messages: msgs,
      lastMessage: msgs[0],
    };
    return convo;
  }

  // Observable that returns the latest message from a conversation
  public watchIncomingMessages(
    id: string[],
    address: string
  ): Observable<Message> {
    return new Observable((subscriber) => {
      this.api.query.uke.conversations.multi(id, async (v) => {
       const messages = v.map((v) => this.parseMessages(v));
        const latest = messages.pop().pop();
        if (address !== latest.sender) {
          subscriber.next(latest);
        }
      });
    });
  }

  // Observable that returns any new active conversations pertaining to the user
  public watchIncomingConversations(
    address: string
  ): Observable<ActiveConversation> {
    return new Observable((subscriber) => {
      this.api.query.uke.activeConversations(address, async (v) => {
        const newConvo: ActiveConversationSerialized[] = JSON.parse(
          v.toString()
        );
        const latest = newConvo.pop();
        if (latest.initiatorAddress !== address) {
          const convo: ActiveConversation = {
            initiator: {
              accountId: latest.initiatorAddress,
              username: this.hexStrParser(latest.initiatorName),
            },
            recipient: {
              accountId: latest.recipientAddress,
              username: this.hexStrParser(latest.recipientName),
            },
          };
          subscriber.next(convo);
        }
      });
    });
  }

  // Gets the associated username for an account
  async getUserInfo(address: string): Promise<User> {
    const userCodec = await this.api.query.uke.usernames(address);
    console.log(userCodec.toString());
    if (userCodec.toString() == '') {
      throw Error('User does not exist!');
    }
    const user: User = JSON.parse(userCodec.toString()) as User;
    const username = user.username;
    user.username = hexToStr(username.slice(2, username.length)) as string;
    return user;
  }

  // Assigns a new username and id to the identity mapping
  async assignUsername(username: string, signer: KeyringPair): Promise<any> {
    console.log(this.api);
    return await this.api.tx.uke.register(username).signAndSend(signer);
  }

  async sendMessage(
    signer: KeyringPair,
    id: string,
    message: Message,
    time: number,
    senderUsername: string,
    recipientUsername: string
  ): Promise<any> {
    console.log('sent message id', id);
    await this.api.tx.uke
      .storeMessage(
        message.message,
        time,
        id,
        message.recipient,
        recipientUsername,
        senderUsername
      )
      .signAndSend(signer);
    return Promise.resolve(true);
  }
}
