import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Message } from '../model/message.model';
import { u8aToHex } from '@polkadot/util';

import { KeyringService } from './keyring.service';

describe('KeyringService', () => {
  let service: KeyringService;
  let storage: Storage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IonicStorageModule.forRoot()],
      providers: [Storage],
    });
    service = TestBed.inject(KeyringService);
    storage = TestBed.inject(Storage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should init the keyring successfully', async () => {
    await service.init();
    expect(service).toBeTruthy();
  });

  it('should create and fetch a new account successfully', async () => {
    await service.initStorage();
    await service.createNewAccount('bader', '123', '123');
    const account = await service.loadAccount();
    expect(account.username).toEqual('bader');
    expect(service).toBeTruthy();
  });

  it('should throw if local account already exists', async () => {
    await service.initStorage();
    await expectAsync(
      service.createNewAccount('bader', '123', '123')
    ).toBeRejected();
  });

  it('should authenticate using keypair successfully', async () => {
    await service.initStorage();
    const account = await service.loadAccount();
    await service.auth('123', account.keypair);
    const authenticatedAccount = await service.loadAuthenticatedKeypair();
    expect(service).toBeTruthy();
    expect(await service.getAuthenticationStatus()).toBeTrue();
    expect(authenticatedAccount.address).toEqual(account.address);
  });

  it('should fail authenticating using keypair', async () => {
    await service.initStorage();
    const account = await service.loadAccount();
    await expectAsync(service.auth('124', account.keypair)).toBeRejected();
  });

  it('encrypt and decrypt a payload', async () => {
    await service.initStorage();
    const account = await service.loadAccount();
    await service.auth('123', account.keypair);
    const encrypted = await service.encrypt('hello', account.address);
    const decrypted = await service.decrypt(encrypted, account.address);

    expect(service).toBeTruthy();
    expect(decrypted).toEqual('hello');
  });

  it('log out the user after auth', async () => {
    await service.initStorage();
    const account = await service.loadAccount();
    await service.auth('123', account.keypair);
    await service.logOut();
    expect(await service.getAuthenticationStatus()).toBeFalse();
  });

  it('passwords do not match', async () => {
    await expectAsync(
      service.createNewAccount('bader', '123', '124')
    ).toBeRejected();
  });

  it('decrypt a message object', async () => {
    await service.initStorage();
    const account = await service.loadAccount();
    await service.auth('123', account.keypair);

    const encryptedText = await service.encrypt('hello', account.address);
    const encryptedMessage: Message = {
      sender: account.address,
      recipient: account.address,
      message: u8aToHex(encryptedText),
    };

    const decryptedMessage = await service.decryptMessage(
      encryptedMessage,
      account.address
    );
    expect(service).toBeTruthy();
    expect(decryptedMessage.message).toEqual('hello');
  });

  it('should throw upon non-existent local account', async () => {
    await service.initStorage();
    await service.clearStorage();
    await expectAsync(service.loadAccount()).toBeRejected();
  });
});
