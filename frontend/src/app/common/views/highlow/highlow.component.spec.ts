import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HighlowComponent } from './highlow.component';

describe('HighlowComponent', () => {
  let component: HighlowComponent;
  let fixture: ComponentFixture<HighlowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HighlowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HighlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
