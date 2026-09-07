# design-sync — notas del repo (Veti Suite)

## Qué se sincroniza (y qué NO)

El design system es **solo la base**: 13 componentes primitivos y de control —
`Btn`, `Badge`, `Card`, `Modal`, `Field`, `Input`, `Select`, `DateInput`, `Avatar`,
`Pager`, `Spinner`, `Toggle`, `ToastProvider`.

**Los componentes de módulo se excluyen a propósito** (decisión del usuario, 2026-09-05).
Se borraron del design system `ClientForm`, `PatientFormModal`, `ProductForm`,
`RestockModal`, `PortalForm`, `DeletePortalModal`, `PortalLogo`, `LabOrderCard`,
`NoActiveConsultation`, `WeekEditor`, `OverridesEditor`, `ClientSearch`, `PatientPicker`,
`PatientAlerts`, `Elapsed`, y también la capa estructural genérica `CustomPage`,
`CustomLayout`, `ResourceListItem`, `InfoGrid`, `ResourceNotFound`. **Siguen existiendo en
la app**; simplemente no son parte del design system. El agente de diseño compone pantallas
con la base siguiendo la directriz de `conventions.md` §2.

Si alguien pide "añadir X al design system", comprueba primero que X sea base. Un
componente que conoce el dominio (recibe un `Patient`, un `Portal`, una `Visit`) no lo es.

## Forma del repo

- `client/` es una **app Vite**, no una librería: no hay `dist/` de componentes ni
  `exports`. La superficie se declara a mano en **`client/ds-sync/entry.tsx`** (barrel) y se
  pasa con `--entry`. Al añadir un componente base hay que tocarlo **y** `componentSrcMap`
  en `config.json` (con `--entry` no hay `.d.ts` que descubrir: la lista sale entera del
  `componentSrcMap`).
- **No hay `cfg.provider`.** Ningún componente base lee contexto: no usan `Link` /
  `useNavigate` ni un provider de tema. `client/ds-sync/provider.tsx` (`DsProvider`) se
  eliminó al podar — existía solo para `CustomPage`/`CustomLayout`/`ResourceNotFound`/
  `NoActiveConsultation`, que ya no se sincronizan. Si vuelves a meter un componente que
  navegue, hay que recrearlo.
- `client/ds-sync/safelist.ts` no se importa en ninguna parte: existe para que Tailwind v4
  emita las utilidades que `conventions.md` documenta. Sin él la hoja compilada solo trae
  las clases que la app usa hoy y el agente de diseño escribiría clases que no resuelven.
  **Regla: solo se documenta vocabulario que exista en `_ds_bundle.css`.**

## Gotchas verificados

- **`tsconfig.app.json` no sirve como `cfg.tsconfig`.** El parser de `lib/bundle.mjs` quita
  comentarios con una regex que se come desde el `/*` de `"@/*"` hasta el siguiente `*/`,
  rompe el JSON y el plugin de paths queda en `null` → `Could not resolve "@/…"`. Por eso
  existe **`client/ds-sync/tsconfig.paths.json`**, sin comentarios. No apuntes
  `cfg.tsconfig` de vuelta al tsconfig de la app.
- **CSS**: `cfg.cssEntry` necesita una hoja ya compilada. `src/index.css` no vale
  (`@import "tailwindcss"`). El `buildCmd` corre `vite build` y copia el CSS con hash a
  `client/.ds-css/theme.css` (ruta estable, gitignorada). El `@import` remoto de Google
  Fonts sobrevive a la compilación → `[FONT_REMOTE]` es esperado, no un fallo.
- **Modales**: `.ds-single` lleva `transform: translateZ(0)`, así que es el bloque
  contenedor de cualquier `position: fixed`. Sin alto explícito el overlay colapsa y el
  modal sale recortado por arriba. La preview de `Modal` envuelve el componente en un `div`
  con `minHeight: 560`.
- **`inputStyle` pisa el `:disabled` nativo.** Fija `background` y `color`, así que un
  control deshabilitado se veía idéntico a uno activo (lo detectó el grado de
  `Input/Variantes`). `Input` y `Select` aplican ahora `opacity: 0.5` +
  `cursor: not-allowed` cuando `disabled`, igual que `Btn`. El atenuado va **antes** que el
  `style` propio, así que una pantalla puede sobrescribirlo si de verdad lo necesita.
