// Prepara los datos de la página antes de compilar.
//
//   node scripts/preparar.mjs             versión pública (sin pendientes)
//   node scripts/preparar.mjs --borrador  versión borrador (pendientes resaltados)
//   BORRADOR=1 node scripts/preparar.mjs  equivale a --borrador
//
// Lee datos/contenido.json, escribe src/app/datos/contenido.generado.json y PENDIENTES.md.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const borrador = process.argv.includes('--borrador') || process.env.BORRADOR === '1';

const CLAVES_INTERNAS = ['pendientes', 'acceso_invitado', 'nota_interna', 'credito_fotos', 'notas_internas'];
const TEXTO_PENDIENTE = /pendiente/i;
// Cadenas que jamás pueden llegar a la versión pública.
const PROHIBIDAS = [/Prueba2026/i, /contraseña/i, /usuario/i, /\b9 estudiantes/i, /nueve estudiantes/i];

const fuente = JSON.parse(readFileSync(join(raiz, 'datos', 'contenido.json'), 'utf8'));
const omitidos = [];

// Notas internas (permisos, rostros) que no viajan en el repositorio público. Solo existen en la
// máquina de quien edita (datos/interno.json, ignorado por git) y solo se mezclan en el borrador.
const rutaInterno = join(raiz, 'datos', 'interno.json');
const interno = borrador && existsSync(rutaInterno) ? JSON.parse(readFileSync(rutaInterno, 'utf8')) : null;
if (interno) {
  for (const sec of fuente.secciones) {
    for (const f of sec.galeria ?? []) if (interno.notas_fotos?.[f.archivo]) f.nota_interna = interno.notas_fotos[f.archivo];
    if (interno.credito_fotos?.[sec.id]) sec.credito_fotos = interno.credito_fotos[sec.id];
    if (interno.notas_secciones?.[sec.id]) sec.notas_internas = interno.notas_secciones[sec.id];
  }
}
const errores = [];

