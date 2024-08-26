import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionsaleComponent } from './divisionsale.component';

describe('DivisionsaleComponent', () => {
  let component: DivisionsaleComponent;
  let fixture: ComponentFixture<DivisionsaleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DivisionsaleComponent]
    });
    fixture = TestBed.createComponent(DivisionsaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
