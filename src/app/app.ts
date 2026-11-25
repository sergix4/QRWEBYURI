import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CONTENIDO } from './contenido';
import { Encabezado } from './encabezado/encabezado';
import { Navegacion } from './navegacion/navegacion';
import { Cifras } from './cifras/cifras';
import { SeccionContenido } from './seccion/seccion';
import { Aliados } from './aliados/aliados';
import { Pie } from './pie/pie';

@Component({
  selector: 'app-root',
  imports: [Encabezado, Navegacion, Cifras, SeccionContenido, Aliados, Pie],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="salto" href="#contenido">Saltar al contenido</a>
    @if (c.borrador) {
      <p class="aviso-borrador" role="status">
        Versión borrador: lo marcado en amarillo no se publica.
      </p>
    }
    <app-navegacion [secciones]="c.secciones" />
    <main id="contenido" tabindex="-1">
      <app-encabezado [sitio]="c.sitio" />
      <app-cifras [cifras]="c.cifras" />
      @for (s of c.secciones; track s.id; let i = $index) {
        <app-seccion [seccion]="s" [indice]="i" />
      }
      <app-aliados [aliados]="c.aliados" />
    </main>
    <app-pie [sitio]="c.sitio" />
  `,
})
export class App {
  protected readonly c = CONTENIDO;
}
