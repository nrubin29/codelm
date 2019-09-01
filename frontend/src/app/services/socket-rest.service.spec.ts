import { TestBed } from '@angular/core/testing';

import { SocketRestService } from './socket-rest.service';

describe('SocketRestService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SocketRestService = TestBed.get(SocketRestService);
    expect(service).toBeTruthy();
  });
});