/** Lee el tamaño de un JPEG o PNG sin dependencias. */
function dimensiones(ruta) {
  const b = readFileSync(ruta);
  if (b[0] === 0x89 && b[1] === 0x50) return { ancho: b.readUInt32BE(16), alto: b.readUInt32BE(20) };
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) {
      return { alto: b.readUInt16BE(i + 5), ancho: b.readUInt16BE(i + 7) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error(`No pude leer las dimensiones de ${ruta}`);
}

function procesarSeccion(sec) {
  const s = structuredClone(sec);
  const ctx = `${s.titulo}`;

  for (const clave of CLAVES_INTERNAS) {
    if (clave in s) {
      const valor = s[clave];
      const detalle = Array.isArray(valor) ? valor : [valor];
      for (const d of detalle) omitidos.push({ seccion: ctx, motivo: `Campo \`${clave}\``, texto: d });
      if (!borrador) delete s[clave];
    }
  }

  if (s.galeria) {
    const galeria = [];
    for (const foto of s.galeria) {
      if (foto.publicar === false) {
        omitidos.push({ seccion: ctx, motivo: 'Foto con `publicar: false`', texto: foto.archivo });
        if (!borrador) continue;
        galeria.push({ ...foto, sinPublicar: true, ancho: 4, alto: 3 });
        continue;
      }
      if (foto.nota_interna) {
        omitidos.push({ seccion: ctx, motivo: `Nota interna de ${foto.archivo}`, texto: foto.nota_interna });
        if (!borrador) delete foto.nota_interna;
      }
      const ruta = join(raiz, 'public', foto.archivo);
      if (!existsSync(ruta)) { errores.push(`Falta la foto ${foto.archivo}`); continue; }
      galeria.push({ ...foto, ...dimensiones(ruta) });
    }
    for (const f of galeria) delete f.publicar;
    s.galeria = galeria;
    if (!galeria.length) delete s.galeria;
  }

  for (const v of [...(s.videos ?? []), ...(s.videos_extra ?? [])]) {
    if (!/^[\w-]{11}$/.test(v.youtube_id)) errores.push(`Id de YouTube no válido: ${v.youtube_id}`);
  }

  if (s.participantes) {
    const p = s.participantes;
    if (p.publicar === false) {
      omitidos.push({ seccion: ctx, motivo: 'Participantes con `publicar: false`', texto: p.titulo });
      delete s.participantes;
    } else {
      delete p.publicar;
      if ('nota_interna' in p) {
        omitidos.push({ seccion: ctx, motivo: 'Nota interna de participantes', texto: p.nota_interna });
        delete p.nota_interna;
      }
      const ruta = join(raiz, 'public', p.insignia_imagen);
      if (!existsSync(ruta)) errores.push(`Falta la imagen ${p.insignia_imagen}`);
      else { const d = dimensiones(ruta); p.insignia_ancho = d.ancho; p.insignia_alto = d.alto; }
    }
  }

  // En la versión pública, cualquier texto que diga PENDIENTE se descarta.
  if (!borrador) limpiarTextos(s, ctx);
  return s;
}

function limpiarTextos(nodo, ctx) {
  if (Array.isArray(nodo)) {
    for (let i = nodo.length - 1; i >= 0; i--) {
      const v = nodo[i];
      if (typeof v === 'string' && TEXTO_PENDIENTE.test(v)) { omitidos.push({ seccion: ctx, motivo: 'Texto con PENDIENTE', texto: v }); nodo.splice(i, 1); }
      else if (v && typeof v === 'object') limpiarTextos(v, ctx);
    }
  } else if (nodo && typeof nodo === 'object') {
    for (const [k, v] of Object.entries(nodo)) {
      if (typeof v === 'string' && TEXTO_PENDIENTE.test(v)) { omitidos.push({ seccion: ctx, motivo: `Texto con PENDIENTE en \`${k}\``, texto: v }); delete nodo[k]; }
      else if (v && typeof v === 'object') limpiarTextos(v, ctx);
    }
  }
}

const salida = {
  borrador,
  sitio: fuente.sitio,
  cifras: fuente.cifras,
  secciones: fuente.secciones.map(procesarSeccion),
  aliados: fuente.aliados,
};

if (!borrador) {
  const texto = JSON.stringify(salida);
  for (const re of PROHIBIDAS) if (re.test(texto)) errores.push(`El contenido público contiene ${re}`);
}

if (errores.length) {
  console.error('Error al preparar el contenido:\n- ' + errores.join('\n- '));
  process.exit(1);
}

mkdirSync(join(raiz, 'src', 'app', 'datos'), { recursive: true });
writeFileSync(join(raiz, 'src', 'app', 'datos', 'contenido.generado.json'), JSON.stringify(salida, null, 2) + '\n');

// PENDIENTES.md se calcula sobre datos/contenido.json.
const porSeccion = new Map();
for (const o of omitidos) {
  // Las fotos de WEEF no se listan en PENDIENTES.md.
  if (o.motivo.startsWith('Foto con') && o.seccion.startsWith('WEEF')) continue;
  if (!porSeccion.has(o.seccion)) porSeccion.set(o.seccion, []);
  porSeccion.get(o.seccion).push(o);
}
let md = '# Pendientes\n\n';
md += 'Lo que no aparece en la versión pública y por qué. Lo genera `scripts/preparar.mjs` a partir de `datos/contenido.json`; no se edita a mano. ';
md += 'Para verlo resaltado en la página: `npm run build:borrador` o `npm run start:borrador`.\n\n';
md += 'Motivos: los campos `pendientes`, `acceso_invitado`, `nota_interna` y `credito_fotos`, los textos que dicen PENDIENTE y las fotos con `publicar: false` quedan fuera de la versión pública.\n';
for (const [seccion, items] of porSeccion) {
  md += `\n## ${seccion}\n\n`;
  for (const o of items) md += `- **${o.motivo}.** ${o.texto}\n`;
}
// El borrador puede mezclar notas internas locales: solo la versión pública escribe PENDIENTES.md.
if (!borrador) writeFileSync(join(raiz, 'PENDIENTES.md'), md);

console.log(`Contenido listo (${borrador ? 'borrador' : 'público'}). Elementos fuera de la versión pública: ${omitidos.length}.`);
