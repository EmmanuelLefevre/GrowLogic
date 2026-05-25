import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SnackbarService } from '@core/_services/snackbar/snackbar.service';
import { AuthService } from '@core/_services/auth/auth.service';

import { SENSOR_TYPES, SensorTypeConfig } from '@features/private/_config/sensor-types/sensor-types.constant';
import { Sensor, SensorTypeKey } from '@features/private/_models/sensor/sensor.model';
import { Plant } from '@features/private/_models/plant/plant.model';
import { SensorService } from '@features/private/_services/sensor/sensor.service';

@Component({
  selector: 'connect-sensor',
  imports: [
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './connect-sensor.component.html',
  styleUrl: './connect-sensor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ConnectSensorComponent {

  private readonly sensorService = inject(SensorService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly authService = inject(AuthService);

  readonly plants = input.required<Plant[]>();

  readonly sensorConnected = output<Sensor>();
  readonly cancelled = output<void>();

  readonly isLoading = signal(false);

  readonly selectedType = signal<SensorTypeKey | null>(null);
  readonly selectedPlantId = signal<string | null>(null);

  readonly sensorTypes: SensorTypeConfig[] = SENSOR_TYPES;

  protected onSelectType(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedType.set(value as SensorTypeKey);
  }

  protected onSelectPlant(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedPlantId.set(value || null);
  }

  protected onCancel(): void {
    this.selectedType.set(null);
    this.selectedPlantId.set(null);
    this.cancelled.emit();
  }

  protected onSubmit(): void {
    const typeKey = this.selectedType();
    const plantId = this.selectedPlantId();

    if (!typeKey || !plantId) return;

    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    const selectedPlant = this.plants().find(p => p.id === plantId);
    if (!selectedPlant) return;

    const typeConfig = this.sensorTypes.find(t => t.key === typeKey)!;
    const sensorName = `${typeConfig.label} - ${selectedPlant.name}`;

    this.isLoading.set(true);

    this.sensorService.create({
      idUser: userId,
      idPlant: plantId,
      type: typeKey,
      name: sensorName
    }).subscribe({
      next: (sensor: Sensor) => {
        this.isLoading.set(false);
        this.selectedType.set(null);
        this.selectedPlantId.set(null);

        this.snackbarService.showNotification('PAGES.PLANTS.SENSORS.CONNECT.SUCCESS', 'created');
        this.sensorConnected.emit(sensor);
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        console.error('[ConnectSensor] Erreur lors de la connexion :', err);
        this.snackbarService.showNotification('PAGES.PLANTS.SENSORS.CONNECT.ERROR', 'red-alert');
      }
    });
  }
}
