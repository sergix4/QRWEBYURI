// Servidor estático mínimo: node qa/servir.mjs <carpeta> <puerto>
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
const [carpeta, puerto = '4300'] = process.argv.slice(2);
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
createServer(async (req, res) => {
  let ruta = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (ruta.endsWith('/')) ruta += 'index.html';
  try {
    const dato = await readFile(join(carpeta, ruta));
    res.writeHead(200, { 'content-type': tipos[extname(ruta)] ?? 'application/octet-stream' });
    res.end(dato);
  } catch { res.writeHead(404).end('no encontrado'); }
}).listen(Number(puerto), () => console.log('http://localhost:' + puerto));
