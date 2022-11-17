import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage';
import Keyring from '@polkadot/keyring';
import { of } from 'rxjs';
import {
  activeConversation,
  convo,
  encryptedMessage,
  message,
  recipientKeypairJson,
  senderKeypairJson,
  serializedActiveConversation,
  UkePalletMockService,
  user,
} from '../mocks/mocks.spec';
import { ActiveConversationSerialized } from '../model/conversation.model';
import { Message } from '../model/message.model';
import { KeyringService } from './keyring.service';
import { u8aToHex } from '@polkadot/util';
import { UkePalletService } from './ukepallet.service';

describe('UkepalletService', () => {
  let service: UkePalletService;
  let keyringService: KeyringService;
  const messages: Message[] = [
    encryptedMessage,
    encryptedMessage,
    encryptedMessage,
  ];
  const serializedActiveConversations: ActiveConversationSerialized[] = [
    serializedActiveConversation,
    serializedActiveConversation,
    serializedActiveConversation,
  ];

  const keyring = new Keyring({ type: 'sr25519', ss58Format: 2 });
  const senderKeypair = keyring.createFromJson(senderKeypairJson);
  const recipientKeypair = keyring.createFromJson(recipientKeypairJson);

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [Storage],
    });

    service = TestBed.inject(UkePalletService);
    keyringService = TestBed.inject(KeyringService);
    await keyringService.auth('123', senderKeypair);
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

  it('should get messages by id', async () => {
    const convoId = service.generateConvoId('a', 'a');
    const messages = await service.getMessages(
      convoId,
      senderKeypairJson.address
    );
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
      senderKeypair.address
    );
    expect(conversations.length).toEqual(3);
  });

  it('should get watch for any new incoming conversations', async () => {
    service
      .watchIncomingConversations(senderKeypair.address)
      .subscribe((incomingMessage) => {
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
      expect(incomingMessage).toBeTruthy();
    });
    expect(service).toBeTruthy();
  });

  it('should get user info', async () => {
    const userInfo = await service.getUserInfo('000');
    expect(userInfo.username).toEqual('username');
  });

  it('should throw on an empty user', async () => {
    service.api = {
      query: {
        uke: {
          usernames: () => [],
        },
      },
    };
    await expectAsync(service.getUserInfo('000')).toBeRejected();
  });
});
