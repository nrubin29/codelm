import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesweeperComponent } from './timesweeper.component';

describe('TimesweeperComponent', () => {
  let component: TimesweeperComponent;
  let fixture: ComponentFixture<TimesweeperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesweeperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesweeperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
