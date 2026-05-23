import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { Plant } from '@app/features/private/_models/plant/plant.model';
import { PlantService } from '@app/features/private/_services/plant/plant.service';
import { AuthService } from '@core/_services/auth/auth.service';
import { SnackbarService } from '@core/_services/snackbar/snackbar.service';

import { MyPlantsComponent } from './my-plants.component';

interface MyPlantsPrivate {
  openAddPanel: () => void;
  onAddCancelled: () => void;
  onPlantAdded: (plant: Plant) => void;
}

const CALL_ONCE = 1;
const FIRST_INDEX = 0;
const SECOND_INDEX = 1;

const MOCK_PLANT: Plant = {
  IdPlant: 'abc-123',
  IdUser: 'user-456',
  name: 'Poppy',
  mood: 'happy',
  AiContext: null,
  createdAt: '2026-01-01T00:00:00Z',
  changedAt: '2026-01-01T00:00:00Z'
};

describe('MyPlantsComponent', () => {

  let component: MyPlantsComponent;
  let fixture: ComponentFixture<MyPlantsComponent>;

  const PLANT_SERVICE_MOCK = {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn()
  };

  const AUTH_SERVICE_MOCK = {
    currentUser: vi.fn().mockReturnValue(null)
  };

  const SNACKBAR_SERVICE_MOCK = {
    showNotification: vi.fn()
  };

  beforeEach(async() => {
    PLANT_SERVICE_MOCK.getAll.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        MyPlantsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        { provide: PlantService, useValue: PLANT_SERVICE_MOCK },
        { provide: AuthService, useValue: AUTH_SERVICE_MOCK },
        { provide: SnackbarService, useValue: SNACKBAR_SERVICE_MOCK }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyPlantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise showAddPanel to false', () => {
    expect(component.showAddPanel()).toBe(false);
  });

  it('should initialise plants to an empty array', () => {
    expect(component.plants()).toEqual([]);
  });

  it('should call PlantService.getAll on init', () => {
    expect(PLANT_SERVICE_MOCK.getAll).toHaveBeenCalledTimes(CALL_ONCE);
  });

  it('should set isLoading to false after a successful load', () => {
    expect(component.isLoading()).toBe(false);
  });

  it('should populate the plants signal after a successful load', async() => {
    // --- ARRANGE ---
    PLANT_SERVICE_MOCK.getAll.mockReturnValue(of([MOCK_PLANT]));

    // --- ACT ---
    component.ngOnInit();
    await fixture.whenStable();

    // --- ASSERT ---
    expect(component.plants()).toEqual([MOCK_PLANT]);
  });

  it('should set isLoading to false even when getAll returns an error', async() => {
    // --- ARRANGE ---
    PLANT_SERVICE_MOCK.getAll.mockReturnValue(throwError(() => new Error('Server error')));

    // --- ACT ---
    component.ngOnInit();
    await fixture.whenStable();

    // --- ASSERT ---
    expect(component.isLoading()).toBe(false);
  });

  describe('openAddPanel()', () => {

    it('should set showAddPanel to true', () => {
      // --- ACT ---
      (component as unknown as MyPlantsPrivate).openAddPanel();

      // --- ASSERT ---
      expect(component.showAddPanel()).toBe(true);
    });

  });

  describe('onAddCancelled()', () => {

    it('should set showAddPanel back to false', () => {
      // --- ARRANGE ---
      component.showAddPanel.set(true);

      // --- ACT ---
      (component as unknown as MyPlantsPrivate).onAddCancelled();

      // --- ASSERT ---
      expect(component.showAddPanel()).toBe(false);
    });

  });

  describe('onPlantAdded()', () => {

    it('should prepend the new plant to the beginning of the list', () => {
      // --- ARRANGE ---
      const EXISTING_PLANT: Plant = { ...MOCK_PLANT, IdPlant: 'existing-1', name: 'Manu' };
      component.plants.set([EXISTING_PLANT]);

      // --- ACT ---
      (component as unknown as MyPlantsPrivate).onPlantAdded(MOCK_PLANT);

      // --- ASSERT ---
      expect(component.plants()[FIRST_INDEX]).toEqual(MOCK_PLANT);
      expect(component.plants()[SECOND_INDEX]).toEqual(EXISTING_PLANT);
    });

    it('should close the add panel after a plant is added', () => {
      // --- ARRANGE ---
      component.showAddPanel.set(true);

      // --- ACT ---
      (component as unknown as MyPlantsPrivate).onPlantAdded(MOCK_PLANT);

      // --- ASSERT ---
      expect(component.showAddPanel()).toBe(false);
    });

  });

});
