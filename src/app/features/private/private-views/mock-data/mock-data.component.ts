import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '@core/_services/auth/auth.service';
import { SnackbarService } from '@core/_services/snackbar/snackbar.service';

import { Plant } from '@features/private/_models/plant/plant.model';
import { Sensor } from '@features/private/_models/sensor/sensor.model';
import { ReadingStatus, SensorReadingCreate } from '@features/private/_models/sensor-reading/sensor-reading.model';
import { PlantService } from '@features/private/_services/plant/plant.service';
import { SensorService } from '@features/private/_services/sensor/sensor.service';
import { SensorReadingService } from '@features/private/_services/sensor-reading/sensor-reading.service';

import { BackgroundComponent } from '@shared/components/background/background.component';
import { MainButtonComponent } from '@shared/components/button/main-button.component';

// ─── Time constants ───────────────────────────────────────────────────────────

const START_DATE = new Date('2026-05-01T00:00:00');
const CHUNK_SIZE = 500;
const TWO_HOURS_MS = 7_200_000;
const ONE_HOUR_MS = 3_600_000;

// ─── Evaporation rates (% moisture lost per hour) ─────────────────────────────

const EVAP_LOW = 0.15;
const EVAP_HIGH = 0.70;
const EVAP_MED = 0.45;
const EVAP_DEFAULT = 0.35;
const EVAP_RANDOM = 0.1;

// ─── Initial moisture (%) ─────────────────────────────────────────────────────

const MOISTURE_START_LOW = 20;
const MOISTURE_START_HIGH = 70;
const MOISTURE_START_MED = 65;

// ─── Humidity thresholds — cactus / succulente ────────────────────────────────

const HUM_CACTUS_CRIT_LOW = 5;
const HUM_CACTUS_CRIT_HIGH = 50;
const HUM_CACTUS_WARN_LOW = 10;
const HUM_CACTUS_WARN_HIGH = 40;

// ─── Humidity thresholds — tropicale / fougere / aquatique ───────────────────

const HUM_TROP_CRIT_LOW = 30;
const HUM_TROP_CRIT_HIGH = 92;
const HUM_TROP_WARN_LOW = 45;
const HUM_TROP_WARN_HIGH = 85;

// ─── Humidity thresholds — default ───────────────────────────────────────────

const HUM_DEF_CRIT_LOW = 20;
const HUM_DEF_CRIT_HIGH = 88;
const HUM_DEF_WARN_LOW = 35;
const HUM_DEF_WARN_HIGH = 80;

// ─── Temperature thresholds ──────────────────────────────────────────────────

const TEMP_CRIT_LOW = 15;
const TEMP_CRIT_HIGH = 30;
const TEMP_WARN_LOW = 18;
const TEMP_WARN_HIGH = 26;

// ─── Temperature simulation ──────────────────────────────────────────────────

const TEMP_HOURS = 24;
const TEMP_TROUGH_H = 2;
const TEMP_BASE = 21;
const TEMP_AMPLITUDE = 2;
const TEMP_NOISE = 0.6;
const ROUND_FACTOR = 100;
const HALF_RANDOM = 0.5;

// ─── Moisture / watering simulation ──────────────────────────────────────────

const FIRST_PLANT_IDX = 1;
const WATER_THRESHOLD_1 = 5;
const WATER_TARGET_1 = 70;
const WATER_THRESHOLD_D = 40;
const WATER_TARGET_D = 75;
const WATER_NOISE = 4;
const MOISTURE_MIN = 0;
const MOISTURE_MAX = 100;
const FULL_PERCENT = 100;
const ZERO_COUNT = 0;

// ─── Algorithm helpers ────────────────────────────────────────────────────────

function getEvapRate(typePlant: string): number {
  switch (typePlant) {
    case 'cactus':
    case 'succulente': return EVAP_LOW;
    case 'tropicale':
    case 'fougere':
    case 'aquatique': return EVAP_HIGH;
    case 'fleur':
    case 'herbe':
    case 'grimpante': return EVAP_MED;
    default: return EVAP_DEFAULT;
  }
}

