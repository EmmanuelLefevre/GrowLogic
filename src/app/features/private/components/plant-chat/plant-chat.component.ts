import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { RealtimeChannel } from '@supabase/supabase-js';

import { AuthService } from '@core/_services/auth/auth.service';
import { SupabaseService } from '@core/_services/supabase/supabase.service';

import { Plant } from '@features/private/_models/plant/plant.model';
import { PlantService } from '@features/private/_services/plant/plant.service';
import { Question, QuestionCreate } from '@features/private/_models/question/question.model';
import { QuestionService } from '@features/private/_services/question/question.service';
import { PlantRawData } from '@features/private/_models/sensor-reading/sensor-reading.model';
import { SensorReadingService } from '@features/private/_services/sensor-reading/sensor-reading.service';

const MESSAGE_MIN_LENGTH = 1;
const MESSAGE_MAX_LENGTH = 500;

@Component({
  selector: 'plant-chat',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    UpperCasePipe,
  ],
  templateUrl: './plant-chat.component.html',
  styleUrl: './plant-chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PlantChatComponent implements OnInit, OnDestroy {

  private readonly route = inject(ActivatedRoute);
  private readonly plantService = inject(PlantService);
  private readonly questionService = inject(QuestionService);
  private readonly sensorReadingService = inject(SensorReadingService);
  private readonly authService = inject(AuthService);
  private readonly supabase = inject(SupabaseService).client;
  private readonly destroyRef = inject(DestroyRef);

  readonly plant = signal<Plant | null>(null);
  readonly questions = signal<Question[]>([]);
  readonly plantRawData = signal<PlantRawData | null>(null);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly isSending = signal(false);

  readonly messageControl = new FormControl('', [
    Validators.required,
    Validators.minLength(MESSAGE_MIN_LENGTH),
    Validators.maxLength(MESSAGE_MAX_LENGTH)
  ]);

  private plantId = '';
  private realtimeChannel: RealtimeChannel | null = null;

  ngOnInit(): void {
    this.plantId = this.route.snapshot.paramMap.get('plantId') ?? '';

    forkJoin({
      plant: this.plantService.getById(this.plantId),
      questions: this.questionService.getByPlantId(this.plantId),
      plantRawData: this.sensorReadingService.getRawReadingsByPlant(this.plantId),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ plant, questions, plantRawData }) => {
          this.plant.set(plant);
          this.questions.set(questions);
          this.plantRawData.set(plantRawData);
          this.isLoading.set(false);
          this.subscribeToAnswers();
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.realtimeChannel) {
      this.supabase.removeChannel(this.realtimeChannel);
    }
  }

  protected onSend(): void {
    if (this.messageControl.invalid || this.isSending()) return;

    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    const payload: QuestionCreate = {
      content: this.messageControl.value!.trim(),
      idPlant: this.plantId,
      idUser: userId,
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
        },
      });
  }

  private subscribeToAnswers(): void {
    this.realtimeChannel = this.supabase
      .channel(`answers-plant-${this.plantId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'growlogic', table: 'answer' },
        () => this.refreshQuestions(),
      )
      .subscribe();
  }

  private refreshQuestions(): void {
    this.questionService.getByPlantId(this.plantId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (questions) => this.questions.set(questions),
      });
  }
}
