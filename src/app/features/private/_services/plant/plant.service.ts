import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SupabaseService } from '@core/_services/supabase/supabase.service';
import { Plant, PlantCreate } from '@app/features/private/_models/plant/plant.model';

const SCHEMA = 'growlogic';
const TABLE = 'plant';

@Injectable({
  providedIn: 'root'
})

export class PlantService {

  private readonly supabase = inject(SupabaseService).client;

  getAll(): Observable<Plant[]> {
    return from(
      this.supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select()
        .order('createdAt', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }

        return (data ?? []) as Plant[];
      })
    );
  }

  create(payload: PlantCreate): Observable<Plant> {
    return from(
      this.supabase
        .schema(SCHEMA)
        .from(TABLE)
        .insert(payload)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }

        return data as Plant;
      })
    );
  }
}