function getInitialMoisture(typePlant: string): number {
  switch (typePlant) {
    case 'cactus':
    case 'succulente': return MOISTURE_START_LOW;
    case 'tropicale':
    case 'fougere':
    case 'aquatique': return MOISTURE_START_HIGH;
    default: return MOISTURE_START_MED;
  }
}

function getHumidityStatus(value: number, typePlant: string): ReadingStatus {
  switch (typePlant) {
    case 'cactus':
    case 'succulente':
      if (value < HUM_CACTUS_CRIT_LOW || value > HUM_CACTUS_CRIT_HIGH) return 'critical';
      if (value < HUM_CACTUS_WARN_LOW || value > HUM_CACTUS_WARN_HIGH) return 'warning';
      return 'optimal';
    case 'tropicale':
    case 'fougere':
    case 'aquatique':
      if (value < HUM_TROP_CRIT_LOW || value > HUM_TROP_CRIT_HIGH) return 'critical';
      if (value < HUM_TROP_WARN_LOW || value > HUM_TROP_WARN_HIGH) return 'warning';
      return 'optimal';
    default:
      if (value < HUM_DEF_CRIT_LOW || value > HUM_DEF_CRIT_HIGH) return 'critical';
      if (value < HUM_DEF_WARN_LOW || value > HUM_DEF_WARN_HIGH) return 'warning';
      return 'optimal';
  }
}

function getTemperatureStatus(value: number): ReadingStatus {
  if (value < TEMP_CRIT_LOW || value > TEMP_CRIT_HIGH) return 'critical';
  if (value < TEMP_WARN_LOW || value > TEMP_WARN_HIGH) return 'warning';
  return 'optimal';
}

function simulateTemperature(date: Date): number {
  const h = date.getHours();
  // Peak at 14h, trough at 2h — sinusoidal indoor curve
  const angle = (Math.PI * TEMP_AMPLITUDE / TEMP_HOURS) * (h - TEMP_TROUGH_H) - Math.PI / TEMP_AMPLITUDE;
  const noise = (Math.random() - HALF_RANDOM) * TEMP_NOISE;
  return Math.round((TEMP_BASE + TEMP_AMPLITUDE * Math.sin(angle) + noise) * ROUND_FACTOR) / ROUND_FACTOR;
}

