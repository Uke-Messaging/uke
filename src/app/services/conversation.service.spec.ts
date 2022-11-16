import { TestBed } from '@angular/core/testing';
import { convo } from '../mocks/mocks.spec';

import { ConversationService } from './conversation.service';

describe('ConversationService', () => {
  let service: ConversationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    });
    service = TestBed.inject(ConversationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set a new conversation', () => {
    service.selectConversation(convo);
    expect(service.getSelectedConversation().id).toEqual('id');
  });
});
