import '@polkadot/api-augment/substrate';

import { Injectable } from '@angular/core';
import { keyring } from '@polkadot/ui-keyring';
import {
  cryptoWaitReady,
  decodeAddress,
  randomAsHex,
  signatureVerify,
} from '@polkadot/util-crypto';
import { u8aToHex, stringToU8a, u8aToString } from '@polkadot/util';
import { KeyringPair } from '@polkadot/keyring/types';
import { Storage } from '@ionic/storage-angular';
import { Contact, StoredUser, StoredUserSerialized } from '../model/user.model';
import { Message } from '../model/message.model';

@Injectable({
  providedIn: 'root',
})
export class KeyringService {
  private _storage: Storage | null = null;

  private static MAIN_ACCOUNT = 'MAIN_ACCOUNT';
  private static AUTHENTICATED = 'AUTHENTICATED';
  private isAuthenticated: boolean = false;
  private currentlyStoredUser: KeyringPair;

  constructor(private storage: Storage) {}

  async init() {
    const ready = await cryptoWaitReady;
    if (ready) {
      keyring.loadAll({ ss58Format: 42, type: 'ed25519' });
    }
    await this.initStorage();
  }

  async initStorage() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Creates a new account with the intent of signing and verifying transactions
  createNewAccount(
    username: string,
    password: string,
    reenterPassword: string
  ): Promise<any> {
    if (password !== reenterPassword) {
      throw Error("Passwords don't match, please check again!");
    }
    const seed = randomAsHex(32);
    const { pair, json } = keyring.addUri(
      seed,
      password,
      { name: KeyringService.MAIN_ACCOUNT },
      'ed25519'
    );

    const storedUserSerialized: StoredUserSerialized = {
      keypairJson: json,
      username,
      address: pair.address,
    };

    return this._storage.set(KeyringService.MAIN_ACCOUNT, storedUserSerialized);
  }

  async loadAccount(): Promise<StoredUser> {
    const raw = await this._storage.get(KeyringService.MAIN_ACCOUNT);
    if (raw === undefined || raw === null)
      throw Error('Account does not exist - create one!');
    const serialized: StoredUserSerialized = raw as StoredUserSerialized;
    const keypair = keyring.createFromJson(serialized.keypairJson);
    return {
      username: serialized.username,
      address: serialized.address,
      keypair,
    };
  }

  loadAuthenticatedKeypair(): KeyringPair {
    return this.currentlyStoredUser;
  }

  // Successfully unlock account upon login to ensure user authentication
  async auth(password: string, keypair: KeyringPair): Promise<boolean> {
    const signature = await this.unlockAndSignPayload(
      keypair,
      password,
      KeyringService.AUTHENTICATED
    );
    await this.verifyPayload(
      KeyringService.AUTHENTICATED,
      signature,
      keypair.address
    );
    this.isAuthenticated = true;
    await this._storage?.set(KeyringService.AUTHENTICATED, true);
    this.currentlyStoredUser = keypair;
    this.currentlyStoredUser.unlock(password);
    return this.isAuthenticated;
  }

  async getAuthenticationStatus(): Promise<boolean> {
    return this.isAuthenticated;
  }

  getKeypairLockStatus(): boolean {
    return this.currentlyStoredUser === undefined
      ? true
      : this.currentlyStoredUser.isLocked;
  }

  // Sets user as not authenticated
  async logOut() {
    this.isAuthenticated = false;
  }

  decrypt(data: Uint8Array | string, recipientAddress: string): string {
    const keypair = this.loadAuthenticatedKeypair();
    const publicKey = decodeAddress(recipientAddress);
    return u8aToString(keypair.decryptMessage(data, publicKey));
  }

  encrypt(data: string, recipientAddress: string): Uint8Array {
    const keypair = this.loadAuthenticatedKeypair();
    const publicKey = decodeAddress(recipientAddress);
    return keypair.encryptMessage(data, publicKey);
  }

  decryptMessage(msg: Message, address: string): Message {
    const recipient = address === msg.sender ? msg.recipient : msg.sender;
    const decrypted = this.decrypt(msg.message, recipient);
    return {
      recipient: msg.recipient,
      sender: msg.sender,
      time: msg.time,
      message: decrypted,
      hash: '',
    };
  }

  // Unlock and sign a payload
  private async unlockAndSignPayload(
    pair: KeyringPair,
    password: string,
    message: string
  ): Promise<Uint8Array> {
    pair.unlock(password);
    if (!pair.isLocked) {
      const signed = pair.sign(message);
      pair.lock();
      return signed;
    }
    throw Error('Bad password! Not unlocked.');
  }

  private async verifyPayload(
    message: string | Uint8Array,
    signature: string | Uint8Array,
    publicKeyOrAddress: string
  ): Promise<boolean> {
    return signatureVerify(message, signature, publicKeyOrAddress).isValid;
  }
}
