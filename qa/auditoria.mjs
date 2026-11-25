// node qa/auditoria.mjs <url>: axe (celular y escritorio) y navegación con teclado.
import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
const url = process.argv[2] ?? 'http://localhost:4300/';
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
for (const [nombre, vp] of [['390', { width: 390, height: 844 }], ['1280', { width: 1280, height: 900 }]]) {
  const p = await (await nav.newContext({ viewport: vp })).newPage();
  await p.goto(url, { waitUntil: 'networkidle' });
  const r = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze();
  console.log(nombre, 'violaciones axe:', r.violations.map((v) => `${v.id} (${v.nodes.length})`));
  if (nombre === '390') {
    const h = await p.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].map((e) => e.tagName + ':' + e.textContent.trim().slice(0, 30)));
    console.log('encabezados:', h.join(' | '));
    // Tab: registrar a dónde va el foco y si tiene contorno visible.
    const pasos = [];
    for (let i = 0; i < 14; i++) {
      await p.keyboard.press('Tab');
      pasos.push(await p.evaluate(() => { const e = document.activeElement; const c = getComputedStyle(e); return `${e.tagName}[${(e.textContent || '').trim().slice(0, 20)}] outline=${c.outlineStyle} ${c.outlineWidth}`; }));
    }
    console.log('Tab:\n' + pasos.join('\n'));
    const peq = await p.evaluate(() => [...document.querySelectorAll('a,button')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.height < 44); }).map((e) => `${e.textContent.trim().slice(0, 25)} ${Math.round(e.getBoundingClientRect().height)}px`));
    console.log('objetivos táctiles < 44px:', peq);
    const letra = await p.evaluate(() => { const m = new Set(); document.querySelectorAll('body *').forEach((e) => { if (e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) { const s = parseFloat(getComputedStyle(e).fontSize); if (s < 16) m.add(e.tagName + '.' + e.className + ':' + s); } }); return [...m]; });
    console.log('textos < 16px:', letra);
  }
}
await nav.close();
