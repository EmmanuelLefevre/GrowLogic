import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'my-plants',
  imports: [],
  templateUrl: './my-plants.component.html',
  styleUrl: './my-plants.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MyPlantsComponent {

}