function simulateMoisture(
  current: number,
  plantIndex: number,
  typePlant: string
): number {
  const evap = getEvapRate(typePlant) + Math.random() * EVAP_RANDOM;
  let next = current - evap;

  const wateringThreshold = plantIndex === FIRST_PLANT_IDX ? WATER_THRESHOLD_1 : WATER_THRESHOLD_D;
  const targetMoisture = plantIndex === FIRST_PLANT_IDX ? WATER_TARGET_1 : WATER_TARGET_D;

  if (next <= wateringThreshold) {
    next = targetMoisture + (Math.random() - HALF_RANDOM) * WATER_NOISE;
  }

  return Math.round(Math.min(MOISTURE_MAX, Math.max(MOISTURE_MIN, next)) * ROUND_FACTOR) / ROUND_FACTOR;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'mock-data',
  imports: [
    BackgroundComponent,
    DatePipe,
    MainButtonComponent,
    TranslateModule
  ],
  templateUrl: './mock-data.component.html',
  styleUrl: './mock-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MockDataComponent implements OnInit {

  private readonly plantService = inject(PlantService);
  private readonly sensorService = inject(SensorService);
  private readonly sensorReadingService = inject(SensorReadingService);
  private readonly authService = inject(AuthService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly destroyRef = inject(DestroyRef);

  readonly plants = signal<Plant[]>([]);
  readonly sensors = signal<Sensor[]>([]);
  readonly lastReadingDate = signal<string | null>(null);

  readonly isLoading = signal(true);
  readonly isGenerating = signal(false);

  readonly totalReadings = signal(ZERO_COUNT);
  readonly insertedReadings = signal(ZERO_COUNT);

  readonly canGenerate = signal(false);

  ngOnInit(): void {
    this.loadContext();
  }

  private async loadContext(): Promise<void> {
    try {
      const [plants, sensors, lastReading] = await Promise.all([
        firstValueFrom(this.plantService.getAll()),
        firstValueFrom(this.sensorService.getAll()),
        firstValueFrom(this.sensorReadingService.getLatestReading())
      ]);

      // Sort plants ascending (oldest = index 0)
      const sortedPlants = [...plants].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      this.plants.set(sortedPlants);
      this.sensors.set(sensors);
      this.lastReadingDate.set(lastReading?.createdAt ?? null);
      this.canGenerate.set(!!sortedPlants.length && !!sensors.length);
    }
    catch {
      this.snackbarService.showNotification('PAGES.MOCK_DATA.LOAD_ERROR', 'red-alert');
    }
    finally {
      this.isLoading.set(false);
    }
  }

  get progress(): number {
    const total = this.totalReadings();
    if (!total) return ZERO_COUNT;
    return Math.round((this.insertedReadings() / total) * FULL_PERCENT);
  }

  protected async onGenerate(): Promise<void> {
    if (this.isGenerating()) return;

    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    const plants = this.plants();
    const sensors = this.sensors();

    // ── 1. Determine start date ─────────────────────────────────────
    const now = new Date();
    let startDate: Date;
    const lastDateStr = this.lastReadingDate();

    if (!lastDateStr) {
      startDate = new Date(START_DATE);
    }
    else {
      const lastDate = new Date(lastDateStr);
      const diffMs = now.getTime() - lastDate.getTime();

      if (diffMs <= TWO_HOURS_MS) {
        this.snackbarService.showNotification('PAGES.MOCK_DATA.UP_TO_DATE', 'created');
        return;
      }
      // Resume 1 hour after last inserted reading
      startDate = new Date(lastDate.getTime() + ONE_HOUR_MS);
    }

    // ── 2. Build hourly timestamps ──────────────────────────────────
    const hours: Date[] = [];
    const cursor = new Date(startDate);
    while (cursor <= now) {
      hours.push(new Date(cursor));
      cursor.setTime(cursor.getTime() + ONE_HOUR_MS);
    }

    // ── 3. Generate readings ────────────────────────────────────────
    this.isGenerating.set(true);
    this.totalReadings.set(hours.length * sensors.length);
    this.insertedReadings.set(ZERO_COUNT);

    const allReadings: SensorReadingCreate[] = [];

    for (const sensor of sensors) {
      const plantIndex = plants.findIndex(p => p.id === sensor.idPlant);
      const plant = plants[plantIndex];
      if (!plant) continue;

      let moisture = getInitialMoisture(plant.typePlant);

      for (const hour of hours) {
        let value: number;
        let unit: string;
        let status: ReadingStatus;

        if (sensor.type === 'temperature') {
          value = simulateTemperature(hour);
          unit = '°C';
          status = getTemperatureStatus(value);
        }
        else {
          moisture = simulateMoisture(moisture, plantIndex, plant.typePlant);
          value = moisture;
          unit = '%';
          status = getHumidityStatus(value, plant.typePlant);
        }

        allReadings.push({
          idSensor: sensor.id,
          idUser: userId,
          value,
          unit,
          status,
          createdAt: hour.toISOString()
        });
      }
    }

    // ── 4. Bulk insert by chunks ────────────────────────────────────
    try {
      for (let i = 0; i < allReadings.length; i += CHUNK_SIZE) {
        const chunk = allReadings.slice(i, i + CHUNK_SIZE);
        await firstValueFrom(this.sensorReadingService.bulkCreate(chunk));
        this.insertedReadings.update(n => n + chunk.length);
      }

      // Refresh last reading date
      const latest = await firstValueFrom(this.sensorReadingService.getLatestReading());
      this.lastReadingDate.set(latest?.createdAt ?? null);

      this.snackbarService.showNotification('PAGES.MOCK_DATA.SUCCESS', 'created');
    }
    catch {
      this.snackbarService.showNotification('PAGES.MOCK_DATA.ERROR', 'red-alert');
    }
    finally {
      this.isGenerating.set(false);
    }
  }
}
