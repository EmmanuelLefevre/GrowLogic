import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';

import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { PlantMoodKey, Plant } from '@app/features/private/_models/plant/plant.model';
import { PLANT_MOODS, PlantMoodConfig } from '@app/features/private/_config/plant/mood.constant';
import { PlantService } from '@app/features/private/_services/plant/plant.service';
import { SnackbarService } from '@core/_services/snackbar/snackbar.service';
import { AuthService } from '@core/_services/auth/auth.service';

import { GenericInputComponent } from '@shared/components/generic-input/generic-input.component';

const PLANT_NAME_MIN_LENGTH = 2;
const PLANT_NAME_MAX_LENGTH = 50;

@Component({
  selector: 'add-plant',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    GenericInputComponent
  ],
  templateUrl: './add-plant.component.html',
  styleUrl: './add-plant.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddPlantComponent {

  private readonly plantService = inject(PlantService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly authService = inject(AuthService);

  readonly plantAdded = output<Plant>();
  readonly cancelled = output<void>();

  readonly isLoading = signal(false);

  readonly nameControl = new FormControl('', [
    Validators.required,
    Validators.minLength(PLANT_NAME_MIN_LENGTH),
    Validators.maxLength(PLANT_NAME_MAX_LENGTH)
  ]);

  readonly selectedMood = signal<PlantMoodKey | null>(null);

  readonly moods: PlantMoodConfig[] = PLANT_MOODS;

  protected onSelectMood(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedMood.set(value as PlantMoodKey);
  }

  protected onCancel(): void {
    this.nameControl.reset();
    this.selectedMood.set(null);
    this.cancelled.emit();
  }

  protected onSubmit(): void {
    this.nameControl.markAsTouched();

    if (this.nameControl.invalid || !this.selectedMood()) return;

    const userId = this.authService.currentUser()?.id;

    if (!userId) return;

    this.isLoading.set(true);

    this.plantService.create({
      IdUser: userId,
      name: this.nameControl.value!.trim(),
      mood: this.selectedMood()
    }).subscribe({
      next: (plant: Plant) => {
        this.isLoading.set(false);
        this.nameControl.reset();
        this.selectedMood.set(null);

        this.snackbarService.showNotification('PAGES.PLANTS.ADD.SUCCESS', 'created');
        this.plantAdded.emit(plant);
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        console.error('[AddPlant] Erreur lors de la création :', err);
        this.snackbarService.showNotification('PAGES.PLANTS.ADD.ERROR', 'red-alert');
      }
    });
  }
}
