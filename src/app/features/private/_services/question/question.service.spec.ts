/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { SupabaseService } from '@core/_services/supabase/supabase.service';
import { Question, QuestionCreate } from '@features/private/_models/question/question.model';

import { QuestionService } from './question.service';

describe('QuestionService', () => {

  let service: QuestionService;
  let supabaseClientMock: any;

  const MOCK_QUESTION_1: Question = {
    id: 'q-123',
    content: 'Question 1',
    idPlant: 'p-123',
    idUser: 'u-123',
    answer: null,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  };

  const MOCK_QUESTION_2: Question = {
    id: 'q-456',
    content: 'Question 2',
    idPlant: 'p-123',
    idUser: 'u-123',
    answer: null,
    createdAt: '2024-01-01T11:00:00Z',
    updatedAt: '2024-01-01T11:00:00Z'
  };

  const MOCK_CREATE_PAYLOAD: QuestionCreate = {
    content: 'Nouvelle question',
    idPlant: 'p-123',
    idUser: 'u-123'
  };

  beforeEach(() => {
    // --- MOCK SUPABASE CHAINABLE API ---
    supabaseClientMock = {
      schema: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    };

    TestBed.configureTestingModule({
      providers: [
        QuestionService,
        {
          provide: SupabaseService,
          useValue: { client: supabaseClientMock }
        }
      ]
    });

    service = TestBed.inject(QuestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getByPlantId', () => {
    it('should return a reversed list of questions on success', () => {
      // --- ARRANGE ---
      supabaseClientMock.limit.mockResolvedValue({
        data: [MOCK_QUESTION_2, MOCK_QUESTION_1],
        error: null
      });

      // --- ACT ---
      service.getByPlantId('p-123').subscribe((questions) => {
        // --- ASSERT ---
        expect(questions).toEqual([MOCK_QUESTION_1, MOCK_QUESTION_2]);

        expect(supabaseClientMock.schema).toHaveBeenCalledWith('growlogic');
        expect(supabaseClientMock.from).toHaveBeenCalledWith('question');
        expect(supabaseClientMock.select).toHaveBeenCalledWith('*, answer(*)');
        expect(supabaseClientMock.eq).toHaveBeenCalledWith('idPlant', 'p-123');
        expect(supabaseClientMock.order).toHaveBeenCalledWith('createdAt', { ascending: false });
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(supabaseClientMock.limit).toHaveBeenCalledWith(5);
      });
    });

    it('should return an empty array if data is null', () => {
      // --- ARRANGE ---
      supabaseClientMock.limit.mockResolvedValue({
        data: null,
        error: null
      });

      // --- ACT ---
      service.getByPlantId('p-123').subscribe((questions) => {
        // --- ASSERT ---
        expect(questions).toEqual([]);
      });
    });

    it('should throw an error if supabase returns an error', async() => {
      // --- ARRANGE ---
      const errorMock = new Error('Database connection lost');
      supabaseClientMock.limit.mockResolvedValue({
        data: null,
        error: errorMock
      });

      // --- ACT & ASSERT ---
      await expect(firstValueFrom(service.getByPlantId('p-123'))).rejects.toThrow('Database connection lost');
    });
  });

  describe('create', () => {
    it('should create and return the new question with its answer loaded', () => {
      // --- ARRANGE ---
      supabaseClientMock.single.mockResolvedValue({
        data: MOCK_QUESTION_1,
        error: null
      });

      // --- ACT ---
      service.create(MOCK_CREATE_PAYLOAD).subscribe((question) => {
        // --- ASSERT ---
        expect(question).toEqual(MOCK_QUESTION_1);
        expect(supabaseClientMock.schema).toHaveBeenCalledWith('growlogic');
        expect(supabaseClientMock.from).toHaveBeenCalledWith('question');
        expect(supabaseClientMock.insert).toHaveBeenCalledWith(MOCK_CREATE_PAYLOAD);
        expect(supabaseClientMock.select).toHaveBeenCalledWith('*, answer(*)');
        expect(supabaseClientMock.single).toHaveBeenCalled();
      });
    });

    it('should throw an error if supabase returns an error during creation', async() => {
      // --- ARRANGE ---
      const errorMock = new Error('Insert failed due to RLS');
      supabaseClientMock.single.mockResolvedValue({
        data: null,
        error: errorMock
      });

      // --- ACT & ASSERT ---
      await expect(firstValueFrom(service.create(MOCK_CREATE_PAYLOAD))).rejects.toThrow('Insert failed due to RLS');
    });
  });
});
