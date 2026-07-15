# 02 · Landing estática (`packages/landing`)

Sitio de marketing servido en `vetisuite.com/*`. Estático puro con Vite.
No comparte código con la web; es un proyecto Vite independiente.

## Pasos

### 1. Crear el paquete

```sh
cd packages/landing
bun init -y
bun add -D vite
```

### 2. `packages/landing/package.json`

```json
{
  "name": "@vetisuite/landing",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^8.1.1"
  }
}
```

### 3. `packages/landing/index.html`

Punto de entrada. Vite lo toma como raíz por defecto.

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Veti Suite</title>
  </head>
  <body>
    <main id="app"><!-- contenido landing --></main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Si la landing es HTML/CSS plano sin JS, puedes borrar el `<script>` y el `src/`.
Ponytail: si no hay interactividad, ni siquiera necesitas Vite — un `index.html`
+ carpeta `public/` desplegados como estáticos bastan. Añade Vite solo cuando
quieras bundling/CSS pipeline.

### 4. `packages/landing/vite.config.ts`

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: { outDir: 'dist' },
})
```

### 5. `packages/landing/vercel.json`

La landing es multipágina o single-page; para marketing normalmente son rutas
reales (`/`, `/precios`, `/contacto`). No pongas fallback SPA a menos que uses
routing en cliente.

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "trailingSlash": false
}
```

- `cleanUrls`: sirve `/precios.html` como `/precios`.
- Sin `rewrites`: cada URL mapea a un archivo real → 404 correctos.

### 6. Verificación local

```sh
bun run build       # genera packages/landing/dist
bun run preview     # sirve el build
```

Abrir el preview y comprobar que las rutas cargan.

## Enlace a la web

El CTA de la landing ("Entrar", "Iniciar sesión") apunta a
`https://web.vetisuite.com`. Es un enlace absoluto entre dominios, no una ruta
interna:

```html
<a href="https://web.vetisuite.com">Entrar a la app</a>
```
