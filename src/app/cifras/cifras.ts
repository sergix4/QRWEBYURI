import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Cifra } from '../modelo';

@Component({
  selector: 'app-cifras',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cifras" aria-labelledby="t-cifras">
      <div class="contenedor">
        <h2 id="t-cifras" class="oculto">Cifras del proyecto</h2>
        <ul>
          @for (c of cifras(); track c.texto) {
            <li><span class="valor">{{ c.valor }}</span><span class="texto">{{ c.texto }}</span></li>
          }
        </ul>
      </div>
    </section>
  `,
  styleUrl: './cifras.css',
})
export class Cifras {
  readonly cifras = input.required<Cifra[]>();
}
