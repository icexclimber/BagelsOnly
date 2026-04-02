import { TestBed } from '@angular/core/testing';

import { Torneo } from './torneos.service';

describe('Torneo', () => {
  let service: Torneo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Torneo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
