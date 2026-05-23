import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { Plant } from '@app/features/private/_models/plant/plant.model';
import { Question, QuestionCreate } from '@app/features/private/_models/question/question.model';
import { PlantService } from '@app/features/private/_services/plant/plant.service';
import { QuestionService } from '@app/features/private/_services/question/question.service';
import { AuthService } from '@core/_services/auth/auth.service';

const MESSAGE_MIN_LENGTH = 1;
const MESSAGE_MAX_LENGTH = 500;

@Component({
  selector: 'plant-chat',
  imports: [
    DatePipe,
    UpperCasePipe,
    RouterLink,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './plant-chat.component.html',
  styleUrl: './plant-chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PlantChatComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly plantService = inject(PlantService);
  private readonly questionService = inject(QuestionService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly plant = signal<Plant | null>(null);
  readonly questions = signal<Question[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly isSending = signal(false);

  readonly messageControl = new FormControl('', [
    Validators.required,
    Validators.minLength(MESSAGE_MIN_LENGTH),
    Validators.maxLength(MESSAGE_MAX_LENGTH)
  ]);

  private plantId = '';

  ngOnInit(): void {
    this.plantId = this.route.snapshot.paramMap.get('plantId') ?? '';

    forkJoin({
      plant: this.plantService.getById(this.plantId),
      questions: this.questionService.getByPlantId(this.plantId)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ plant, questions }) => {
          this.plant.set(plant);
          this.questions.set(questions);
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        }
      });
  }

  protected onSend(): void {
    if (this.messageControl.invalid || this.isSending()) return;

    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    const payload: QuestionCreate = {
      question: this.messageControl.value!.trim(),
      IdPlant: this.plantId,
      IdUser: userId
    };

    this.isSending.set(true);

    this.questionService.create(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (question) => {
          this.questions.update(list => [...list, question]);
          this.messageControl.reset();
          this.isSending.set(false);
        },
        error: () => {
          this.isSending.set(false);
        }
      });
  }
}
