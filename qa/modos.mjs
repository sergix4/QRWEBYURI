import { chromium } from 'playwright-core';
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
for (const [n, u] of [['publico', 'http://localhost:4300/'], ['borrador', 'http://localhost:4301/']]) {
  const p = await (await nav.newContext({ viewport: { width: 390, height: 900 } })).newPage();
  await p.goto(u, { waitUntil: 'networkidle' });
  const t = await p.evaluate(() => document.body.innerText);
  const html = await p.content();
  console.log(n, { PENDIENTE: /pendiente/i.test(t), sala: html.includes('training-camp-02-sala'), nota: /permiso de la persona/.test(t), kripto: /Prueba2026|contraseña|usuario/i.test(html), nueve: /\b9\s+estudiantes/.test(t), siete: (t.match(/7 estudiantes|Siete estudiantes|7\nestudiantes/g) || []).length });
  if (n === 'borrador') { await p.evaluate(() => { for (let y = 0; y < document.body.scrollHeight; y += 600) window.scrollTo({ top: y, behavior: 'instant' }); }); await p.waitForTimeout(500);
    await p.locator('app-seccion:has(#training-camp)').screenshot({ path: 'capturas/borrador-390-training-camp.png' }); await p.locator('app-seccion:has(#curso)').screenshot({ path: 'capturas/borrador-390-curso.png' }); }
}
await nav.close();
