import { KeyringPair, KeyringPair$Json } from "@polkadot/keyring/types";

export interface User {
    accountId: string;
    username: string;
}

export interface Contact {
    address: string;
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