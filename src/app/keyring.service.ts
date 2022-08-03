import '@polkadot/api-augment/substrate';

import { Injectable } from '@angular/core';
import { keyring } from '@polkadot/ui-keyring';
import {
  cryptoWaitReady,
  randomAsHex,
  signatureVerify,
} from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { KeyringPair } from '@polkadot/keyring/types';
import { Storage } from '@ionic/storage-angular';

export interface Contact {
  address: string;
  publicKey: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class KeyringService {
  private _storage: Storage | null = null;

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
  createNewAccount(name: string, password: string, reenterPassword: string) {
    if (password !== reenterPassword) {
      throw Error("Passwords don't match, please check again!");
    }
    const seed = randomAsHex(32);
    const { pair, json } = keyring.addUri(seed, password, { name }, 'ed25519');
    this._storage?.set(name, json);
  }

  // Gets the user's main address / account - able to sign and verify
  // For now uses contact, later will use a custom data structure w the private key for signing purposes
  async getCurrentAccount(name: string): Promise<KeyringPair> {
    const raw = await this._storage.get(name);
    return keyring.createFromJson(raw);
  }

  // TODO: ensure a message can be properly signed, and the signature is sent for future identity verification
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

  // TODO: might revisit, used to verify a message's integrity
  async verifyPayload(
    message: string,
    signature: string,
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
