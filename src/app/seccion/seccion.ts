import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Seccion } from '../modelo';
import { Galeria } from '../galeria/galeria';
import { Tabla } from '../tabla/tabla';

@Component({
  selector: 'app-seccion',
  imports: [Galeria, Tabla],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seccion.html',
  styleUrl: './seccion.css',
  host: { '[class.alterna]': 'indice() % 2 === 1' },
})
export class SeccionContenido {
  readonly seccion = input.required<Seccion>();
  readonly indice = input.required<number>();
}
