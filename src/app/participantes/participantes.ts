import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Participantes } from '../modelo';
import { Tabla } from '../tabla/tabla';

@Component({
  selector: 'app-participantes',
  imports: [Tabla],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './participantes.html',
  styleUrl: './participantes.css',
})
export class ParticipantesCurso {
  protected readonly idTitulo = `t-participantes-${Math.random().toString(36).slice(2, 7)}`;
  readonly datos = input.required<Participantes>();
}
