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
import { KeyringService } from './keyring.service';

@Injectable({
  providedIn: 'root',
})
export class UkePalletService {
  public api: ApiPromise | any;

  constructor(private keyring: KeyringService) {}

  /** Initializes the API Promise for connecting to a Substrate node.
   */
  async init() {
    const wsProvider = new WsProvider('wss://node.uke.chat:443');
    this.api = await ApiPromise.create({ provider: wsProvider });
  }

  /** Gets the messages for a particular conversation ID
   * @param {string} id - Conversation ID
   * @param {string} storedAddress - Locally stored address.
   * @returns {Promise<Message[]>}
   */
  async getMessages(id: string, storedAddress: string): Promise<Message[]> {
    const messages = await this.api.query.uke.conversations(id);
    return this.parseMessages(messages, storedAddress);
  }

  /** Parses the response from the Substrate node.
   * @param {Codec} storage - Conversation ID
   * @param {string} storedAddress - Locally stored address.
   * @returns {Message[]}
   */
  private parseMessages(storage: Codec, storedAddress: string): Message[] {
    const messages: Message[] = JSON.parse(storage.toString());
    return messages.map((v) => {
      const address = storedAddress === v.sender ? v.recipient : v.sender;
      if (v.message.startsWith('0x'))
        v.message = this.keyring.decrypt(v.message, address) as string;
      v.time = new Date(v.time).toLocaleTimeString('default');
      return v;
    });
  }

  /** Generates a new conversation ID vias SHA3-256
   * @param {string} sender - Sender / initiator address.
   * @param {string} recipient - Recipient address.
   * @returns {string}
   */
  generateConvoId(sender: string, recipient: string): string {
    return sha3_256(sender + recipient);
  }

  /** Turns hex to a human readable string
   * @param {string} hex - Hex formatted text.
   * @returns {string}
   */
  private hexStrParser(hex: string): string {
    return hexToStr(hex.slice(2, hex.length)) as string;
  }

  /** Get the active conversations for a specified address
   * @param {string} sender - Sender's address.
   * @returns {Promise<ActiveConversation[]>}
   */
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

  /** Gets the Conversations from multiple ActiveConversations
   * @param {ActiveConversation[]} convos - Active conversations to retrieve.
   * @param {string} storedAddress - Locally stored address.
   * @returns {Promise<Conversation[]>}
   */
  async getConversationsFromActive(
    convos: ActiveConversation[],
    storedAddress: string
  ): Promise<Conversation[]> {
    return Promise.all(
      convos.map(async (activeConvo) => {
        const id = this.generateConvoId(
          activeConvo.initiator.accountId,
          activeConvo.recipient.accountId
        );
        const msgs = await this.getMessages(id, storedAddress);
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

  /** Gets a single conversation from an ActiveConversation
   * @param {ActiveConversation} activeConvo - Active conversation to retrieve.
   * @param {string} storedAddress - Locally stored address.
   * @returns {Promise<Conversation>}
   */
  async getConversationFromActive(
    activeConvo: ActiveConversation,
    storedAddress: string
  ): Promise<Conversation> {
    const id = this.generateConvoId(
      activeConvo.initiator.accountId,
      activeConvo.recipient.accountId
    );
    const msgs = await this.getMessages(id, storedAddress);
    const convo: Conversation = {
      recipient: activeConvo.recipient,
      id,
      sender: activeConvo.initiator,
      messages: msgs,
      lastMessage: msgs[0],
    };
    return convo;
  }

  /** Observable that returns the latest message from a batch of conversations
   * @param {string[]} id - List of ids to watch.
   * @param {string} address - Locally stored address.
   * @returns {Observable<Message>}
   */
  public watchIncomingMessages(
    id: string[],
    address: string
  ): Observable<Message> {
    return new Observable((subscriber) => {
      this.api.query.uke.conversations.multi(id, async (v) => {
        const messages = v.map((v) => this.parseMessages(v, address));
        const latest: Message = messages.pop().pop();
        if (address !== latest.sender) {
          subscriber.next(latest);
        }
      });
    });
  }

  /** Observable that returns any new active pending conversations pertaining to the user.
   * @param {string} address - Address to watch.
   * @returns {Observable<ActiveConversation>}
   */
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

  /** Gets the associated username for an account.
   * @param {string} userId - Username to get info from.
   * @returns {Promise<User>}
   */
  async getUserInfo(userId: string): Promise<User> {
    const userCodec = await this.api.query.uke.usernames(userId);
    if (userCodec.toString() == '' || userCodec.toString() == undefined) {
      throw Error('User does not exist!');
    }
    const user: User = JSON.parse(userCodec.toString()) as User;
    const username = user.username;
    user.username = hexToStr(user.username.slice(2, username.length)) as string;
    return user;
  }

  /** Assigns a new username and id to the identity mapping.
   * @param {string} username - Username to assign
   * @param {KeyringPair} signer - Keypair to sign and send.
   * @returns {Promise<any>}
   */
  async assignUsername(username: string, signer: KeyringPair): Promise<any> {
    const userCodec = await this.api.query.uke.usernames(username);
    if (userCodec.toString() != '') {
      throw Error('User ID already exists');
    }
    return await this.api.tx.uke.register(username).signAndSend(signer);
  }

  /** Sends a new message to the specified recipient.
   * @param {KeyringPair} signer - Username to assign
   * @param {string} id - Conversation to add to.
   * @param {Message} message - Message to send.
   * @param {number} time - UNIX timestamp.
   * @param {string} senderUsername - Sender's username.
   * @param {string} recipientUsername - Recipient's username.
   * @returns {Promise<any>}
   */
  async sendMessage(
    signer: KeyringPair,
    id: string,
    message: Message,
    time: number,
    senderUsername: string,
    recipientUsername: string
  ): Promise<any> {
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
