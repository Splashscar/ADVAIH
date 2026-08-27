import { TestBed } from '@angular/core/testing';

import { Asistentes } from './asistentes';

describe('Asistentes', () => {
  let service: Asistentes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Asistentes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
