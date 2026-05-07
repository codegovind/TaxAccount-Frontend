import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickAddProduct } from './quick-add-product';

describe('QuickAddProduct', () => {
  let component: QuickAddProduct;
  let fixture: ComponentFixture<QuickAddProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickAddProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickAddProduct);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
