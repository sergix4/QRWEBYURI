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
  /** Id de un encabezado externo que da nombre a la tabla. */
  readonly etiquetadaPor = input<string>();
  /** En celular, cada fila ocupa menos alto. */
  readonly compacta = input(false);
  readonly columnas = input.required<string[]>();
  readonly filas = input.required<string[][]>();
}
