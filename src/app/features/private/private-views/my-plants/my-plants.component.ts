import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { Plant } from '@app/features/private/_models/plant/plant.model';
import { LatestSensorReading, PlantSensorMap } from '@app/features/private/_models/sensor-reading/sensor-reading.model';
import { PlantService } from '@app/features/private/_services/plant/plant.service';
import { SensorReadingService } from '@app/features/private/_services/sensor-reading/sensor-reading.service';

import { AddPlantComponent } from './add-plant/add-plant.component';
import { ConnectSensorComponent } from './connect-sensor/connect-sensor.component';
import { BackgroundComponent } from '@shared/components/background/background.component';
import { MainButtonComponent } from '@shared/components/button/main-button.component';

@Component({
  selector: 'my-plants',
  imports: [
    AddPlantComponent,
    ConnectSensorComponent,
    BackgroundComponent,
    MainButtonComponent,
    RouterLink,
    TranslateModule,
    UpperCasePipe,
  ],
  templateUrl: './my-plants.component.html',
  styleUrl: './my-plants.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MyPlantsComponent implements OnInit {

  private readonly plantService = inject(PlantService);
  private readonly sensorReadingService = inject(SensorReadingService);
  private readonly destroyRef = inject(DestroyRef);

  readonly plants = signal<Plant[]>([]);
  readonly plantSensorMap = signal<PlantSensorMap>({});

  readonly showAddPanel = signal(false);
  readonly showConnectSensorPanel = signal(false);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    forkJoin({
      plants: this.plantService.getAll(),
      latestReadings: this.sensorReadingService.getLatestPerUser(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ plants, latestReadings }) => {
          this.plants.set(plants);
          this.plantSensorMap.set(this.buildSensorMap(latestReadings));
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  private buildSensorMap(readings: LatestSensorReading[]): PlantSensorMap {
    const map: PlantSensorMap = {};
    for (const reading of readings) {
      if (!map[reading.idPlant]) {
        map[reading.idPlant] = { humidity: null, temperature: null };
      }
      if (reading.sensorType === 'humidity') {
        map[reading.idPlant].humidity = reading;
      }
      else if (reading.sensorType === 'temperature') {
        map[reading.idPlant].temperature = reading;
      }
    }
    return map;
  }

  protected openAddPanel(): void {
    this.showAddPanel.set(true);
  }

  protected openConnectSensorPanel(): void {
    this.showConnectSensorPanel.set(true);
  }

  protected onPlantAdded(plant: Plant): void {
    this.plants.update(list => [plant, ...list]);
    this.showAddPanel.set(false);
  }

  protected onAddCancelled(): void {
    this.showAddPanel.set(false);
  }

  protected onSensorConnected(): void {
    this.showConnectSensorPanel.set(false);
  }

  protected onConnectSensorCancelled(): void {
    this.showConnectSensorPanel.set(false);
  }
}
