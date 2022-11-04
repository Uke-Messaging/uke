import { TestBed } from '@angular/core/testing';

import { KeyringService } from './keyring.service';

describe('KeyringService', () => {
  let service: KeyringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
