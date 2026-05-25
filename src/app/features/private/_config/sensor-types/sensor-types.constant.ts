import { SensorTypeKey } from '@features/private/_models/sensor/sensor.model';

export interface SensorTypeConfig {
  key: SensorTypeKey;
  labelKey: string;
  label: string;
}

export const SENSOR_TYPES: SensorTypeConfig[] = [
  {
    key: 'humidity',
    labelKey: 'PAGES.PLANTS.SENSORS.TYPES.HUMIDITY',
    label: 'Capteur d\'humidité'
  },
  {
    key: 'temperature',
    labelKey: 'PAGES.PLANTS.SENSORS.TYPES.TEMPERATURE',
    label: 'Capteur de température'
  }
];
