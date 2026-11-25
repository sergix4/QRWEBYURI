import { ChangeDetectionStrategy, Component, afterNextRender, input, signal } from '@angular/core';
import { Seccion } from '../modelo';

/** Textos cortos para la barra; si una sección no está aquí se usa su título. */
const ETIQUETAS: Record<string, string> = {
  semillero: 'Semillero',
  'training-camp': 'Training Camp',
  curso: 'Curso',
  'clase-espejo': 'Clase espejo',
  weef: 'WEEF 2026',
};

@Component({
  selector: 'app-navegacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navegacion.html',
  styleUrl: './navegacion.css',
})
export class Navegacion {
  readonly secciones = input.required<Seccion[]>();
  protected readonly activa = signal<string>('');

  constructor() {
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      const obs = new IntersectionObserver(
        (entradas) => {
          for (const e of entradas) {
            if (e.isIntersecting) this.marcar(e.target.id);
          }
        },
        { rootMargin: '-30% 0px -60% 0px' },
      );
      for (const s of this.secciones()) {
        const el = document.getElementById(s.id);
        if (el) obs.observe(el);
      }
    });
  }

  protected etiqueta(s: Seccion): string {
    return ETIQUETAS[s.id] ?? s.titulo;
  }

  private marcar(id: string): void {
    this.activa.set(id);
  }
}
