#!/usr/bin/env python3
"""Genera el código QR de la página.

Uso:
    python3 qr/generar_qr.py https://usuario.github.io/repositorio/

Escribe qr/qr.png (al menos 2000x2000 px) y qr/qr.svg, negro sobre blanco,
con zona de silencio de 4 módulos y corrección de errores Q. Después
decodifica el PNG y el SVG rasterizado con OpenCV y falla si no devuelven
exactamente la URL recibida.
"""
import sys
from pathlib import Path

import cv2
import numpy as np
import segno
from PIL import Image

SALIDA = Path(__file__).resolve().parent
BORDE = 4          # zona de silencio, en módulos
NIVEL = "q"        # corrección de errores Q (25 %)
MINIMO_PX = 2000


def decodificar(imagen_bgr):
    """OpenCV falla con imágenes muy grandes: se prueba el original y reducciones."""
    detector = cv2.QRCodeDetector()
    alto = imagen_bgr.shape[0]
    for lado in (alto, 1000, 700, 500):
        img = imagen_bgr if lado == alto else cv2.resize(imagen_bgr, (lado, lado), interpolation=cv2.INTER_AREA)
        texto, _, _ = detector.detectAndDecode(img)
        if texto:
            return texto
    return ""


def main():
    if len(sys.argv) != 2 or not sys.argv[1].startswith(("http://", "https://")):
        sys.exit("Uso: python3 qr/generar_qr.py https://dueño.github.io/repositorio/")
    url = sys.argv[1]

    qr = segno.make(url, error=NIVEL, micro=False)
    modulos = qr.symbol_size(border=BORDE)[0]
    escala = -(-MINIMO_PX // modulos)  # redondeo hacia arriba: píxeles por módulo entero

    ruta_png = SALIDA / "qr.png"
    ruta_svg = SALIDA / "qr.svg"
    qr.save(ruta_png, scale=escala, border=BORDE, dark="black", light="white")
    qr.save(ruta_svg, scale=10, border=BORDE, dark="black", light="white", xmldecl=True)

    ancho, alto = Image.open(ruta_png).size
    assert ancho >= MINIMO_PX and alto >= MINIMO_PX, f"PNG de {ancho}x{alto}, menor que {MINIMO_PX}"

    # Verificación 1: el PNG tal cual.
    leido = decodificar(cv2.imread(str(ruta_png)))
    assert leido == url, f"El PNG decodifica {leido!r}, no {url!r}"

    # Verificación 2: el SVG, rasterizado desde su propia matriz de módulos.
    matriz = np.array([list(f) for f in qr.matrix_iter(scale=1, border=BORDE)], dtype=np.uint8)
    gris = np.where(matriz == 1, 0, 255).astype(np.uint8)
    gris = cv2.resize(gris, None, fx=12, fy=12, interpolation=cv2.INTER_NEAREST)
    leido_svg = decodificar(cv2.cvtColor(gris, cv2.COLOR_GRAY2BGR))
    assert leido_svg == url, f"La matriz del SVG decodifica {leido_svg!r}, no {url!r}"

    print(f"QR versión {qr.version}, {modulos} módulos con borde, {ancho}x{alto} px.")
    print(f"Decodificado: {leido}")
    print(f"Escrito {ruta_png} y {ruta_svg}")


if __name__ == "__main__":
    main()
