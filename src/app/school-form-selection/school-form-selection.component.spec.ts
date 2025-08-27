import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolFormSelectionComponent } from './school-form-selection.component';

describe('SchoolFormSelectionComponent', () => {
  let component: SchoolFormSelectionComponent;
  let fixture: ComponentFixture<SchoolFormSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchoolFormSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolFormSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
