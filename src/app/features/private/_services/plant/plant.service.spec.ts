/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { SupabaseService } from '@core/_services/supabase/supabase.service';

import { Plant, PlantCreate } from '@features/private/_models/plant/plant.model';

import { PlantService } from './plant.service';

describe('PlantService', () => {

  let service: PlantService;
  let supabaseClientMock: any;

  const MOCK_PLANT: Plant = {
    id: '123-uuid',
    idUser: 'user-uuid',
    name: 'Monstera',
    mood: 'happy',
    aiContext: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const MOCK_PLANT_CREATE: PlantCreate = {
    name: 'Monstera',
    mood: 'happy',
    idUser: 'user-uuid'
  };

  beforeEach(() => {
    // --- MOCK SUPABASE CHAINABLE API ---
    supabaseClientMock = {
      schema: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
    };

    TestBed.configureTestingModule({
      providers: [
        PlantService,
        {
          provide: SupabaseService,
          useValue: { client: supabaseClientMock }
        }
      ]
    });

    service = TestBed.inject(PlantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return a list of plants on success', () => {
      // --- ARRANGE ---
      supabaseClientMock.order.mockResolvedValue({
        data: [MOCK_PLANT],
        error: null
      });

      // --- ACT ---
      service.getAll().subscribe((plants) => {
        // --- ASSERT ---
        expect(plants).toEqual([MOCK_PLANT]);
        expect(supabaseClientMock.schema).toHaveBeenCalledWith('growlogic');
        expect(supabaseClientMock.from).toHaveBeenCalledWith('plant');
        expect(supabaseClientMock.select).toHaveBeenCalled();
        expect(supabaseClientMock.order).toHaveBeenCalledWith('createdAt', { ascending: false });
      });
    });

    it('should return an empty array if data is null', () => {
      // --- ARRANGE ---
      supabaseClientMock.order.mockResolvedValue({
        data: null,
        error: null
      });

      // --- ACT ---
      service.getAll().subscribe((plants) => {
        // --- ASSERT ---
        expect(plants).toEqual([]);
      });
    });

    it('should throw an error if supabase returns an error', async() => {
      // --- ARRANGE ---
      const errorMock = new Error('Database error');
      supabaseClientMock.order.mockResolvedValue({
        data: null,
        error: errorMock
      });

      // --- ACT & ASSERT ---
      await expect(firstValueFrom(service.getAll())).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should return a single plant on success', () => {
      // --- ARRANGE ---
      supabaseClientMock.single.mockResolvedValue({
        data: MOCK_PLANT,
        error: null
      });

      // --- ACT ---
      service.getById('123-uuid').subscribe((plant) => {
        // --- ASSERT ---
        expect(plant).toEqual(MOCK_PLANT);
        expect(supabaseClientMock.schema).toHaveBeenCalledWith('growlogic');
        expect(supabaseClientMock.from).toHaveBeenCalledWith('plant');
        expect(supabaseClientMock.select).toHaveBeenCalled();
        expect(supabaseClientMock.eq).toHaveBeenCalledWith('IdPlant', '123-uuid');
        expect(supabaseClientMock.single).toHaveBeenCalled();
      });
    });

    it('should throw an error if supabase returns an error', async() => {
      // --- ARRANGE ---
      const errorMock = new Error('Plant not found');
      supabaseClientMock.single.mockResolvedValue({
        data: null,
        error: errorMock
      });

      // --- ACT & ASSERT ---
      await expect(firstValueFrom(service.getById('123-uuid'))).rejects.toThrow('Plant not found');
    });
  });

  describe('create', () => {
    it('should create and return the new plant on success', () => {
      // --- ARRANGE ---
      supabaseClientMock.single.mockResolvedValue({
        data: MOCK_PLANT,
        error: null
      });

      // --- ACT ---
      service.create(MOCK_PLANT_CREATE).subscribe((plant) => {
        // --- ASSERT ---
        expect(plant).toEqual(MOCK_PLANT);
        expect(supabaseClientMock.schema).toHaveBeenCalledWith('growlogic');
        expect(supabaseClientMock.from).toHaveBeenCalledWith('plant');
        expect(supabaseClientMock.insert).toHaveBeenCalledWith(MOCK_PLANT_CREATE);
        expect(supabaseClientMock.select).toHaveBeenCalled();
        expect(supabaseClientMock.single).toHaveBeenCalled();
      });
    });

    it('should throw an error if supabase returns an error during creation', async() => {
      // --- ARRANGE ---
      const errorMock = new Error('Insert failed');
      supabaseClientMock.single.mockResolvedValue({
        data: null,
        error: errorMock
      });

      // --- ACT & ASSERT ---
      await expect(firstValueFrom(service.create(MOCK_PLANT_CREATE))).rejects.toThrow('Insert failed');
    });
  });
});
