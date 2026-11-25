import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Sitio } from '../modelo';

@Component({
  selector: 'app-pie',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="pie">
      <div class="contenedor">
        <p>{{ sitio().evento }}.</p>
        <p>{{ sitio().programa }}. {{ sitio().semillero }}.</p>
        <p><a href="#contenido">Volver al inicio</a></p>
      </div>
    </footer>
  `,
  styleUrl: './pie.css',
})
export class Pie {
  readonly sitio = input.required<Sitio>();
}
