import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { RouterTestingModule } from '@angular/router/testing';

import { Tab1Page } from './tab1.page';
import { KeyringService } from '../services/keyring.service';
import { ConversationService } from '../services/conversation.service';
import { UkePalletService } from '../services/ukepallet.service';
import { ConversationMockService, MockKeyringService, UkePalletMockService } from '../mocks/mocks.spec';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [Tab1Page],
      imports: [IonicModule.forRoot(), IonicStorageModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: KeyringService, useClass: MockKeyringService },
        { provide: ConversationService, useClass: ConversationMockService },
        { provide: UkePalletService, useClass: UkePalletMockService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all active conversations', () => {
    expect(component).toBeTruthy();
  });

  it('should start a new conversation', () => {
    expect(component).toBeTruthy();
  });

  it('should add a new conversation', () => {
    expect(component).toBeTruthy();
  });

});
