import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, input, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/** Video de YouTube que no pide nada a YouTube hasta que la persona pulsa reproducir. */
@Component({
  selector: 'app-video',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video.html',
  styleUrl: './video.css',
})
export class VideoYoutube {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly injector = inject(Injector);

  readonly titulo = input.required<string>();
  readonly youtubeId = input.required<string>();
  readonly descripcion = input<string>();

  protected readonly activo = signal(false);
  protected readonly marco = viewChild<ElementRef<HTMLIFrameElement>>('marco');
  // El id se valida en scripts/preparar.mjs (11 caracteres de letras, números, guion y guion bajo).
  protected readonly embed = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${this.youtubeId()}?autoplay=1&rel=0`),
  );
  protected readonly enlace = computed(() => `https://www.youtube.com/watch?v=${this.youtubeId()}`);

  protected reproducir(): void {
    this.activo.set(true);
    afterNextRender(() => this.marco()?.nativeElement.focus(), { injector: this.injector });
  }
}
