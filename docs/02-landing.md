# 02 · Landing (`landing/`) — Astro

Sitio de marketing servido en `vetisuite.com/*`. Proyecto **Astro** independiente:
estático por defecto, cero JS en cliente salvo que se pida. Hoy es un hello world.

## Estructura

```
landing/
  package.json          → name "landing", scripts astro dev/build/preview
  astro.config.mjs      → site: https://vetisuite.com
  tsconfig.json         → extends astro/tsconfigs/strict
  src/pages/
    index.astro         → hello world (cada .astro en pages/ = una ruta)
```

Astro enruta por archivos: `src/pages/precios.astro` → `/precios`. Para
marketing son rutas reales — no hay fallback SPA.

## Comandos

```sh
bun run --filter landing dev       # http://localhost:4321
bun run --filter landing build     # genera landing/dist/
bun run --filter landing preview   # sirve el build
```

## `landing/vercel.json` (cuando se despliegue)

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "trailingSlash": false
}
```

Vercel también detecta Astro como framework preset; el `vercel.json` es respaldo
para deploy por CLI sin dashboard.

## Enlace a la app

El CTA de la landing ("Entrar") apunta a `https://app.vetisuite.com`. Enlace
absoluto entre dominios, no una ruta interna:

```html
<a href="https://app.vetisuite.com">Entrar a la app</a>
```

## Qué se deja fuera (a propósito)

Contenido real, estilos, integraciones Astro (sitemap, og-images): cuando haya
contenido que publicar. El lint raíz no cubre `.astro` — añadir
`eslint-plugin-astro` cuando la landing tenga código real.
