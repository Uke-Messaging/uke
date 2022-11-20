import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { UkePalletMockService } from '../mocks/mocks.data';
import { KeyringService } from '../services/keyring.service';
import { UkePalletService } from '../services/ukepallet.service';

import { SignupPage } from './signup.page';

describe('SignupPage', () => {
  let component: SignupPage;
  let keyringService: KeyringService;
  let uke: UkePalletService;
  let fixture: ComponentFixture<SignupPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SignupPage],
      imports: [
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        RouterTestingModule.withRoutes([{ path: 'tabs/tab1', redirectTo: '' }]),
      ],
      providers: [
        { provide: UkePalletService, useClass: UkePalletMockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupPage);
    keyringService = TestBed.inject(KeyringService);
    uke = TestBed.inject(UkePalletService);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.switchText).toEqual('already have an account?');
  });

  it('should switch from signup to login', () => {
    component.switchLogin();
    expect(component.switchText).toEqual('need to create an account?');
  });

  it('should signup a new user', async () => {
    await keyringService.initStorage();
    component.userId = 'bader';
    component.password = '123';
    component.verifyPassword = '123';
    await component.signup();
    expect(component).toBeTruthy();
    expect(await keyringService.getAuthenticationStatus()).toBeTruthy();
  });

  it('should login an existing user', async () => {
    await keyringService.initStorage();
    component.userId = 'bader';
    component.password = '123';
    await component.login();
    expect(await keyringService.getAuthenticationStatus()).toBeTruthy();
  });
});
