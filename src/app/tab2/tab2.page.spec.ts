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
import { senderKeypairJson } from '../mocks/mocks.data';

describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;
  let keyringService: KeyringService;

  const keyring = new Keyring({ type: 'sr25519', ss58Format: 2 });
  const senderKeypair = keyring.createFromJson(senderKeypairJson);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [Tab2Page],
      imports: [
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        RouterTestingModule.withRoutes([{ path: 'signup', redirectTo: '' }]),
      ],
    }).compileComponents();

    keyringService = TestBed.inject(KeyringService);

    keyringService.auth('123', senderKeypair);
    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
  }));

  it('should create', async () => {
    expect(component).toBeTruthy();
  });

  it('should logout', async () => {
    await component.logout();
    expect(component).toBeTruthy();
    expect(await keyringService.getAuthenticationStatus()).toBeFalse();
  });
});
