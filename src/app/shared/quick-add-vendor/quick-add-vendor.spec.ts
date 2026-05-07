import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickAddVendor } from './quick-add-vendor';

describe('QuickAddVendor', () => {
  let component: QuickAddVendor;
  let fixture: ComponentFixture<QuickAddVendor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickAddVendor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickAddVendor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
