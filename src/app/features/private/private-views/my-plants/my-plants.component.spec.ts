import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPlantsComponent } from './my-plants.component';

describe('MyPlantsComponent', () => {
  let component: MyPlantsComponent;
  let fixture: ComponentFixture<MyPlantsComponent>;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
      imports: [MyPlantsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MyPlantsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
