import { SensorTypeKey } from '@features/private/_models/sensor/sensor.model';

export type ReadingStatus = 'optimal' | 'warning' | 'critical';

export interface SensorReading {
  id: string;
  idSensor: string;
  idUser: string;
  value: number;
  unit: string;
  status: ReadingStatus;
  createdAt: string;
}

export type SensorReadingCreate = Pick<SensorReading, 'idSensor' | 'idUser' | 'value' | 'unit' | 'status'> & {
  createdAt?: string;
};

export interface LatestSensorReading extends SensorReading {
  idPlant: string;
  sensorType: SensorTypeKey;
}

export interface PlantSensorSummary {
  humidity: LatestSensorReading | null;
  temperature: LatestSensorReading | null;
}

export type PlantSensorMap = Record<string, PlantSensorSummary>;

export interface SensorReadingWithSensor extends SensorReading {
  sensor: {
    idPlant: string;
    type: SensorTypeKey;
    name: string;
  };
}

export interface PlantRawData {
  temperature: SensorReadingWithSensor[];
  humidity: SensorReadingWithSensor[];
  loadedAt: Date;
}

export type ChartPeriod = 'day' | 'week' | 'month';

export interface ChartReading {
  bucket: string;
  sensorType: SensorTypeKey;
  avgValue: number;
  unit: string;
}

export interface PlantChartData {
  temperature: [number, number][];
  humidity: [number, number][];
  tempUnit: string;
  humUnit: string;
}
