/** Estructura de datos/contenido.json. Si el JSON no la cumple, el build falla. */

export interface Sitio {
  titulo: string;
  titulo_proyecto: string;
  subtitulo: string;
  programa: string;
  semillero: string;
  lider: string;
  evento: string;
}

export interface Cifra {
  valor: string;
  texto: string;
}

export interface Dato {
  etiqueta: string;
  valor: string;
}

export interface Foto {
  archivo: string;
  alt: string;
  pie: string;
  ancho: number;
  alto: number;
  /** Solo en borrador: la foto existe en el JSON pero no se publica. */
  sinPublicar?: boolean;
  /** Solo en borrador. */
  nota_interna?: string;
}

export interface Enlace {
  texto: string;
  url: string;
}

export interface Video {
  id: string;
  titulo: string;
  youtube_id: string;
  descripcion?: string;
  destacado?: boolean;
}

export interface VideoExtra {
  titulo: string;
  youtube_id: string;
}

export interface Participantes {
  titulo: string;
  nota: string;
  columnas: string[];
  filas: string[][];
  insignia_imagen: string;
  insignia_alt: string;
  insignia_ancho: number;
  insignia_alto: number;
}

export interface Seccion {
  id: string;
  titulo: string;
  resumen: string;
  datos?: Dato[];
  parrafos?: string[];
  tabla_titulo?: string;
  tabla_nota?: string;
  tabla_columnas?: string[];
  tabla_filas?: string[][];
  temas_titulo?: string;
  temas?: string[];
  instituciones_contacto_titulo?: string;
  instituciones_contacto?: string[];
  enlace?: Enlace;
  galeria?: Foto[];
  videos?: Video[];
  videos_extra_titulo?: string;
  videos_extra?: VideoExtra[];
  participantes?: Participantes;
  fuentes?: string[];
  /** Solo en borrador. */
  pendientes?: string[];
  acceso_invitado?: string;
  credito_fotos?: string;
  /** Solo en borrador. */
  notas_internas?: string[];
}

export interface Contenido {
  borrador: boolean;
  sitio: Sitio;
  cifras: Cifra[];
  secciones: Seccion[];
  aliados: string[];
}
