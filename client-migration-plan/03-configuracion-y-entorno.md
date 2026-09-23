# 03 · Configuración y entorno

## Propósito

Deja el esqueleto de `app/` listo para compilar: dependencias, scripts, Vite, alias, HTML de
entrada, hoja de estilos global, módulo de entorno, variables locales, guardarraíl de ESLint y la
forma en que el workspace instala los paquetes. Se usa en la **Fase 1 · Configuración y entorno**,
antes de escribir una sola línea de `core/` o `hooks/`. Al cerrar la fase, `bun run dev:app` levanta
una página vacía en `http://localhost:3000` y `bun run lint` pasa.

Los archivos de esta fase son los de la raíz de `app/` y dos de `src/` (`globals.css` y
`lib/environment.js`); su lugar en el árbol está en
[02-estructura-de-carpetas.md](02-estructura-de-carpetas.md#árbol-de-app).

## package.json

Path: `app/package.json`

```json
{
  "name": "@proyecto/app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --force",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "5.4.0",
    "@radix-ui/react-alert-dialog": "1.1.19",
    "@radix-ui/react-avatar": "1.2.2",
    "@radix-ui/react-label": "2.1.11",
    "@radix-ui/react-popover": "1.1.19",
    "@radix-ui/react-select": "2.3.3",
    "@radix-ui/react-separator": "1.1.11",
    "@radix-ui/react-slot": "1.3.0",
    "@radix-ui/react-tooltip": "1.2.12",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.562.0",
    "next-themes": "^0.4.6",
    "react": "19.2.7",
    "react-day-picker": "9.14.0",
    "react-dom": "19.2.7",
    "react-hook-form": "7.81.0",
    "react-router": "8.3.0",
    "react-use": "17.6.1",
    "sonner": "2.0.7",
    "tailwind-merge": "3.6.0",
    "zod": "4.4.3",
    "zustand": "5.0.14"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.3.2",
    "@vitejs/plugin-react": "6.0.3",
    "tailwindcss": "4.3.2",
    "tw-animate-css": "1.4.0",
    "vite": "8.1.5"
  }
}
```

**Nombre y tipo.** `@proyecto/app` sigue el esquema `@proyecto/<paquete>` del workspace: es el
nombre con el que el guardarraíl de [ESLint](#eslint) reconoce (y prohíbe) los imports entre
paquetes. `"type": "module"` hace que `vite.config.js` se cargue como ESM. `private: true` impide
publicarlo por accidente.

**Versiones.** Se conservan tal como están en el origen: la mayoría exactas y cuatro con `^`
(`class-variance-authority`, `clsx`, `lucide-react`, `next-themes`). No las "normalices" en esta
fase; si el destino decide fijarlas todas, es una decisión aparte.

**Qué hace cada dependencia y qué pieza base la usa.** Solo entran las que importa algún archivo
base del árbol; lo que usaban solo pantallas o piezas de producto quedó fuera (tabla de
desviaciones del plan: `underscore`, `cmdk`, `@radix-ui/react-dialog` y las de videollamada).

| Paquete | Qué hace | Quién lo usa |
|---|---|---|
| `react`, `react-dom` | Runtime de UI y montaje en el DOM. | `main.jsx` monta `App.jsx`; todo el árbol. |
| `react-router` | Rutas declarativas, `useSearchParams`, `useNavigate`, `Navigate`. | `main.jsx`, `Authorization`, archivos de `routes/`, `modalWrapper.jsx`, `CustomPage`, layouts y sidebars, `use-form.js`, `use-query-params.js`. |
| `zustand` | Estado global mínimo con `persist`. | `stores/session.store.js` y `stores/confirmation-dialog.store.js`. |
| `react-hook-form` | Estado de formularios y `useController`. | `hooks/use-form.js`, `components/form/*`, `PasswordInput.jsx`. |
| `@hookform/resolvers` | Adaptador `zodResolver` entre Zod y react-hook-form. | `hooks/use-form.js`. |
| `zod` | Esquemas de validación. | Cada `*.schema.js` (`auth.schema.js`, `profile.schema.js`, `member.schema.js`) y las pantallas de edición de permisos. |
| `sonner` | Toasts. | `App.jsx` monta el `Toaster`; `use-form.js`, `use-mutation.js` y `use-notifications.js` disparan `toast`. |
| `react-use` | Hooks utilitarios. | `use-query-params.js` (`useDebounce`) y `use-notifications.js` (`useInterval`). |
| `next-themes` | Tema claro/oscuro con clase `.dark` en `<html>`. | `components/theme-provider.jsx` y el `Header.jsx` de cada rol. |
| `lucide-react` | Iconos SVG como componentes. | `App.jsx` (iconos del `Toaster`), `Form.jsx`, `FormUploadAvatar`, `FormUploadFiles`, `ui/calendar.jsx`, `ui/select.jsx`, sidebars. |
| `react-day-picker` | Calendario. | `components/ui/calendar.jsx`, que usa `FormInputDatePicker`. |
| `@radix-ui/react-*` | Primitivas accesibles sin estilo. | Una por componente de `components/ui/`: `alert-dialog`, `avatar`, `label`, `popover`, `select`, `separator`, `tooltip`; `react-slot` lo usan `button.jsx` y `badge.jsx` para `asChild`. |
| `class-variance-authority` | Variantes tipadas de clases (`cva`). | `ui/button.jsx`, `ui/badge.jsx`, `ui/field.jsx`. |
| `clsx` + `tailwind-merge` | Composición condicional de clases y resolución de conflictos de Tailwind. | `lib/utils.js` (`cn`); `tailwind-merge` también directo en `Form.jsx`, `CustomPage`, `CustomTable` y un sidebar. |
| `vite` + `@vitejs/plugin-react` | Servidor de desarrollo, build y transformación de JSX con Fast Refresh. | `vite.config.js`. |
| `tailwindcss` + `@tailwindcss/vite` | Tailwind v4 compilado por el plugin de Vite. | `vite.config.js` y `@import "tailwindcss"` en `globals.css`. |
| `tw-animate-css` | Utilidades `animate-in`, `fade-in-0`, `zoom-in-95`… | `@import "tw-animate-css"` en `globals.css`; las usan los componentes de `ui/`. |

## Scripts

Scripts de `app/package.json` (ya mostrados arriba):

- `dev` → `vite --force`. `--force` ignora la caché de dependencias pre-empaquetadas de Vite y la
  regenera en cada arranque. El origen no documenta el motivo (no verificado); la lectura razonable
  es que con el linker isolated (ver [Workspace y linker](#workspace-y-linker)) los symlinks cambian
  después de cada `bun install` y una caché vieja apunta a rutas que ya no existen.
- `build` → `vite build`, genera `app/dist/`.
- `preview` → sirve `app/dist/` para revisar el build localmente.

Extracto de la raíz del monorepo (`package.json`): solo los tres scripts de referencia y la entrada
de workspace de la app. El resto de scripts y workspaces del destino quedan como estén.

```json
{
  "workspaces": [
    "app"
  ],
  "scripts": {
    "dev:app": "bun --cwd app dev",
    "build:app": "bun --cwd app build",
    "lint": "eslint"
  }
}
```

`bun --cwd app <script>` cambia el directorio de trabajo a `app/` y corre ahí el script de
`app/package.json`: equivale a `cd app && bun run <script>` sin salir de la raíz. Importa porque
Vite resuelve `vite.config.js`, `index.html` y `.env.local` relativos al directorio donde arranca.
Desde la raíz se trabaja siempre con estos tres:

| Script | Qué corre |
|---|---|
| `bun run dev:app` | `vite --force` en `app/`, puerto 3000. |
| `bun run build:app` | `vite build` en `app/`. Es el que corre Amplify ([12-deploy.md](12-deploy.md#amplifyyml)). |
| `bun run lint` | `eslint` sobre todo el repo con el `eslint.config.mjs` de la raíz. |

## vite.config.js

Path: `app/vite.config.js`

```js
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ['PROYECTO_'],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    strictPort: true
  }
});
```

El cliente es una SPA estática: no hay render en servidor ni acceso a la base. Todo corre en el
navegador y habla con el API; la sesión viaja en una cookie httpOnly que emite el API (ver
[01-arquitectura.md](01-arquitectura.md#contrato-del-api)), por eso `core/service.js` manda
`credentials: 'include'` y el cliente nunca maneja un token.

- **`plugins: [react(), tailwindcss()]`.** Tailwind v4 entra por su plugin de Vite, no por PostCSS:
  no hay `postcss.config.js` ni `tailwind.config.js`. El tema se declara en CSS
  ([globals.css](#globalscss)).
- **`envPrefix: ['PROYECTO_']`.** Reemplaza el `VITE_` por defecto. Vite solo expone en
  `import.meta.env` las variables con ese prefijo y las inlinea en el bundle. El prefijo es el mismo
  en todas las apps del monorepo, así el dominio del API se llama `PROYECTO_API_DOMAIN` en el cliente,
  en el server y en la landing, y nadie traduce nombres entre proyectos. Cualquier otra variable del
  entorno (secretos incluidos) queda fuera del bundle.
- **`resolve.dedupe: ['react', 'react-dom']`.** Fuerza una sola instancia de React. Con dos copias
  en el grafo, el dispatcher de hooks de una queda en `null` y la app muere con
  `Cannot read properties of null (reading 'useRef')`. El síntoma aparece **solo en el build**, no en
  `dev`, por eso la línea se deja aunque todo "funcione" en local.
- **Alias `@` → `src/`.** Todos los imports internos son `@/lib/utils`, `@/hooks/use-form`, nunca
  rutas relativas largas. El mismo alias se declara para el editor en [jsconfig.json](#jsconfigjson).
- **`server.port: 3000` con `strictPort: true`.** Es el origen que el server tiene configurado como
  dominio de la app en local: su CORS permite ese origen y solo a él le acepta credenciales. Si Vite
  saltara solo a 3001 porque el 3000 está ocupado, la app arrancaría pero todas las peticiones con
  cookie fallarían por CORS. `strictPort` prefiere un error visible al arrancar.

## jsconfig.json

Path: `app/jsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Solo existe para el editor: autocompletado e "ir a definición" sobre imports `@/…`. Vite no lo lee;
el alias real es el de [vite.config.js](#viteconfigjs). Si cambias uno, cambia el otro.

## index.html

Path: `app/index.html`

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=<Fuente>:wght@500;600;700&display=swap" rel="stylesheet" />
    <style>
      :root { --font-principal: '<Fuente>'; }
    </style>
    <title>Proyecto</title>
    <meta name="description" content="Descripción del proyecto" />
  </head>
  <body class="antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- **`viewport-fit=cover`** hace que la página ocupe también el área bajo el notch y las barras del
  sistema en móviles, y habilita `env(safe-area-inset-*)` para que el header y las barras fijas se
  separen de esas zonas.
- **Fuente.** Se carga de Google Fonts con `preconnect` a los dos hosts y los pesos 500, 600 y 700,
  que son los que usa [globals.css](#globalscss). El `<style>` inline define `--font-principal`, la
  única variable que consume la hoja global. Cambiar de fuente es tocar solo este archivo.
- **Identidad.** `Proyecto`, `Descripción del proyecto`, `<Fuente>`, `favicon.svg` y `lang="es"`
  son del destino y se fijan en la Fase 0.
- **Sin librerías de iconos por CDN.** El origen cargaba Font Awesome aquí solo para un modal de
  producto; el estándar de iconos es `lucide-react`.
- `<script type="module" src="/src/main.jsx">` es la entrada de Vite; `#root` es donde monta
  `main.jsx` ([07-rutas-y-sesion.md](07-rutas-y-sesion.md#mainjsx)).

## globals.css

Path: `app/src/globals.css`

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --color-brand-blue: var(--brand-blue);
  --color-brand-darkBlue: var(--brand-darkBlue);
  --color-brand-red: var(--brand-red);
  --color-brand-green: var(--brand-green);
  --color-brand-orange: var(--brand-orange);
  --color-brand-yellow: var(--brand-yellow);
  --color-brand-primary: var(--brand-primary);
  --color-brand-secondary: var(--brand-secondary);
  --color-brand-tertiary: var(--brand-tertiary);
  --color-brand-text-primary: var(--brand-text-primary);
  --color-brand-text-secondary: var(--brand-text-secondary);
  --color-brand-accent-green: var(--brand-accent-green);
  --color-brand-accent-green-dark: var(--brand-accent-green-dark);
  --color-brand-accent-blue: var(--brand-accent-blue);
  --color-brand-accent-purple: var(--brand-accent-purple);
  --color-brand-accent-orange: var(--brand-accent-orange);
  --color-brand-border-color: var(--brand-border-color);
  --color-brand-gradient-primary: var(--brand-gradient-primary);
  --color-brand-gradient-secondary: var(--brand-gradient-secondary);

  --color-accent-green: var(--brand-accent-green);
  --color-accent-blue: var(--brand-accent-blue);
  --color-accent-purple: var(--brand-accent-purple);
  --color-accent-orange: var(--brand-accent-orange);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);

  --brand-blue: #2f6df6;
  --brand-darkBlue: #1e3563;
  --brand-red: #e6533f;
  --brand-green: #2f9e8f;
  --brand-orange: #f26d3d;
  --brand-yellow: #f2c94c;
  --brand-primary: #f9f6f1;
  --brand-secondary: #ffffff;
  --brand-tertiary: #f1ece3;
  --brand-text-primary: #1b2427;
  --brand-text-secondary: #4a5a60;
  --brand-accent-green: #1f7a6b;
  --brand-accent-green-dark: #16594f;
  --brand-accent-blue: #2f6df6;
  --brand-accent-purple: #7a5cff;
  --brand-accent-orange: #f26d3d;
  --brand-border-color: #d7d0c6;
  --brand-gradient-primary: linear-gradient(135deg, #1f7a6b, #2f6df6);
  --brand-gradient-secondary: linear-gradient(135deg, #7a5cff, #f26d3d);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);

  --brand-blue: #6b8bff;
  --brand-darkBlue: #1a2a4a;
  --brand-red: #ff6a5a;
  --brand-green: #52c6b0;
  --brand-orange: #ff8a5b;
  --brand-yellow: #ffd86b;
  --brand-primary: #0c1114;
  --brand-secondary: #141b1f;
  --brand-tertiary: #1a2328;
  --brand-text-primary: #f7f7f7;
  --brand-text-secondary: #c7d2d9;
  --brand-accent-green: #52c6b0;
  --brand-accent-green-dark: #2a8f80;
  --brand-accent-blue: #6b8bff;
  --brand-accent-purple: #a78bfa;
  --brand-accent-orange: #ff8a5b;
  --brand-border-color: #26323a;
  --brand-gradient-primary: linear-gradient(135deg, #52c6b0, #6b8bff);
  --brand-gradient-secondary: linear-gradient(135deg, #a78bfa, #ff8a5b);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

body {
  color: var(--color-brand-text-secondary);
  background: var(--color-brand-primary);
  font-family: var(--font-principal), sans-serif;
  font-weight: 500;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-principal), sans-serif;
  letter-spacing: 0;
  font-weight: 700;
}

@layer utilities {
  .font-principal-medium {
    font-family: var(--font-principal), sans-serif;
    font-weight: 500;
  }

  .font-principal-bold {
    font-family: var(--font-principal), sans-serif;
    font-weight: 700;
  }

  .font-bold,
  .font-semibold,
  .font-extrabold,
  .font-black {
    font-family: var(--font-principal), sans-serif;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes wiggle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

@keyframes pulse-gentle {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

.animate-bounce-gentle {
  animation: bounce-gentle 2s ease-in-out infinite;
}

.animate-wiggle {
  animation: wiggle 1s ease-in-out infinite;
}

.animate-pulse-gentle {
  animation: pulse-gentle 2s ease-in-out infinite;
}
```

Es el archivo completo del destino. Frente al origen se hicieron tres cambios, todos de recorte o de
identidad:

1. La variable de fuente, que en el origen llevaba el nombre de la fuente, pasa a `--font-principal`,
   y sus dos utilidades de peso pasan a `.font-principal-medium` y `.font-principal-bold`. El nombre
   de la fuente es identidad y vive solo en `index.html`.
2. Se quitaron las clases que el origen arrastraba de la landing de marketing (cabecera y rejilla de
   la landing, píldoras de menú, panel y video de portada, tarjetas giratorias, botón de campaña,
   anillos decorativos): ninguna pantalla del cliente las usa.
3. Se quitó el token de sombra que solo usaba ese botón de campaña, con su mapeo en `@theme`.

Cómo se lee el archivo (patrón Tailwind v4 + shadcn):

- **`@import "tailwindcss"`** sustituye las tres directivas `@tailwind` de v3. **`tw-animate-css`**
  aporta las utilidades de entrada y salida que usan los componentes de `ui/` (`animate-in`,
  `fade-in-0`, `zoom-in-95`, `slide-in-from-top-2`).
- **`@custom-variant dark (&:is(.dark *))`** hace que `dark:` dependa de la clase `.dark` que
  `next-themes` pone en `<html>`, no de `prefers-color-scheme`. El tema lo decide el usuario
  ([09-componentes.md](09-componentes.md#tema)).
- **`:root` y `.dark` fuera de cualquier `@layer`** definen los valores; **`@theme inline`** los
  convierte en utilidades (`bg-background`, `text-muted-foreground`, `rounded-lg`,
  `bg-brand-primary`). `inline` hace que la utilidad lea la variable en tiempo de ejecución, por eso
  cambiar `.dark` cambia todas las utilidades sin variantes `dark:` en los componentes.
- **Paleta shadcn en `oklch`** (`--background` … `--sidebar-ring`): es la paleta neutra por defecto;
  los componentes de `ui/` solo usan estos tokens.
- **Tokens `--brand-*`**: la paleta propia, con su versión clara y oscura. Los consume el `body` y
  pantallas base como [NotFoundScreen](07-rutas-y-sesion.md#notfoundscreen) (`text-accent-green`).
  Los valores son identidad: el destino pone los suyos, pero conserva los nombres para que las
  piezas base sigan pintando.
- **`@layer base`** aplica borde y anillo por defecto y los colores shadcn al `body`. El bloque
  `body` que sigue, fuera de capa, gana sobre él y fija el fondo y el texto con la paleta propia y
  la fuente principal con peso 500; los títulos van en 700.
- **`@layer utilities`** fuerza la fuente principal en las utilidades de peso de Tailwind, para que
  `font-bold` no caiga en la fuente del sistema.
- **Animaciones suaves** (`float`, `fadeIn`, `bounce-gentle`, `wiggle`, `pulse-gentle`) y sus clases
  `animate-*`: las usa la pantalla de 404. Viven aquí y no en `@theme` porque son clases sueltas,
  no una escala.

## lib/environment.js

Path: `app/src/lib/environment.js`

```js
export const apiDomain = import.meta.env.PROYECTO_API_DOMAIN;
export const landingDomain = import.meta.env.PROYECTO_LANDING_DOMAIN;
```

Es el único lugar del cliente que lee `import.meta.env`. En el origen cada archivo leía la variable
por su cuenta y la URL del API estaba duplicada; en el plan la app declara sus variables en un solo
módulo y el resto importa de ahí:

| Export | Quién lo usa |
|---|---|
| `apiDomain` | `core/service.js` (base de `${apiDomain}/api/${path}`) y `lib/utils.js` (`getPictureSrc`). Ver [04-core.md](04-core.md#coreservicejs). |
| `landingDomain` | `SignInForm.jsx` y `sign-up/page.jsx`, que arman `${landingDomain}/?modal=signup`. |

Vite reemplaza las dos expresiones por el literal en tiempo de build, así que no hay costo en
ejecución. Si la variable no está definida al compilar, el valor es `undefined` y el fallo aparece
como una URL `undefined/api/...`: el primer paso al depurar una app que no llega al API es mirar esta
variable en el entorno del build.

No existe un `appDomain`: nada del cliente construye URLs absolutas hacia sí mismo (los retornos
desde servicios externos los arma el server). Si una pantalla del destino lo necesita, se agrega aquí
un tercer export y su variable en [.env.local](#envlocal) y en Amplify.

## .env.local

Path: `app/.env.local` (versionado)

```dotenv
PROYECTO_API_DOMAIN="http://localhost:4000"
PROYECTO_LANDING_DOMAIN="http://localhost:4321"
```

- **Todo lo que está aquí termina en el bundle y es público.** Vite inlinea en el JavaScript servido
  al navegador cada variable con prefijo `PROYECTO_`. En este archivo no va ningún secreto: claves
  de base de datos, de firma, de correo o de proveedores viven solo en el server. Por lo mismo el
  archivo se versiona: no tiene nada que ocultar y así el repo arranca sin pasos manuales.
- **Los nombres son los mismos en todas las apps del monorepo**: el server y la landing llaman igual
  a estos dos dominios. Cada app los declara en su propio archivo; ninguna lee el de otra.
- **Los valores llevan esquema y puerto, sin barra final.** `service.js` concatena `/api/...`
  directamente.
- `4000` es el puerto local del API y `4321` el de la landing. Si el destino usa otros, cambia solo
  este archivo.
- En la nube este archivo no manda: los valores reales se cargan en la consola de Amplify y, como
  Vite da prioridad a las variables del proceso sobre los archivos `.env*`, ganan sobre los de aquí
  ([12-deploy.md](12-deploy.md#variables-en-amplify)).

## ESLint

La configuración vive en `eslint.config.mjs` de la raíz (flat config) y cubre todos los workspaces.
Extracto: solo lo que aplica a `app/`. Las reglas genéricas de higiene JS (`jsHygieneRules`, un objeto
grande de reglas del core de ESLint compartido con el server) se definen en el mismo archivo y no se
repiten aquí.

```js
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const appForbiddenImports = [
  'error',
  {
    patterns: [
      {group: ['@proyecto/*'], message: 'app/ no comparte código: copia lo que necesites a app/src/.'},
      {group: ['next', 'next/*'], message: 'app/ es Vite + react-router, no Next.'},
      {group: ['node:*', 'server-only'], message: 'app/ corre en el navegador: no hay APIs de Node.'},
      {group: ['**/server/**', '**/packages/**'], message: 'app/ no importa de otros paquetes del monorepo.'}
    ]
  }
];

const [nextBase] = nextCoreWebVitals;
const appReactRules = Object.fromEntries(
  Object.entries(nextBase.rules).filter(([rule]) => !rule.startsWith('@next/'))
);
const {'@next/next': _appNextPlugin, ...appReactPlugins} = nextBase.plugins;
const appLanguageOptions = {
  ecmaVersion: 'latest',
  sourceType: 'module',
  globals: nextBase.languageOptions.globals,
  parserOptions: {ecmaFeatures: {jsx: true}}
};

const eslintConfig = [
  {
    ignores: [
      '**/node_modules/**',
      'app/dist/**'
    ]
  },
  {
    files: ['app/src/**/*.{js,jsx}'],
    ignores: ['app/src/components/ui/**'],
    languageOptions: appLanguageOptions,
    settings: nextBase.settings,
    plugins: appReactPlugins,
    rules: {
      ...jsHygieneRules,
      ...appReactRules,
      'no-restricted-imports': appForbiddenImports,
      'no-console': 2,
      'no-nested-ternary': 2,
      'max-depth': [2, 2],
      'function-paren-newline': 0,
      complexity: ['error', 22],
      'react-hooks/set-state-in-effect': 0,
      'react-hooks/refs': 0,
      'react-hooks/static-components': 0,
      'react-hooks/error-boundaries': 0,
      'react/display-name': 0,
      'react/prop-types': 0
    }
  },
  {
    files: ['app/src/hooks/use-form.js', 'app/src/hooks/use-mutation.js'],
    rules: {
      'max-statements': ['error', {max: 30}]
    }
  },
  {
    files: ['app/src/modules/**/resolvers.js'],
    rules: {
      'import/no-anonymous-default-export': 0
    }
  }
];

export default eslintConfig;
```

Dependencias de la raíz que necesita este bloque (extracto de `devDependencies` del `package.json`
raíz; el destino agrega las de sus otros workspaces):

```json
{
  "devDependencies": {
    "eslint": "9.39.4",
    "eslint-config-next": "16.2.10"
  }
}
```

**Guardarraíl de imports (`appForbiddenImports`).** El cliente es una SPA pública y no debe poder
importar código de servidor. Los cuatro grupos cierran las cuatro puertas:

| Patrón | Qué evita |
|---|---|
| `@proyecto/*` | Importar otro paquete del workspace. Un paquete como `@proyecto/db` sigue siendo resoluble por el symlink del workspace aunque no esté en `app/package.json`; sin esta regla, un import compilaría en silencio y metería el ORM, el driver de la base y secretos en un bundle público. |
| `next`, `next/*` | Código de Next copiado de otro proyecto. Aquí el router es `react-router`. |
| `node:*`, `server-only` | APIs de Node que no existen en el navegador. Única excepción: `vite.config.js`, que corre en Node y queda fuera del glob `app/src/**`. |
| `**/server/**`, `**/packages/**` | Imports relativos que saltan a otro proyecto del monorepo esquivando el nombre de paquete. |

Si dos proyectos necesitan lo mismo, el cliente tiene su propia copia en `app/src/`.

**Plugins de React sin Next.** `eslint-config-next` se instala solo como fuente de los plugins
`react`, `react-hooks`, `jsx-a11y` e `import` ya configurados. Se toma su primer bloque (el único con
`files` amplio), se descarta todo lo que empieza con `@next/` y se descarta también su parser: el de
Next usa un preset de Babel que vive en el paquete `next`, que no está instalado. El JSX moderno lo
cubre espree, el parser por defecto de ESLint, con `ecmaFeatures.jsx`. Los globals de navegador y los
`settings` sí se reutilizan.

**Reglas del bloque de `app/` y por qué:**

- `components/ui/**` se ignora: es código generado por shadcn y se actualiza regenerándolo, no a
  mano.
- `no-console: 2`: todo registro pasa por `lib/logger.js` ([04-core.md](04-core.md#libloggerjs)).
- `no-nested-ternary: 2` y `max-depth: [2, 2]`: el JSX se lee de arriba abajo; más de dos niveles se
  extraen a un componente o a un retorno temprano.
- `function-paren-newline: 0`: la convención es colgar el JSX de un único argumento
  (`render(<StrictMode>…</StrictMode>)`); la regla pide lo contrario y solo molesta en esos casos.
- `complexity: 22`: el límite por defecto (20) está pensado para lógica de negocio. En JSX cada `?.`
  y cada `||` de valor alternativo cuenta como rama, y una tarjeta de datos con varios campos
  opcionales llega a 21-22 sin lógica real.
- `react-hooks/set-state-in-effect`, `react-hooks/refs`, `react-hooks/static-components`,
  `react-hooks/error-boundaries` apagadas: son patrones deliberados del cliente (por ejemplo, las
  referencias a "lo de este render" dentro de `useResolver`, o un `setState` dentro de un efecto).
- `react/display-name` y `react/prop-types` apagadas: el proyecto es JavaScript sin PropTypes.
- `use-form.js` y `use-mutation.js` suben `max-statements` a 30: cada uno es, por diseño, un único
  `async/await` con `try/catch/finally` que se lee de arriba abajo, sin helper compartido entre
  ellos. Partirlo para bajar de 25 sentencias sería justo la abstracción que ese diseño evita.
- `resolvers.js` permite `export default {…}` anónimo: el objeto literal exportado es la convención
  de las pantallas ([08-modulos.md](08-modulos.md#pagejsx-y-resolversjs)); nombrarlo no aporta nada.

## Workspace y linker

El repo es un monorepo de Bun workspaces: el `package.json` raíz lista los directorios que son
paquetes (`"workspaces": ["app", …]`, ver [Scripts](#scripts)) y un único `bun install` en la raíz
instala todos. Consecuencias para el cliente:

- **Se instala siempre desde la raíz.** No existe un `bun install` "de la app": las dependencias de
  `app/package.json` se resuelven junto con las del resto del monorepo.
- **Paquetes del workspace se enlazan por symlink.** Por eso existe el guardarraíl de ESLint: un
  import a otro paquete del workspace resolvería aunque la app no lo declare.
- **Linker isolated.** Bun instala cada paquete una sola vez en `node_modules/.bun/<paquete>@<versión>/`
  de la raíz, y cada workspace tiene su propio `node_modules/` con symlinks solo a lo que declara
  (por ejemplo, `app/node_modules/clsx` → `../../node_modules/.bun/clsx@2.1.1/node_modules/clsx`).
  Efecto práctico: la app no puede importar una dependencia transitiva o de otro workspace que no
  esté en su `package.json` (no hay dependencias fantasma), y por eso **toda** dependencia que importe
  `app/src/` tiene que estar declarada en `app/package.json`, aunque otro workspace ya la tenga.
- **Dónde se fija el linker.** No hay `bunfig.toml` en el repo. El `bun.lock` que genera la instalación
  local lleva `"configVersion": 1` en su cabecera, y la estructura instalada (`node_modules/.bun/` más
  symlinks por workspace) es la del linker isolated. Que sea el valor por defecto de Bun para un
  workspace con `configVersion: 1` y no otra configuración es **no verificado**. Si el destino quiere
  dejarlo explícito, `bunfig.toml` con `[install] linker = "isolated"` en la raíz lo fija sin
  depender del valor por defecto.
- **`bun.lock` no se versiona en el origen** (está en `.gitignore`), así que cada instalación limpia
  (Amplify, CI) resuelve versiones de nuevo; las versiones exactas de `app/package.json` acotan esa
  deriva.
- **Scripts de instalación.** Bun no ejecuta los scripts de instalación de las dependencias salvo
  las listadas en `trustedDependencies` del `package.json` raíz. Extracto:

```json
{
  "trustedDependencies": [
    "@tailwindcss/oxide",
    "unrs-resolver"
  ]
}
```

`@tailwindcss/oxide` es el motor nativo de Tailwind v4 que usa `@tailwindcss/vite`; `unrs-resolver`
es el resolvedor nativo que llega por `eslint-config-next` → `eslint-import-resolver-typescript`.
Ambos traen binarios nativos por plataforma y un script de instalación. Qué falla exactamente si se
quitan de la lista es **no verificado**; se conservan tal cual.

## Reglas de uso

- **Una variable nueva del cliente** se agrega en tres lugares y en este orden: export en
  `lib/environment.js`, valor local en `app/.env.local`, valor por ambiente en Amplify. Nunca
  `import.meta.env` fuera de `lib/environment.js`: el valor quedaría duplicado y un rename rompería en
  silencio.
- **Nunca un secreto con prefijo `PROYECTO_`** en el cliente. Si una pantalla "necesita" una clave, lo
  que necesita es un endpoint del server.
- **No uses `NODE_ENV` ni `import.meta.env.MODE` para ramificar por ambiente**: el build siempre
  corre en modo producción. Lo que cambia por ambiente son los dominios, y esos ya llegan por variable.
- **Una dependencia nueva** va en `app/package.json` aunque otro workspace ya la tenga (linker
  isolated). Antes de agregarla, busca si una de las de la tabla ya lo resuelve.
- **No agregues PostCSS ni `tailwind.config.js`**: Tailwind v4 se configura en `globals.css` y entra
  por el plugin de Vite. Un `tailwind.config.js` se ignora y confunde.
- **No quites `dedupe`** aunque `dev` funcione sin él: el fallo aparece solo en el build.
- **No cambies el puerto 3000** sin cambiar el dominio de la app que el server tiene declarado para
  CORS.
- **No desactives el guardarraíl de ESLint** con `eslint-disable` para importar de otro paquete:
  copia el código a `app/src/`.

## Checklist del ejecutor

- [ ] `app/package.json` con nombre `@proyecto/app`, scripts `dev`, `build`, `preview` y exactamente
      las dependencias de la tabla, con las versiones del origen.
- [ ] El `package.json` raíz lista `app` en `workspaces`, tiene `dev:app`, `build:app` y `lint`, y
      `@tailwindcss/oxide` y `unrs-resolver` en `trustedDependencies`.
- [ ] `bun install` en la raíz crea `app/node_modules/` con symlinks a `node_modules/.bun/`.
- [ ] `app/vite.config.js` con `envPrefix: ['PROYECTO_']`, `dedupe`, alias `@`, puerto 3000 con
      `strictPort`, y sin PostCSS.
- [ ] `app/jsconfig.json` con el alias `@/*` igual al de Vite.
- [ ] `app/index.html` con `Proyecto`, `Descripción del proyecto`, `<Fuente>` y `--font-principal`
      reemplazados por los valores del destino; sin librerías de iconos por CDN.
- [ ] `app/src/globals.css` sin ninguna referencia a la fuente del origen; tokens `--brand-*` con la
      paleta del destino.
- [ ] `app/src/lib/environment.js` con `apiDomain` y `landingDomain`; `grep -rn "import.meta.env"
      app/src` devuelve solo ese archivo.
- [ ] `app/.env.local` con `PROYECTO_API_DOMAIN` y `PROYECTO_LANDING_DOMAIN`, sin ningún secreto.
- [ ] `eslint.config.mjs` con el bloque de `app/` y `appForbiddenImports`; un import de prueba a
      `@proyecto/db` falla en `bun run lint`.
- [ ] `bun run dev:app` levanta en `http://localhost:3000` y `bun run build:app` genera `app/dist/`.
