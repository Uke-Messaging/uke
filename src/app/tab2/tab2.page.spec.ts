import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { Tab2Page } from './tab2.page';
import { Storage } from '@ionic/storage';
import { RouterTestingModule } from '@angular/router/testing';
import { KeyringService } from '../services/keyring.service';
import { StoredUser } from '../model/user.model';
import Keyring from '@polkadot/keyring';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { UkePalletService } from '../services/ukepallet.service';
import { IonicStorageModule } from '@ionic/storage-angular';

describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;
  let keyringService: KeyringService;
  let ukeService: UkePalletService;
  let storage: Storage;

  const keyring = new Keyring({ type: 'ed25519' });
  const mnemonic = mnemonicGenerate();
  const pair = keyring.addFromUri(mnemonic, { name: 'first pair' }, 'ed25519');
  const storedUser: StoredUser = {
    address: '000',
    username: 'badery',
    keypair: pair,
  };

  const KeyringServiceStub = {
    loadAccount: async () => storedUser,
    init: async () => {},
  };

  const ukeServiceStub = {
    getActiveConversations: async () => [],
    init: async () => {},
  };

  const storageStub = {};


  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [Tab2Page],
      imports: [
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        RouterTestingModule,
      ],
      providers: [
        { provide: Storage, useValue: storageStub },
        { provide: KeyringService, useValue: KeyringServiceStub },
        { provide: UkePalletService, useValue: ukeServiceStub },
      ],
    }).compileComponents();

    storage = TestBed.inject(Storage);
    keyringService = TestBed.inject(KeyringService);
    ukeService = TestBed.inject(UkePalletService);

    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
  }));

  it('should create', async () => {
    expect(component).toBeTruthy();
  });
});
