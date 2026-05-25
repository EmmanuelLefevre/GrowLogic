export type SensorTypeKey = 'humidity' | 'temperature';

export interface Sensor {
  id: string;
  idUser: string;
  idPlant: string;
  type: SensorTypeKey;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type SensorCreate = Pick<Sensor, 'idUser' | 'idPlant' | 'type' | 'name'>;
