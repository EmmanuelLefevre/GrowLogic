import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';

import { Plant } from '@app/features/private/_models/plant/plant.model';
import { PlantService } from '@app/features/private/_services/plant/plant.service';

import { AddPlantComponent } from './add-plant/add-plant.component';
import { BackgroundComponent } from '@shared/components/background/background.component';
import { MainButtonComponent } from '@shared/components/button/main-button.component';

@Component({
  selector: 'my-plants',
  imports: [
    AddPlantComponent,
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
  private readonly destroyRef = inject(DestroyRef);

  readonly plants = signal<Plant[]>([]);

  readonly showAddPanel = signal(false);
  readonly isLoading = signal(true);

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
