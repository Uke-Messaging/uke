import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule, Storage } from '@ionic/storage-angular';
import {
  ConversationMockService,
  message,
  MockKeyringService,
  UkePalletMockService,
} from '../mocks/mocks.data';
import { ConversationService } from '../services/conversation.service';
import { KeyringService } from '../services/keyring.service';
import { UkePalletService } from '../services/ukepallet.service';

import { MessageviewPage } from './messageview.page';

describe('MessageviewPage', async () => {
  let component: MessageviewPage;
  let fixture: ComponentFixture<MessageviewPage>;

  let conversationService: ConversationService;
  let keyring: KeyringService;
  let uke: UkePalletService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MessageviewPage],
      imports: [
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        RouterTestingModule,
      ],
      providers: [
        { provide: KeyringService, useClass: MockKeyringService },
        { provide: ConversationService, useClass: ConversationMockService },
        { provide: UkePalletService, useClass: UkePalletMockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageviewPage);
    conversationService = TestBed.inject(ConversationService);
    uke = TestBed.inject(UkePalletService);
    keyring = TestBed.inject(KeyringService);
    component = fixture.componentInstance;
    component.message = 'hello';
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run ngOnInit, have a loaded user, and conversation', async () => {
    await component.ngOnInit();
    expect(component).toBeTruthy();
    expect(component.currentAddress.length).toBeGreaterThan(0);
    expect(component.convo.id).toEqual('id');
  });

  it('should get the current conversation', async () => {
    await component.ngOnInit();
    expect(component.convo.messages.length).toBeGreaterThan(0);
    expect(component.convo.id).toEqual('id');
  });

  it('should send a message successfully', async () => {
    await component.ngOnInit();
    spyOn(component, 'send').and.returnValue(
      new Promise((resolve) => {
        component.message = '';
        component.convo.messages.push(message);
        resolve();
      })
    );
    await component.send();
    expect(component.message).toEqual('');
    expect(component.convo.messages.length).toEqual(2);
  });
});
