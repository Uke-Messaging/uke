import { KeyringPair, KeyringPair$Json } from '@polkadot/keyring/types';

/**
 * User.
 *
 * @interface User
 * @member {string} accountId The user's account address.
 * @member {string} username The user's username.
 */
export interface User {
  accountId: string;
  username: string;
}

/**
 * StoredUser.
 *
 * @interface StoredUser
 * @member {KeyringPair} keypair The user's keypair.
 * @member {string} username The user's username.
 * @member {string} accountId The user's account address.
 */
export interface StoredUser {
  keypair: KeyringPair;
  username: string;
  address: string;
}

/**
 * StoredUserSerialized.
 *
 * @interface StoredUserSerialized
 * @member {KeyringPair$Json} keypairJson The user's keypair in a JSON format.
 * @member {string} username The user's username.
 * @member {string} accountId The user's account address.
 */
export interface StoredUserSerialized {
  keypairJson: KeyringPair$Json;
  username: string;
  address: string;
}
