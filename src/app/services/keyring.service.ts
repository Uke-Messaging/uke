import '@polkadot/api-augment/substrate';

import { Injectable } from '@angular/core';
import { keyring } from '@polkadot/ui-keyring';
import {
  cryptoWaitReady,
  randomAsHex,
  signatureVerify,
} from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { KeyringPair, KeyringPair$Json } from '@polkadot/keyring/types';
import { Storage } from '@ionic/storage-angular';

export interface Contact {
  address: string;
  publicKey: string;
  name: string;
}

export interface StoredUser {
  keypair: KeyringPair;
  username: string;
  address: string;
}

export interface StoredUserSerialized {
  keypairJson: KeyringPair$Json;
  username: string;
  address: string;
}

@Injectable({
  providedIn: 'root',
})
export class KeyringService {
  private _storage: Storage | null = null;

  private static MAIN_ACCOUNT = 'MAIN_ACCOUNT';
  private static AUTHENTICATED = 'AUTHENTICATED';
  private isAuthenticated: boolean = false;
  private currentlyStoredUser

  constructor(private storage: Storage) {}

  async init() {
    const ready = await cryptoWaitReady;
    if (ready) {
      keyring.loadAll({ ss58Format: 42, type: 'ed25519' });
    }
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

    console.log(storedUserSerialized);
    return this._storage?.set(
      KeyringService.MAIN_ACCOUNT,
      storedUserSerialized
    );
  }

  // FOR AUTH, we want to check for an existing account. Doesn't exist? Make an ew one. Does exist? Attempt unlock. Unlock successful? go to home, is authenticated.  Un? Throw error
  // Gets the user's main address / account - able to sign and verify
  // For now uses contact, later will use a custom data structure w the private key for signing purposes
  async loadAccount(): Promise<StoredUser> {
    const raw = await this._storage.get(KeyringService.MAIN_ACCOUNT);
    if (raw === undefined || raw === null)
      throw Error('Account does not exist - create on!');
    const serialized: StoredUserSerialized = raw as StoredUserSerialized;
    const keypair = keyring.createFromJson(serialized.keypairJson);
    return {
      username: serialized.username,
      address: serialized.address,
      keypair,
    };
  }

  // Successfully unlock account upon login to ensure user authentication (PLACEHOLDER till we implement in pallet)
  async auth(password: string, keypair: KeyringPair): Promise<boolean> {
   const signature = await this.unlockAndSignPayload(keypair, password, KeyringService.AUTHENTICATED);
    await this.verifyPayload(KeyringService.AUTHENTICATED, signature, keypair.address);
    this.isAuthenticated = true;
    await this._storage?.set(KeyringService.AUTHENTICATED, true);
    return this.isAuthenticated;
  }

  async getAuthenticationStatus(): Promise<boolean> {
    this.isAuthenticated = await this._storage?.get(
      KeyringService.AUTHENTICATED
    );
    return this.isAuthenticated;
  }

  // Sets user as not authenticated
  async logOut() {
    this.isAuthenticated = false;
    await this._storage?.set(KeyringService.AUTHENTICATED, false);
  }

  // Unlock and sign a payload
  async unlockAndSignPayload(
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

  //  TODO: Implement encrypted messaging.
  //  Used to verify an encrypted message's integrity
  async verifyPayload(
    message: string | Uint8Array,
    signature: string | Uint8Array,
    publicKeyOrAddress: string
  ): Promise<boolean> {
    return signatureVerify(message, signature, publicKeyOrAddress).isValid;
  }

  // Fetches the accounts marked as contacts
  getContacts(): Contact[] {
    const accounts = keyring.getAccounts();
    return accounts
      .filter((a) => a.meta.name.startsWith('CONTACT-'))
      .map((a) => {
        const publicKey = u8aToHex(a.publicKey);
        return { name: a.meta.name, publicKey: publicKey, address: a.address };
      });
  }
}
