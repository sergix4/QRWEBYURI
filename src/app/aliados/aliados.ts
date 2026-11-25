import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-aliados',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="aliados" class="aliados" aria-labelledby="t-aliados">
      <div class="contenedor">
        <h2 id="t-aliados">Aliados</h2>
        <ul>
          @for (a of aliados(); track a) {
            <li>{{ a }}</li>
          }
        </ul>
      </div>
    </section>
  `,
  styleUrl: './aliados.css',
})
export class Aliados {
  readonly aliados = input.required<string[]>();
}
