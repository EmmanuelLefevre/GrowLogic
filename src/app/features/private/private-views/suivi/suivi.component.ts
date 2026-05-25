import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { Plant } from '@features/private/_models/plant/plant.model';
import { Sensor } from '@features/private/_models/sensor/sensor.model';
import { ChartPeriod, PlantChartData } from '@features/private/_models/sensor-reading/sensor-reading.model';
import { PlantService } from '@features/private/_services/plant/plant.service';
import { SensorService } from '@features/private/_services/sensor/sensor.service';
import { SensorReadingService } from '@features/private/_services/sensor-reading/sensor-reading.service';
import { BackgroundComponent } from '@shared/components/background/background.component';

export interface PlantChartState {
  plant: Plant;
  sensors: Sensor[];
  chartData: PlantChartData | null;
  isLoading: boolean;
}

const TEMP_COLOR = '#f97316';
const HUM_COLOR = '#3b82f6';

function buildChartBase(color: string, unit: string): {
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  fill: ApexFill;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  colors: string[];
} {
  return {
    chart: {
      type: 'area',
      height: 200,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
      fontFamily: 'inherit',
      animations: { enabled: true, speed: 400 },
    },
    xaxis: {
      type: 'datetime',
      labels: { datetimeUTC: false, style: { fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val} ${unit}`,
        style: { fontSize: '11px' },
      },
    },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
    dataLabels: { enabled: false },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      x: { format: 'dd/MM HH:mm' },
      y: { formatter: (val: number) => `${val} ${unit}` },
    },
    colors: [color],
  };
}

@Component({
  selector: 'suivi',
  imports: [
    NgApexchartsModule,
    BackgroundComponent,
    TranslateModule,
    UpperCasePipe,
  ],
  templateUrl: './suivi.component.html',
  styleUrl: './suivi.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuiviComponent implements OnInit {

  private readonly plantService = inject(PlantService);
  private readonly sensorService = inject(SensorService);
  private readonly sensorReadingService = inject(SensorReadingService);
  private readonly destroyRef = inject(DestroyRef);

  readonly periods: { key: ChartPeriod; labelKey: string }[] = [
    { key: 'day', labelKey: 'PAGES.SUIVI.PERIOD_DAY' },
    { key: 'week', labelKey: 'PAGES.SUIVI.PERIOD_WEEK' },
    { key: 'month', labelKey: 'PAGES.SUIVI.PERIOD_MONTH' },
  ];

  readonly selectedPeriod = signal<ChartPeriod>('week');
  readonly plantStates = signal<PlantChartState[]>([]);
  readonly isLoading = signal(true);

  readonly TEMP_COLOR = TEMP_COLOR;
  readonly HUM_COLOR = HUM_COLOR;

  ngOnInit(): void {
    forkJoin({
      plants: this.plantService.getAll(),
      sensors: this.sensorService.getAll(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ plants, sensors }) => {
          const states: PlantChartState[] = plants.map(plant => ({
            plant,
            sensors: sensors.filter(s => s.idPlant === plant.id),
            chartData: null,
            isLoading: true,
          }));
          this.plantStates.set(states);
          this.isLoading.set(false);
          this.loadAllChartData();
        },
        error: () => this.isLoading.set(false),
      });
  }

  selectPeriod(period: ChartPeriod): void {
    if (this.selectedPeriod() === period) return;
    this.selectedPeriod.set(period);
    this.plantStates.update(states =>
      states.map(s => ({ ...s, isLoading: true, chartData: null }))
    );
    this.loadAllChartData();
  }

  private loadAllChartData(): void {
    const period = this.selectedPeriod();
    const states = this.plantStates();

    for (const state of states) {
      if (!state.sensors.length) {
        this.updatePlantState(state.plant.id, { isLoading: false, chartData: null });
        continue;
      }

      this.sensorReadingService
        .getChartReadings(state.plant.id, period)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: chartData =>
            this.updatePlantState(state.plant.id, { chartData, isLoading: false }),
          error: () =>
            this.updatePlantState(state.plant.id, { chartData: null, isLoading: false }),
        });
    }
  }

  private updatePlantState(
    plantId: string,
    patch: Partial<PlantChartState>,
  ): void {
    this.plantStates.update(states =>
      states.map(s => s.plant.id === plantId ? { ...s, ...patch } : s)
    );
  }

  buildTempSeries(chartData: PlantChartData): ApexAxisChartSeries {
    return [{ name: 'Température', data: chartData.temperature }];
  }

  buildHumSeries(chartData: PlantChartData): ApexAxisChartSeries {
    return [{ name: 'Humidité', data: chartData.humidity }];
  }

  buildTempOptions(unit: string): ReturnType<typeof buildChartBase> {
    return buildChartBase(TEMP_COLOR, unit);
  }
  buildHumOptions(unit: string): ReturnType<typeof buildChartBase> {
    return buildChartBase(HUM_COLOR, unit);
  }

  hasTemperature(data: PlantChartData | null): boolean {
    return !!data?.temperature?.length;
  }

  hasHumidity(data: PlantChartData | null): boolean {
    return !!data?.humidity?.length;
  }
}
