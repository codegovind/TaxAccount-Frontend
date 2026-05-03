import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactCreate } from './contact-create';

describe('ContactCreate', () => {
  let component: ContactCreate;
  let fixture: ComponentFixture<ContactCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
