# Publicar y previsualizar

La página es una aplicación Angular. `main` todavía tiene la versión estática; esta rama es `angular`.

## Publicar (lo hace Juanes, después de revisar la rama)

1. Revisar la rama `angular` (ver «Previsualizar» abajo).
2. En GitHub, Settings > Pages > Build and deployment > Source: elegir **GitHub Actions**.
3. Hacer el merge de `angular` a `main`. El workflow `.github/workflows/deploy.yml` se ejecuta con el push, construye en producción y publica.
4. Ver la ejecución en la pestaña Actions. Al terminar, la página queda en `https://<dueño>.github.io/<repositorio>/`. Con el remoto actual sería `https://sergix4.github.io/QRWEBYURI/`; confirmarlo en Settings > Pages antes de generar el QR.
5. No renombrar ni mover el repositorio después de imprimir: la URL del QR sale de su dueño y su nombre.

Mientras `angular` no esté en `main`, el workflow no se ejecuta y no se publica nada. El workflow pasa `--base-href "/<repositorio>/"` al build, así que no hay que tocar nada para otro nombre de repositorio.

## Previsualizar la rama en local

Requiere Node 22 o superior.

```bash
git checkout angular
npm ci
npm start
```

Abre `http://localhost:4200/`. Para ver cómo quedará lo publicado:

```bash
npm run build
node qa/servir.mjs dist/qrwebyuri/browser 4300
```

y abrir `http://localhost:4300/`. Para ver qué falta (pendientes resaltados en amarillo):

```bash
npm run start:borrador
```

o `npm run build:borrador`. También `BORRADOR=1 npm run build`. Cada build escribe `PENDIENTES.md` con lo que queda fuera de la versión pública. Vuelve a ejecutar `npm run build` antes de publicar, para que `dist` y `src/app/datos` sean de la versión pública.

## Comparar con la versión estática actual

Sin salir de la rama, abrir `main` en otra carpeta:

```bash
git worktree add ../QRWEBYURI-main main
node qa/servir.mjs ../QRWEBYURI-main 4400
```

La versión estática queda en `http://localhost:4400/` y la de Angular en `http://localhost:4300/`. Al terminar: `git worktree remove ../QRWEBYURI-main`.

`qa/INFORME_QA.md` trae la comparación sección por sección.

## Cambiar contenido

Editar `datos/contenido.json` (y poner las fotos en `public/fotos/`). Las notas internas sobre permisos y rostros no van en el repositorio: se guardan solo en `datos/interno.json`, que git ignora, y se muestran únicamente en el borrador local. Si el JSON no cumple las interfaces de `src/app/modelo.ts`, el build falla.
