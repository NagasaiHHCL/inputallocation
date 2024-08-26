import { TestBed } from '@angular/core/testing';

import { SelectproductsService } from './selectproducts.service';

describe('SelectproductsService', () => {
  let service: SelectproductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectproductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
