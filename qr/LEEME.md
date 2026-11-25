# Código QR

Genera el QR con la URL final de la página:

```bash
python3 -m venv qr/.venv
qr/.venv/bin/pip install -r qr/requirements.txt
qr/.venv/bin/python qr/generar_qr.py https://<dueño>.github.io/<repositorio>/
```

Escribe `qr/qr.png` (más de 2000 x 2000 px) y `qr/qr.svg`, negro sobre blanco, zona de silencio de 4 módulos y corrección de errores Q. El script decodifica el PNG, y la matriz del SVG, y se detiene si no devuelven exactamente la URL.

`qr.png` y `qr.svg` no se guardan en el repositorio: se generan con la URL definitiva. La URL final se confirma en Settings > Pages una vez publicada la página.

## Antes de imprimir

1. Escanear el QR desde la pantalla con dos celulares distintos (por ejemplo uno Android y uno iPhone) y confirmar que abre la página.
2. Imprimir una prueba pequeña, del tamaño más chico que se vaya a usar, y escanearla también con dos celulares distintos.
3. Solo después imprimir el póster. Usar el SVG para el póster y mantener la zona blanca alrededor del código.