- **El script de refactor se auto-aplica.** Al extraer `Input`/`Select` con un barrido
  regex sobre `*.tsx`, `components/ui.tsx` entra en el barrido y las definiciones nuevas
  quedan recursivas (`export function Input() { return <Input …/> }`). Excluye el archivo
  que define los componentes antes de correr el barrido.
- `preview-rebuild.mjs` falla con `[CONFIG_STALE]` si cambias `cfg.overrides` sin correr
  antes el `package-build.mjs` completo (el build re-sella las claves de nota).
- La puerta de calidad del repo es `bun run build` (`tsc -b` + `vite build`) **y**
  `bun run lint`. Para solo el CSS basta `bunx vite build`, que evita el typecheck.
- **`eslint.config.js` ignora `ds-bundle`, `.design-sync` y `client/ds-sync`**: son salida
  generada y entradas del converter, no código de la app. Sin ese ignore, `bun run lint`
  falla con errores de `react-hooks/purity` en las previews y de `react-refresh` en el
  barrel, que no son defectos reales.

## Known render warns (esperados; no son regresiones)

- `[FONT_REMOTE] "Inter", "Sora"` — las fuentes llegan por `@import` de Google Fonts.
- `Spinner`, `ToastProvider` y los controles sueltos renderizan muy bajos: es su tamaño
  real.
- **Artefacto de la hoja compuesta**: en las hojas de 4 celdas se ve a veces una fila extra
  sin etiqueta que repite la primera celda, a veces recortada. Es de la plantilla de
  captura, no del componente. No graduar por eso.
- Las hojas de `_screenshots/review/` componen las celdas sobre blanco, no sobre el crema
  `--color-bg` de la app. Presentación de la hoja; no es un defecto de contraste real.
- **`tokens/` se sube vacío y es correcto**: los 115 custom properties viven dentro de
  `_ds_bundle.css`, que `styles.css` importa. No es un scrape roto; no persigas
  `cfg.tokensGlob` por esto.

## Historial de sincronizaciones

- **Proyecto destino**: "Veti Suite" `b26b0f4e-81de-46a6-83c9-f8916119d6b2`, pineado en
  `config.json`. La cuenta tiene además 4 proyectos "Design System"; uno vacío
  (`c024d133`) es sobrante de una corrida abortada y es borrable.
- **2026-09-05 (a)**: primera subida real, 29 componentes. Una corrida previa había muerto
  en el rebuild final sin crear proyecto.
- **2026-09-05 (b)**: poda a 13 componentes base + extracción de `Input`, `Select`,
  `DateInput` y `Avatar` a `client/src/components/ui.tsx`, con refactor de 59 sitios (38
  inputs + 21 selects) en 20 archivos. `build` y `lint` limpios. El bundle bajó de 272 KB a
  83 KB.

## Riesgos de re-sync

- **El barrel se desincroniza en silencio**: un componente base nuevo no aparece en el
  design system hasta que se añade a `entry.tsx` + `componentSrcMap`.
- **Cobertura de utilidades**: si `conventions.md` crece con clases nuevas, hay que añadirlas
  también a `safelist.ts` y recompilar el CSS, o no existirán en la hoja.
- **`inputStyle` sigue siendo la fuente del estilo de control** (`client/src/lib/constants.ts`).
  `Input` y `Select` lo fusionan **antes** que el `style` propio, así que un ajuste puntual
  siempre gana. Si alguien invierte ese orden, decenas de anchos y paddings se rompen a la vez.
- **No hay componente de `textarea`** y hay 3 usos crudos (`portal-form.tsx`,
  `consultation-page.tsx` ×2) que fusionan `inputStyle` a mano. Si se extrae un `Textarea`,
  hay que tocar esos tres y documentarlo en `conventions.md` §4.
- **`conventions.md` §2 es la única parte sin bucle de verificación**: la directriz de rutas
  y pantallas es prosa, no código. Si las rutas de la app dejan de ser
  `/[modulo]/[accion]/[id]` con módulo en kebab-case y borrado por modal, la directriz miente
  y nadie lo detecta automáticamente.
- La sincronización se hizo en modo **synth-entry sin build de librería**: los contratos
  `<Nombre>.d.ts` salen del análisis de las fuentes, no de tipos publicados. Son más débiles
  que los de una librería con `dist/` real.
