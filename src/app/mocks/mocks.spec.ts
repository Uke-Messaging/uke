import Keyring from '@polkadot/keyring';
import { Observable, of } from 'rxjs';
import {
  ActiveConversation,
  ActiveConversationSerialized,
  Conversation,
} from '../model/conversation.model';
import { Message } from '../model/message.model';
import { StoredUser, User } from '../model/user.model';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { UkePalletService } from '../services/ukepallet.service';
import { AnyJson, BareOpts, Codec, Inspect } from '@polkadot/types-codec/types';

export const message: Message = {
  sender: '000',
  recipient: '000',
  hash: '',
  message: 'hello',
};

export const convo: Conversation = {
  recipient: { accountId: '000', username: 'username' },
  id: 'id',
  sender: { accountId: '001', username: 'username2' },
  messages: [message],
  lastMessage: message,
};

export const activeConversation: ActiveConversation = {
  recipient: { accountId: '000', username: 'username' },
  initiator: { accountId: '001', username: 'username2' },
};

export const serializedActiveConversation: ActiveConversationSerialized = {
  initiatorAddress: '001',
  initiatorName: '0x0000',
  recipientAddress: '000',
  recipientName: '0x0001',
};

export const user: User = {
  accountId: '000',
  username: '0x757365726e616d65',
};

export class MockKeyringService {
  init() {}

  async loadAccount(): Promise<StoredUser> {
    const keyring = new Keyring({ type: 'ed25519' });
    const mnemonic = mnemonicGenerate();
    const pair = keyring.addFromUri(
      mnemonic,
      { name: 'first pair' },
      'ed25519'
    );
    const storedUser: StoredUser = {
      address: '000',
      username: 'badery',
      keypair: pair,
    };
    return storedUser;
  }

  createNewAccount(
    username: string,
    password: string,
    verifyPassword: string
  ) {}
}

export class ConversationMockService {
  getSelectedConversation(): Conversation {
    return convo;
  }
  selectConversation(conversation: Conversation): void {}
}

export class UkePalletMockService {
  async init(): Promise<void> {}

  watchIncomingMessages(id: string[], address: string): Observable<Message> {
    return of(message);
  }

  async getMessages(): Promise<Message[]> {
    return [message, message, message];
  }

  async getActiveConversations(sender?: string): Promise<ActiveConversation[]> {
    return [activeConversation, activeConversation, activeConversation];
  }

  async getConversationsFromActive(
    convos: ActiveConversation[],
    storedAddress: string
  ): Promise<Conversation[]> {
    return [convo, convo, convo];
  }
}
