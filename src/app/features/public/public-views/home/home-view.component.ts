import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { BackgroundComponent } from '@app/shared/components/background/background.component';

@Component({
  selector: 'home-view',
  imports: [
    BackgroundComponent,
    CommonModule,
    TranslateModule
  ],
  templateUrl: './home-view.component.html',
  styleUrl: './home-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HomeViewComponent {

  readonly appNameKey = signal('META.DEFAULT.APP_NAME');
}
