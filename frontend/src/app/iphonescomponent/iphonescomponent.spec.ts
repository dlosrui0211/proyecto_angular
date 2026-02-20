import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Iphonescomponent } from './iphonescomponent';

describe('Iphonescomponent', () => {
  let component: Iphonescomponent;
  let fixture: ComponentFixture<Iphonescomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Iphonescomponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Iphonescomponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
