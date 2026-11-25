# Informe de QA

Navegador: Chromium del sistema con Playwright (`qa/capturas.mjs`, `qa/auditoria.mjs`), sobre `ng serve` y sobre el build de producción servido con `qa/servir.mjs`. Lighthouse 12 sobre el build de producción. No se probó en celulares físicos ni en Safari.

## Puntuaciones (Lighthouse, build de producción)

| Perfil | Rendimiento | Accesibilidad | Buenas prácticas |
|---|---|---|---|
| Celular | 99 | 100 | 100 |
| Escritorio | 99 | 100 | 100 |

En celular: LCP 1,7 s, CLS 0, TBT 50 ms. Informes crudos en `qa/capturas/lighthouse-*.json`. axe-core (WCAG 2 A y AA, 2.1 A y AA, buenas prácticas): 0 violaciones a 390 y a 1280 px.

## Qué se comprobó

- **Capturas por sección** a 390, 768 y 1280 px: encabezado, cifras, cada sección, tablas, galerías, aliados y pie, más la página completa. Lista abajo.
- **Desbordes:** `scrollWidth` igual a `clientWidth` en los tres anchos. Sin scroll lateral de la página. El menú pasa a dos filas en celular y no se desplaza; medido a 360, 375, 390 y 414 px, los cinco enlaces quedan dentro de la pantalla.
- **Imágenes:** 0 rotas. Todas con `width`, `height`, `alt` y `loading="lazy"`. Ninguna deformada (la proporción mostrada coincide con la natural; el logo difiere en el tercer decimal por redondeo de píxeles).
- **Consola y red:** 0 errores y 0 advertencias en consola (`ng serve`, build de producción y build con base href `/QRWEBYURI/`); 0 peticiones a otros dominios.
- **Anclas:** cada enlace del menú deja el título de la sección por debajo de la barra fija (título a 112 px, barra termina en 49 px) en los tres anchos.
- **Teclado:** Tab recorre el enlace de salto, los cinco enlaces del menú, el botón del curso y «Volver al inicio»; todos con contorno de foco de 3 px. Un solo `h1`; el orden es h1, h2, h3 sin saltos.
- **Tamaños:** ningún texto menor de 16 px y ningún enlace con alto menor de 44 px a 390 px.
- **Público contra borrador:** en el público no aparece «pendiente» en el texto de la página, ni `nota_interna`, ni `training-camp-02-sala.jpg` (ni en el HTML ni en `dist`). En el borrador aparecen resaltados en amarillo los pendientes, el acceso de invitado y un recuadro «Foto sin publicar» en lugar de la foto. En el código compilado quedan las palabras «Pendiente» y `nota_interna` de las plantillas del modo borrador, que no se muestran.
- **Privacidad:** `Prueba2026`, `contraseña` y `usuario` no aparecen en el build público (el script de preparación falla si aparecen). Ningún «9 estudiantes»; el Training Camp dice 7 en el resumen, los datos y las cifras. La foto de 2024 tenía credenciales legibles con nombres: se difuminaron en la copia del repositorio (`public/fotos/semillero-04-icpc-nacional-2024.jpg`). La foto de la sala de cómputo no está en el repositorio.
- **JSON contra interfaces:** al quitar `titulo` de una sección, el build falla con TS2322.
- **Base href:** el build con `--base-href /QRWEBYURI/` servido en ese subdirectorio carga todo sin errores.
- **Peso:** build de producción sin fotos, 184 KB (JS 163 KB, 53 KB comprimido). Fotos: unos 3,5 MB.

## Defectos encontrados y corregidos

Ronda 1:
1. Tabla de la ICPC en celular: el título se encogía en una columna angosta. Pasó de `caption` a encabezado sobre la tabla, con `aria-labelledby`.
2. Galerías con huecos y tarjetas desiguales en 768 y 1280 px (la tercera foto quedaba sola). Se pasó a columnas.
3. Encabezado en escritorio con la mitad derecha vacía por un ancho de título demasiado estrecho. Se amplió.
4. Etiquetas de datos de 14 px, bajo el mínimo de 16 px. Corregido en encabezado, datos y tarjetas de tabla; igual la nota de foto de 15 px.
5. Primer script de capturas medía las imágenes antes de cargarlas (36 «rotas» falsas). Se corrigió el script, no la página.

Ronda 3 (menú y WEEF):
8. El menú se deslizaba en horizontal a 390 px y dejaba «WEEF 2026» cortado. Ahora se reparte en dos filas; se ajustó `scroll-padding-top` para que las anclas no queden tapadas.
9. Se añadió la galería de WEEF (2 fotos) y «Lugar y fechas»; las capturas se repitieron: sin errores, desbordes ni imágenes rotas.

Ronda 2:
6. Con columnas, las capturas de Moodle se leían en orden raro. Se pasó esa galería a rejilla de dos columnas con tamaños iguales.
7. Repetidas todas las capturas y comprobaciones tras los cambios: sin defectos nuevos.

