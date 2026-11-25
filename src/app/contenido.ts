import generado from './datos/contenido.generado.json';
import { Contenido } from './modelo';

// La asignación tipada hace fallar el build si el JSON no cumple las interfaces.
export const CONTENIDO: Contenido = generado;
