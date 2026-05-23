import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SupabaseService } from '@core/_services/supabase/supabase.service';
import { Question, QuestionCreate } from '@features/private/_models/question/question.model';

const RECENT_LIMIT = 5;
const SCHEMA = 'growlogic';
const TABLE = 'question';

@Injectable({
  providedIn: 'root'
})

export class QuestionService {

  private readonly supabase = inject(SupabaseService).client;

  getByPlantId(plantId: string): Observable<Question[]> {
    return from(
      this.supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select('*, answer(*)')
        .eq('idPlant', plantId)
        .order('createdAt', { ascending: false })
        .limit(RECENT_LIMIT)
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }

        return ((data ?? []) as Question[]).reverse();
      })
    );
  }

  create(payload: QuestionCreate): Observable<Question> {
    return from(
      this.supabase
        .schema(SCHEMA)
        .from(TABLE)
        .insert(payload)
        .select('*, answer(*)')
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }

        return data as Question;
      })
    );
  }
}
