import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOpenEndedProblemComponent } from './edit-open-ended-problem.component';

describe('EditOpenEndedProblemComponent', () => {
  let component: EditOpenEndedProblemComponent;
  let fixture: ComponentFixture<EditOpenEndedProblemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditOpenEndedProblemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOpenEndedProblemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