## Abiertos

- Las capturas de Moodle se ven con texto muy pequeño en 390 px; es la captura, no la página. Se puede ampliar con zoom del navegador.
- En celular la barra fija ocupa 89 px (dos filas de enlaces), cerca de una décima de la pantalla.
- Capturas por elemento muestran la barra fija encima del contenido: es un efecto de la captura, no un defecto de la página.
- Otras fotos del semillero tienen credenciales pequeñas; no se leen, pero conviene revisarlas.
- No se probó con celulares reales ni con lector de pantalla.

## Comparación con la versión estática de `main`

Lo que tenía la versión estática y dónde está ahora. «Cambia» significa que el contenido nuevo (`datos/contenido.json`) lo dice distinto o no lo trae.

| Sección anterior | Estado |
|---|---|
| Portada: título, programa, semillero, líder, evento | Igual, en el encabezado. |
| Cifras | Igual, salvo 9 que ahora es 7 en el Training Camp (decisión del LEEME de insumos). |
| Semillero Goslint | Nueva: no existía en la versión estática. |
| Training Camp: resumen, datos, párrafos, temas, 3 fotos | Igual, con 7 estudiantes en vez de 9. Añade un párrafo y una nota (primera participación presencial). |
| Curso: resumen, datos, párrafos, botón a Moodle, temáticas | Igual y ampliado (foros, podcast, cooperante). **Nuevo:** galería de 4 capturas. |
| Clase espejo: resumen, fecha, inscritos, asistencia, aliado, dos párrafos | Presente. Se dejó fuera, a propósito, lo que no está en `contenido.json` (hackathon, soluciones enviadas, ranking, gráfica). |
| WEEF: resumen, evento, participantes, espacios, dos párrafos, instituciones, fotos | Presente, con lugar y fechas y 2 fotos del `contenido.json`. Las demás fotos de la versión vieja no se usan. |
| Perfiles de estudiantes | Quitados a propósito (sin nombres de estudiantes). |
| Aliados y pie | Igual. |
| Barra: Training Camp, Curso, Clase espejo, WEEF, Perfiles | Ahora: Semillero, Training Camp, Curso, Clase espejo, WEEF. |

La página solo muestra lo que trae `contenido.json`; no se repone nada de la versión vieja que no esté ahí.

## Capturas (`qa/capturas/`)

Por cada ancho (`390-`, `768-`, `1280-`): `encabezado`, `cifras`, `semillero`, `semillero-tabla`, `semillero-galeria`, `training-camp`, `training-camp-galeria`, `curso`, `curso-galeria`, `clase-espejo`, `weef`, `aliados`, `pie`, `pagina-completa`. Además `resultado.json` y los dos informes de Lighthouse.


## Ronda de cambios de la profe: videos y participantes del curso

Se ejecutó sobre el build de producción servido con `qa/servir.mjs` y con `qa/curso.mjs` (Chromium con Playwright).

- Capturas de la sección del curso a 360, 390, 768 y 1280 px: `qa/capturas/<ancho>-curso-videos-tabla.png`, `-curso-videos.png`, `-curso-participantes.png` y, a 1280, `1280-curso-videos-reproduciendo.png`. Resultados en `qa/capturas/curso-resultado.json`.
- Sin scroll horizontal a 360, 390, 768 y 1280 px (scrollWidth igual a clientWidth).
- Carga inicial: cero peticiones a dominios externos. Al pulsar reproducir en los 8 videos aparece un iframe de `youtube-nocookie.com` con `title` y las peticiones a YouTube empiezan en ese momento. Cada enlace «Ver en YouTube» apunta al id correcto.
- Tabla de participantes: 12 filas. Ninguna cadena `Loaiza`, `Prueba2026` ni `contraseña` en `dist/`. La nota interna de la tabla vive solo en `datos/interno.json` (ignorado por git).
- Consola: sin errores ni advertencias hasta antes de reproducir. Tras reproducir, Chromium registra `Permissions policy violation: compute-pressure` que viene del reproductor de YouTube, no de la página.
- axe (WCAG 2 A/AA, 2.1 A/AA): 0 violaciones a 390 y a 1280 px. Teclado: Tab llega a cada botón «Reproducir video», cada enlace «Ver en YouTube» y el resumen del desplegable, con foco visible. Objetivos menores de 44 px y textos menores de 16 px: ninguno.
- Lighthouse (`lighthouse-curso-mobile.json`, `lighthouse-curso-desktop.json`): celular 99 rendimiento, 100 accesibilidad, 100 buenas prácticas; escritorio 99, 100, 100. Igual que antes.
- `npm run build` sin errores, también con `--base-href /QRWEBYURI/`.

Sin probar: reproducción real en celulares, Safari y lector de pantalla. La reproducción se comprobó por la aparición del iframe y de las peticiones a YouTube, no se vio el video corriendo.
