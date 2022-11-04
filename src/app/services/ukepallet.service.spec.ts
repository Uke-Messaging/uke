import { TestBed } from '@angular/core/testing';

import { UkePalletService } from './ukepallet.service';

describe('UkepalletService', () => {
  let service: UkePalletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UkePalletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
