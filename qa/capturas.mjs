// node qa/capturas.mjs <url> <carpeta-salida>
// Capturas por sección a 390, 768 y 1280 px, y verificaciones automáticas.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
const [url = 'http://localhost:4300/', salida = 'capturas'] = process.argv.slice(2);
mkdirSync(salida, { recursive: true });
const anchos = [390, 768, 1280];
const resultado = { consola: [], externas: [], desbordes: {}, imagenes: {}, nav: {} };
const navegador = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const origen = new URL(url).origin;

for (const ancho of anchos) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 1, isMobile: ancho < 700, hasTouch: ancho < 700, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) resultado.consola.push(`${ancho}: ${m.type()}: ${m.text()}`); });
  p.on('pageerror', (e) => resultado.consola.push(`${ancho}: pageerror: ${e.message}`));
  p.on('request', (r) => { if (!r.url().startsWith(origen) && !r.url().startsWith('data:')) resultado.externas.push(r.url()); });
  await p.goto(url, { waitUntil: 'networkidle' });
  // Cargar imágenes lazy recorriendo la página.
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 120)); } await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); window.scrollTo({ top: 0, behavior: 'instant' }); });
  await p.waitForTimeout(400);
  resultado.desbordes[ancho] = await p.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }));
  resultado.imagenes[ancho] = await p.evaluate(() => [...document.images].map((i) => ({ src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0, ratio: +(i.naturalWidth / i.naturalHeight).toFixed(3), mostrado: +(i.clientWidth / i.clientHeight).toFixed(3) })));
  const bloques = { 'encabezado': 'app-encabezado', 'cifras': 'app-cifras', 'aliados': 'app-aliados', 'pie': 'app-pie' };
  for (const [n, sel] of Object.entries(bloques)) await p.locator(sel).screenshot({ path: `${salida}/${ancho}-${n}.png` });
  const ids = await p.evaluate(() => [...document.querySelectorAll('app-seccion section')].map((s) => s.id));
  for (const id of ids) {
    await p.locator(`app-seccion:has(#${id})`).screenshot({ path: `${salida}/${ancho}-${id}.png` });
    const tablas = p.locator(`#${id} app-tabla`);
    if (await tablas.count()) await tablas.first().screenshot({ path: `${salida}/${ancho}-${id}-tabla.png` });
    const gal = p.locator(`#${id} app-galeria`);
    if (await gal.count()) await gal.first().screenshot({ path: `${salida}/${ancho}-${id}-galeria.png` });
  }
  await p.screenshot({ path: `${salida}/${ancho}-pagina-completa.png`, fullPage: true });
  // Navegación: cada ancla debe dejar el título de la sección visible bajo la barra.
  resultado.nav[ancho] = [];
  for (const id of ids) {
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.locator(`nav a[href="#${id}"]`).click();
    await p.waitForTimeout(700);
    const r = await p.evaluate((id) => ({ titulo: document.getElementById('t-' + id).getBoundingClientRect().top, barra: document.querySelector('nav').getBoundingClientRect().bottom }), id);
    resultado.nav[ancho].push({ id, tituloTop: Math.round(r.titulo), barraBottom: Math.round(r.barra), tapado: r.titulo < r.barra });
  }
  await ctx.close();
}
await navegador.close();
writeFileSync(`${salida}/resultado.json`, JSON.stringify(resultado, null, 2));
console.log(JSON.stringify({ consola: resultado.consola, externas: resultado.externas, desbordes: resultado.desbordes, nav: resultado.nav }, null, 1));
console.log('imagenes rotas:', Object.values(resultado.imagenes).flat().filter((i) => !i.ok).length);
console.log('imagenes deformadas:', Object.values(resultado.imagenes).flat().filter((i) => Math.abs(i.ratio - i.mostrado) > 0.02).length);
