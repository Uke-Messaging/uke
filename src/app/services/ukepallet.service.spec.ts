import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage';
import { of } from 'rxjs';
import {
  activeConversation,
  convo,
  message,
  serializedActiveConversation,
  UkePalletMockService,
  user,
} from '../mocks/mocks.spec';
import { ActiveConversationSerialized } from '../model/conversation.model';
import { Message } from '../model/message.model';

import { UkePalletService } from './ukepallet.service';

describe('UkepalletService', () => {
  let service: UkePalletService;

  const messages: Message[] = [message, message, message];
  const serializedActiveConversations: ActiveConversationSerialized[] = [
    serializedActiveConversation,
    serializedActiveConversation,
    serializedActiveConversation,
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Storage],
    });
    service = TestBed.inject(UkePalletService);
    service.api = {
      query: {
        uke: {
          activeConversations: () => [
            {
              serializedActiveConversations,
              toString: () => JSON.stringify(serializedActiveConversations),
            },
          ],
          conversations: () => [
            {
              messages,
              toString: () => JSON.stringify(messages),
            },
          ],
          usernames: () => [{ user, toString: () => JSON.stringify(user) }],
        },
      },
    };
  });

  it('should be created', async () => {
    expect(service).toBeTruthy();
  });

  // it('should initialize a new API instance', async () => {
  //   await service.init();
  //   expect(service).toBeTruthy();
  // });

  it('should get messages by id', async () => {
    const convoId = service.generateConvoId('a', 'a');
    const messages = await service.getMessages(convoId, '000');
    expect(messages.length).toEqual(3);
    expect(messages[0].message).toEqual('hello');
  });

  it('should generate a valid conversation id', async () => {
    const convoId = service.generateConvoId('a', 'a');
    expect(convoId).toEqual(
      '3d3f583ee3cf8547afab715006ca5e0248da718b7a925201c218d380ad4e6a23'
    );
  });

  it('should get active conversations for an address', async () => {
    const activeConversations = await service.getActiveConversations('000');
    expect(activeConversations.length).toEqual(3);
  });

  it('should get corresponding full conversations from an active conversation', async () => {
    const conversations = await service.getConversationsFromActive(
      [activeConversation, activeConversation, activeConversation],
      '000'
    );
    expect(conversations.length).toEqual(3);
  });

  it('should get watch for any new incoming conversations', async () => {
    service.watchIncomingConversations('000').subscribe((incomingMessage) => {
      expect(service).toBeTruthy();
      expect(incomingMessage).toBeTruthy();
    });
  });

  it('should get watch for any new incoming messages', async () => {
    service.api = {
      query: {
        uke: {
          conversations: {
            multi: () => [
              {
                messages,
                toString: () => JSON.stringify(messages),
              },
            ],
          },
        },
      },
    };
    service.watchIncomingMessages([], '000').subscribe((incomingMessage) => {
      expect(service).toBeTruthy();
      expect(incomingMessage).toBeTruthy();
    });
    expect(service).toBeTruthy();
  });

  it('should get user info', async () => {
    const userInfo = await service.getUserInfo('000');
    expect(service).toBeTruthy();
    console.log(userInfo)
    expect(userInfo.username).toEqual('username');
  });
});
