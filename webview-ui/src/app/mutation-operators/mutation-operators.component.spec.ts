import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MutationOperatorsComponent } from './mutation-operators.component';

describe('MutationOperatorsComponent', () => {
  let component: MutationOperatorsComponent;
  let fixture: ComponentFixture<MutationOperatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MutationOperatorsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MutationOperatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
