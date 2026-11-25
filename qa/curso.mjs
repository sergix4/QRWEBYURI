// node qa/curso.mjs <url> <carpeta-salida>
// Sección del curso a 360, 390, 768 y 1280 px: capturas, desbordes, consola, red y videos.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
const [url = 'http://localhost:4310/', salida = 'capturas'] = process.argv.slice(2);
mkdirSync(salida, { recursive: true });
const origen = new URL(url).origin;
const r = { consola: [], externasCarga: [], desbordes: {}, filas: null, videos: {}, youtubeTrasPulsar: [] };
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
for (const ancho of [360, 390, 768, 1280]) {
  const ctx = await nav.newContext({ viewport: { width: ancho, height: 900 }, isMobile: ancho < 700, hasTouch: ancho < 700, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const externas = [];
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) r.consola.push(`${ancho}: ${m.type()}: ${m.text()}`); });
  p.on('pageerror', (e) => r.consola.push(`${ancho}: pageerror: ${e.message}`));
  p.on('request', (q) => { if (!q.url().startsWith(origen) && !q.url().startsWith('data:')) externas.push(q.url()); });
  await p.goto(url, { waitUntil: 'networkidle' });
  if (ancho === 1280) r.externasCarga = [...externas];
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 100)); } await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });
  await p.locator('#curso details.extra summary').click();
  await p.waitForTimeout(300);
  r.desbordes[ancho] = await p.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }));
  if (ancho === 1280) r.filas = await p.locator('#curso app-participantes tbody tr').count();
  await p.locator('app-seccion:has(#curso)').screenshot({ path: `${salida}/${ancho}-curso-videos-tabla.png` });
  await p.locator('#curso .videos').first().screenshot({ path: `${salida}/${ancho}-curso-videos.png` });
  await p.locator('#curso app-participantes').screenshot({ path: `${salida}/${ancho}-curso-participantes.png` });
  if (ancho === 1280) {
    // Pulsar reproducir en los 8 videos: debe aparecer un iframe nocookie con título y la red de YouTube solo después.
    const antes = externas.length;
    const botones = p.locator('#curso app-video button.portada');
    const n = await botones.count();
    for (let i = 0; i < n; i++) await botones.nth(0).click();
    await p.waitForTimeout(2500);
    r.videos = await p.evaluate(() => [...document.querySelectorAll('#curso app-video')].map((v) => ({
      titulo: v.querySelector('figcaption strong')?.textContent,
      iframe: v.querySelector('iframe')?.getAttribute('src'),
      tituloIframe: v.querySelector('iframe')?.getAttribute('title'),
      enlace: v.querySelector('figcaption a')?.getAttribute('href'),
    })));
    r.youtubeTrasPulsar = [...new Set(externas.slice(antes).map((u) => new URL(u).host))];
    await p.locator('#curso .videos').first().screenshot({ path: `${salida}/${ancho}-curso-videos-reproduciendo.png` });
  }
  await ctx.close();
}
await nav.close();
writeFileSync(`${salida}/curso-resultado.json`, JSON.stringify(r, null, 2));
console.log(JSON.stringify(r, null, 1));
