import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';

import { Plant } from '@app/features/private/_models/plant/plant.model';
import { PlantService } from '@app/features/private/_services/plant/plant.service';

import { MainButtonComponent } from '@shared/components/button/main-button.component';
import { AddPlantComponent } from './add-plant/add-plant.component';
import { CapitalizeFirstPipe } from '@shared/_pipes/capitalize-first/capitalize-first';

@Component({
  selector: 'my-plants',
  imports: [
    TranslateModule,
    MainButtonComponent,
    AddPlantComponent,
    CapitalizeFirstPipe
  ],
  templateUrl: './my-plants.component.html',
  styleUrl: './my-plants.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MyPlantsComponent implements OnInit {

  private readonly plantService = inject(PlantService);
  private readonly destroyRef = inject(DestroyRef);

  readonly showAddPanel = signal(false);
  readonly isLoading = signal(true);
  readonly plants = signal<Plant[]>([]);

  ngOnInit(): void {
    this.plantService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (plants) => {
          this.plants.set(plants);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  protected openAddPanel(): void {
    this.showAddPanel.set(true);
  }

  protected onPlantAdded(plant: Plant): void {
    this.plants.update(list => [plant, ...list]);
    this.showAddPanel.set(false);
  }

  protected onAddCancelled(): void {
    this.showAddPanel.set(false);
  }
}
