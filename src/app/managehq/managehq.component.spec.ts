import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagehqComponent } from './managehq.component';

describe('ManagehqComponent', () => {
  let component: ManagehqComponent;
  let fixture: ComponentFixture<ManagehqComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagehqComponent]
    });
    fixture = TestBed.createComponent(ManagehqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
