import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-tabla',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tabla.html',
  styleUrl: './tabla.css',
})
export class Tabla {
  protected readonly idTitulo = `t-tabla-${Math.random().toString(36).slice(2, 7)}`;
  readonly titulo = input<string>();
  readonly nota = input<string>();
  readonly columnas = input.required<string[]>();
  readonly filas = input.required<string[][]>();
}
