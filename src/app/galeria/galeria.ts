import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Foto } from '../modelo';

@Component({
  selector: 'app-galeria',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './galeria.html',
  styleUrl: './galeria.css',
})
export class Galeria {
  readonly fotos = input.required<Foto[]>();
  readonly tipo = input<'fotos' | 'capturas'>('fotos');
}
