import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SupabaseService } from '@core/_services/supabase/supabase.service';
import { Sensor, SensorCreate } from '@features/private/_models/sensor/sensor.model';

const SCHEMA = 'growlogic';
const TABLE = 'sensor';

@Injectable({
  providedIn: 'root'
})

export class SensorService {

  private readonly supabase = inject(SupabaseService).client;

  getAll(): Observable<Sensor[]> {
    return from(
      this.supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select()
        .order('createdAt', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as Sensor[];
      })
    );
  }

  create(payload: SensorCreate): Observable<Sensor> {
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

        return data as Sensor;
      })
    );
  }
}
