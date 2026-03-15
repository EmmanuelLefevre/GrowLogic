import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';

import { BackgroundComponent } from '@shared/components/background/background.component';
import { HomeViewComponent } from './home-view.component';

describe('HomeViewComponent', () => {

  let component: HomeViewComponent;
  let fixture: ComponentFixture<HomeViewComponent>;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
      imports: [
        HomeViewComponent,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeViewComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the default appNameKey signal value', () => {
    expect(component.appNameKey()).toBe('META.DEFAULT.APP_NAME');
  });

  it('should render the BackgroundComponent wrapper', () => {
    // --- ACT ---
    const backgroundDebugElement = fixture.debugElement.query(By.directive(BackgroundComponent));

    // --- ASSERT ---
    expect(backgroundDebugElement).toBeTruthy();
  });
});
