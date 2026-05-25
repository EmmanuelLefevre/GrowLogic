import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SupabaseService } from '@core/_services/supabase/supabase.service';
import { ChartPeriod, LatestSensorReading, PlantChartData, PlantRawData, SensorReading, SensorReadingCreate, SensorReadingWithSensor } from '@features/private/_models/sensor-reading/sensor-reading.model';

const SCHEMA = 'growlogic';
const TABLE = 'sensor_reading';
const DEFAULT_LIMIT = 50;
const DEFAULT_RAW_MONTHS = 2;
const SINGLE_RECORD_LIMIT = 1;

@Injectable({
  providedIn: 'root'
})

export class SensorReadingService {

  private readonly supabase = inject(SupabaseService).client;

  getAllBySensor(idSensor: string): Observable<SensorReading[]> {
    return from(
      this.supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select()
        .eq('idSensor', idSensor)
        .order('createdAt', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as SensorReading[];
      })
    );
  }

  getLastBySensor(idSensor: string, limit = DEFAULT_LIMIT): Observable<SensorReading[]> {
    return from(
      this.supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select()
        .eq('idSensor', idSensor)
        .order('createdAt', { ascending: false })
        .limit(limit)
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as SensorReading[];
      })
    );
  }

  getAlertsBySensor(idSensor: string): Observable<SensorReading[]> {
    return from(
      this.supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select()
        .eq('idSensor', idSensor)
        .in('status', ['warning', 'critical'])
        .order('createdAt', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as SensorReading[];
      })
    );
  }

  getLatestPerUser(): Observable<LatestSensorReading[]> {
    return from(
      this.supabase
        .schema(SCHEMA)
        .from('latest_sensor_reading')
        .select()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as LatestSensorReading[];
      })
    );
  }

  getRawReadingsByPlant(idPlant: string, months = DEFAULT_RAW_MONTHS): Observable<PlantRawData> {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    return from(
      this.supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select('*, sensor!inner(idPlant, type, name)')
        .eq('sensor.idPlant', idPlant)
        .gte('createdAt', since.toISOString())
        .order('createdAt', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;

        const rows = (data ?? []) as SensorReadingWithSensor[];
        const result: PlantRawData = {
          temperature: rows.filter(r => r.sensor.type === 'temperature'),
          humidity: rows.filter(r => r.sensor.type === 'humidity'),
          loadedAt: new Date(),
        };
        return result;
      })
    );
  }

  getChartReadings(idPlant: string, period: ChartPeriod): Observable<PlantChartData> {
    return from(
      this.supabase
        .schema(SCHEMA)
        .rpc('get_chart_readings', { p_id_plant: idPlant, p_period: period })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        const rows = (data ?? []) as {
          bucket: string;
          sensor_type: string;
          avg_value: number;
          unit: string;
        }[];

        const result: PlantChartData = {
          temperature: [],
          humidity: [],
          tempUnit: '°C',
          humUnit: '%',
        };

        for (const row of rows) {
          const ts = new Date(row.bucket).getTime();
          if (row.sensor_type === 'temperature') {
            result.temperature.push([ts, row.avg_value]);
            result.tempUnit = row.unit;
          }
          else if (row.sensor_type === 'humidity') {
            result.humidity.push([ts, row.avg_value]);
            result.humUnit = row.unit;
          }
        }
        return result;
      })
    );
  }

  getLatestReading(): Observable<SensorReading | null> {
    return from(
      this.supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select()
        .order('createdAt', { ascending: false })
        .limit(SINGLE_RECORD_LIMIT)
        .maybeSingle()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as SensorReading | null;
      })
    );
  }

  bulkCreate(readings: SensorReadingCreate[]): Observable<void> {
    return from(
      this.supabase
        .schema(SCHEMA)
        .from(TABLE)
        .insert(readings)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  create(payload: SensorReadingCreate): Observable<SensorReading> {
    return from(
      this.supabase
        .schema(SCHEMA)
        .from(TABLE)
        .insert(payload)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as SensorReading;
      })
    );
  }

  delete(id: string): Observable<void> {
    return from(
      this.supabase
        .schema(SCHEMA)
        .from(TABLE)
        .delete()
        .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }
}
