import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Sitio } from '../modelo';

@Component({
  selector: 'app-encabezado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './encabezado.html',
  styleUrl: './encabezado.css',
})
export class Encabezado {
  readonly sitio = input.required<Sitio>();
}
