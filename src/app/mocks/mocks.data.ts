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
import { KeyringPair, KeyringPair$Json } from '@polkadot/keyring/types';

// Mock data for unit tests - subject to change

export const senderKeypairJson: KeyringPair$Json = {
  encoded:
    'R1zxkrCmHnBqGjsZTCE8fXcyP71RZAMPHY/rucDsQAcAgAAAAQAAAAgAAACl2YdQNHkKeCsn9XrvZpzKIZ7o5E+Y9+DAyOgwiKBXV2tnPfNSTq2iCyVeEkXD+uIui6K0+9vUYdYkl8PxIjT+0plHdyvPq/GVxKmNOc7lVIvOfg1ivexF57eirf0MiEMFHcuavBJ7HJ0P4JXZnQ6KjdOGpnxF1DCPSMG/4GCE8qVFVZzbn/ov8h9B2YY1DGMZgghM3FGgZ5INzK5D',
  encoding: {
    content: ['pkcs8', 'ed25519'],
    type: ['scrypt', 'xsalsa20-poly1305'],
    version: '3',
  },
  address: '5CzgJXKkjYMdUykYik5NvAPre7YtAY6KJNtXk735s2qCeLom',
  meta: {
    name: 'MAIN_ACCOUNT',
    whenCreated: 1668697663286,
  },
};

export const recipientKeypairJson: KeyringPair$Json = {
  encoded:
    'l1YvDx5ocLGNSGMeCHRrixuw4m6BPlMJcDKLFGncz38AgAAAAQAAAAgAAABDyKW76OShJoyOYJhwJ3qohALMWdGY0a2uoeREEFBB0CwDaiJTnGyDetjpICghucW4Q+uAb64h6EajrFJe8VJctXashSE0hZsoQycuQbUjoo0nbVlZM8PXzeKOGedQhVl2mD7Ls/rj1ctNm/J/oQfu4W0DesDsA9oik1nfKQepAMNxNJdvrdTc6d+M6Pmw6AW+gQDQGiEfN4bP/qLl',
  encoding: {
    content: ['pkcs8', 'ed25519'],
    type: ['scrypt', 'xsalsa20-poly1305'],
    version: '3',
  },
  address: '5FxfEqtF4efemwiFbVL2MzwpqckwmrZP4ztf4oS8tyHcmh7M',
  meta: {
    name: 'MAIN_ACCOUNT',
    whenCreated: 1668697721058,
  },
};

export const message: Message = {
  sender: senderKeypairJson.address,
  recipient: recipientKeypairJson.address,
  message: 'hello',
};

export const encryptedMessage: Message = {
  sender: senderKeypairJson.address,
  recipient: recipientKeypairJson.address,
  message:
    '0x0243522166066218975d7c8fcfd553cd0b941de0b31b6fbaaffe6fc3f2fb445a644ff8ea2f0754f2e6b037c5b0',
};

export const convo: Conversation = {
  recipient: { accountId: recipientKeypairJson.address, username: 'username' },
  id: 'id',
  sender: { accountId: senderKeypairJson.address, username: 'username2' },
  messages: [message],
  lastMessage: message,
};

export const activeConversation: ActiveConversation = {
  recipient: { accountId: recipientKeypairJson.address, username: 'username' },
  initiator: { accountId: senderKeypairJson.address, username: 'username2' },
};

export const serializedActiveConversation: ActiveConversationSerialized = {
  initiatorAddress: senderKeypairJson.address,
  initiatorName: 'username2',
  recipientAddress: recipientKeypairJson.address,
  recipientName: 'username',
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
}

export class ConversationMockService {
  getSelectedConversation(): Conversation {
    return convo;
  }
  selectConversation(conversation: Conversation): void {}
}

export class UkePalletMockService {
  async init(): Promise<void> {}

  watchIncomingMessages(_id: string[], _address: string): Observable<Message> {
    return of(message);
  }

  async getMessages(): Promise<Message[]> {
    return [message, message, message];
  }

  async getActiveConversations(_sender: string): Promise<ActiveConversation[]> {
    return [activeConversation, activeConversation, activeConversation];
  }

  async getConversationsFromActive(
    _convos: ActiveConversation[],
    _storedAddress: string
  ): Promise<Conversation[]> {
    return [convo, convo, convo];
  }

  async assignUsername(_username: string, _signer: KeyringPair): Promise<any> {
    return {};
  }

  async getUserInfo(): Promise<User> {
    return { username: 'username', accountId: senderKeypairJson.address };
  }
}
