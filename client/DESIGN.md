# DESIGN.md — Sistema de diseño de Veti Suite

Especificación de la identidad visual para agentes de IA. **Fuente de verdad: el código.** Los hex viven en el bloque `@theme` de `src/index.css`; `src/lib/constants.ts` (objetos `T` y `F`) solo los referencia con `var()`; los primitivos de UI están en `src/components/ui.tsx`. Si un valor de este documento contradice el código, manda el código — y este archivo debe actualizarse.

## 1. Identidad

- **Producto**: Veti Suite — sistema clínico integral para veterinarias.
- **Estética**: fondo crema cálido, verde bosque como color primario, tarjetas blancas con bordes suaves. Densidad de información alta pero ordenada (es una herramienta de trabajo diario).
- **Tema**: solo claro. No existe modo oscuro; no lo introduzcas.
- **Tono**: cálido-profesional. Español, trato de "tú".

## 2. Color

La paleta se define **una sola vez**, como variables CSS en el bloque `@theme` de `src/index.css`. De ahí salen las dos formas de consumirla:

| Forma | Cómo | Cuándo |
|---|---|---|
| Utilidad Tailwind | `className="bg-green-soft text-green border-line"` | Cuando ya estás escribiendo clases |
| Estilo inline | `style={{ color: T.green }}` (`T` de `src/lib/constants.ts`, cuyos valores son `var(--color-green)`) | Valores puntuales mezclados con radios/tamaños |

Ambas resuelven a la misma variable: cambiar un hex en `@theme` cambia toda la app. **Prohibido escribir hex sueltos en componentes.** Color nuevo = primero `--color-*` en `@theme`, después la entrada en `T` si lo vas a usar inline.

El bloque es `@theme static` a propósito: sin `static`, Tailwind poda las variables que ninguna utilidad usa y los estilos inline con `var()` se quedarían sin valor.

### Tokens principales

| Token `T` | Variable / utilidad | Hex | Uso |
|---|---|---|---|
| `T.bg` | `--color-bg` · `bg-bg` | `#F6F4EE` | Fondo de página (crema) |
| `T.card` | `--color-card` · `bg-card` | `#FFFFFF` | Fondo de tarjetas, modales, inputs de barra |
| `T.line` | `--color-line` · `border-line` | `#E6E1D5` | Bordes estándar (1px) |
| `T.lineSoft` | `--color-line-soft` | `#EFEBE1` | Bordes/divisores suaves (filas internas) |
| `T.ink` | `--color-ink` · `text-ink` | `#1E2A26` | Texto principal |
| `T.sub` | `--color-sub` · `text-sub` | `#6C7A72` | Texto secundario, labels, metadatos |
| `T.green` | `--color-green` | `#186653` | **Primario**: botones principales, éxito, selección activa |
| `T.greenSoft` | `--color-green-soft` | `#E2EFE9` | Fondo de selección/badges verdes/avatares |
| `T.dark` | `--color-dark` | `#14312A` | Sidebar, botones `dark` |
| `T.darkHover` | `--color-dark-hover` | `#1C4038` | Hover sobre superficies dark |
| `T.amber` | `--color-amber` | `#B07314` | Advertencia, estado "pendiente" |
| `T.amberSoft` | `--color-amber-soft` | `#FBF0DA` | Fondo de badges/alertas ámbar |
| `T.red` | `--color-red` | `#B3402F` | Peligro, deuda, caducidad, "agresivo" |
| `T.redSoft` | `--color-red-soft` | `#F9E7E3` | Fondo de badges/alertas rojas y botón `danger` |
| `T.blue` | `--color-blue` | `#2C6E8F` | Informativo, estado "en proceso/completada" |
| `T.blueSoft` | `--color-blue-soft` | `#E4EFF4` | Fondo de badges/alertas azules |
| `T.wa` | `--color-wa` | `#1D8F5B` | **Exclusivo** de automatización WhatsApp (botones `wa`, toasts `wa`) |

Regla de pareja: los tonos `*Soft` son siempre **fondo** y su versión fuerte es siempre **texto/icono** (ej. badge ámbar = fondo `amberSoft` + texto `amber`). Nunca al revés.

### Neutrales auxiliares

| Token `T` | Variable | Hex | Uso |
|---|---|---|---|
| `T.input` | `--color-input` | `#FCFBF8` | Fondo de inputs (`inputStyle`) |
| `T.track` | `--color-track` | `#F1EFE7` | Pista del kanban, chips de signos vitales |
| `T.skeleton` | `--color-skeleton` | `#F0EDE4` | Skeletons de carga |
| `T.optHover` | `--color-opt-hover` | `#F4F1E9` | Hover de opciones (clase `.vs-opt`) |
| `T.dropdownFoot` | `--color-dropdown-foot` | `#FAF8F2` | Pie del dropdown de búsqueda |
| `T.done` | `--color-done` | `#F0EFE9` | Celda de cita completada |
| `T.graySoft` | `--color-gray-soft` | `#EEECE4` | Fondo del badge `gray` |
| `T.scrollThumb` | `--color-scroll-thumb` | `#D8D3C5` | Thumb del scrollbar |

### Dos excepciones deliberadas

- **Alfas sobre superficies oscuras** (overlay de modal `rgba(18,28,24,0.5)`, ítem activo del sidebar `rgba(255,255,255,0.11)`, texto inactivo `rgba(255,255,255,0.62)`) siguen inline: son opacidades sobre lo que haya debajo, no colores de la paleta. No las conviertas en tokens.
- **Color por veterinario** (`vets[].color` en `src/states/app.state.tsx`) es **dato**, no diseño: en producción lo elige el usuario al crear el veterinario. Por eso vive en el store como hex y es el único hex legítimo fuera de `@theme`.

## 3. Tipografía

Fuentes cargadas por Google Fonts en `src/index.css` y declaradas en el mismo `@theme` que los colores; se consumen inline vía `F` (`src/lib/constants.ts`) o como utilidad Tailwind.

- **`F.head`** = `--font-head` = `'Sora', sans-serif` (utilidad `font-head`) — títulos y cifras. Pesos: 400/600/700.
- **`F.body`** = `--font-body` = `'Inter', system-ui, sans-serif` (utilidad `font-body`) — todo lo demás. Pesos: 400/500/600/700.

Escala real en uso (px):

| Elemento | Tamaño | Fuente/peso | Notas |
|---|---|---|---|
| H1 de página | 22 | Sora 700 | `letterSpacing: -0.3` |
| Cifra KPI | 26 | Sora 700 | `letterSpacing: -0.5` |
| H2 de sección | 15 | Sora 600 | |
| Título de card/ítem | 13.5–15 | Sora 600–700 | |
| Cuerpo | 12.5–13.5 | Inter 400–600 | |
| Metadatos | 11–12 | Inter 400 | color `T.sub` |
| Labels de formulario (`Field`) | 11.5 | Inter 600 | UPPERCASE, `letterSpacing: 0.3`, color `T.sub` |
| Cabeceras de tabla | 11 | Inter 600 | UPPERCASE, `letterSpacing: 0.4`, color `T.sub` |

Números tabulares (`fontVariantNumeric: "tabular-nums"`) en horas, montos y stock.

## 4. Forma y espaciado

| Elemento | Border radius |
|---|---|
| Inputs y botones | 10 |
| Avatares (40×40) | 12 |
| Filas de listado (`ResourceListItem`), toasts | 14 |
| Cards | 16 |
| Modales | 18 |
| Badges | 999 (píldora) |

- Bordes: `1px solid T.line`; divisores internos `T.lineSoft`.
- Sombras: **solo** en elementos flotantes (dropdown `shadow-lg`, modal `shadow-2xl`, toasts `shadow-lg`). Las cards no llevan sombra en reposo.
- Contenedor de página: `maxWidth: 1180`, padding `px-4 py-5 sm:px-6 lg:px-8 lg:py-6`.
- Formularios: `Card` con `maxWidth: 520` (560 si incluyen buscador de cliente).
- Layout: utilidades de Tailwind v4 para flex/grid/spacing; valores puntuales (radios, tamaños de fuente) como estilos inline con tokens.

## 5. Componentes canónicos

**Nunca construyas un botón, badge, card, modal o header ad-hoc.** Reusa:

| Componente | Path | Variantes / uso |
|---|---|---|
| `Btn` | `src/components/ui.tsx` | `kind`: `primary` (verde), `dark`, `ghost`, `danger`, `amber`, `wa`; props `small`, `full`, `disabled` |
| `Badge` | `src/components/ui.tsx` | `tone`: `green`, `amber`, `red`, `blue`, `gray` |
| `Card` | `src/components/ui.tsx` | Contenedor base blanco radius 16 |
| `Modal` | `src/components/ui.tsx` | Overlay `rgba(18,28,24,0.5)`, header sticky, `width` configurable (default 460) |
| `Field` + `inputStyle` | `ui.tsx` / `constants.ts` | Label uppercase + input/select/textarea |
| `CustomPage` | `src/components/pages/custom-page.tsx` | **Cáscara de TODA pantalla**: `title`, `description`, `actions`, `goBack` + `backTo`. El cuerpo siempre ocupa todo el ancho |
| `ResourceListItem` | `src/components/resource-list-item.tsx` | Fila estándar de listados: avatar/icono, título+badges, subtítulo, meta, acciones a la derecha |
| `InfoGrid` | `src/components/info-grid.tsx` | Pares label/valor en pantallas show |
| `ResourceNotFound` | `src/components/resource-not-found.tsx` | Obligatorio cuando un `:id` no existe |
| `Pager` | `src/components/ui.tsx` | Paginación "Mostrando X–Y de Z" + Anterior/Siguiente |
| `Spinner`, `Elapsed`, `PatientAlerts` | `src/components/ui.tsx` | Carga, cronómetro mm:ss, alertas de paciente (agresivo/alergias) |
| `CustomLayout` | `src/components/layouts/custom-layout.tsx` | Cáscara de la app: sidebar, drawer y barra móviles y contenedor del contenido. Un solo componente; el menú va quemado dentro |
| `ToastProvider` + `showToast` | `src/components/toast.tsx` | Notificaciones sobre `sonner`. El provider se monta en `main.tsx` junto a `<App />`; `showToast` solo lo llama `notify` del store. Bottom-right, 5.2s; variante `wa` verde con encabezado "Automatización · WhatsApp" |
| `ClientSearch` / `PatientPicker` | `src/components/` | Typeahead de clientes (debounce 300ms, máx. 8) y selector dependiente de mascotas |

## 6. Patrones de pantalla

Toda pantalla es un `CustomPage`. Lo único que cambia entre patrones son sus props:

- **Índice** (`/[module]`): `<CustomPage actions={<Btn>Nuevo X</Btn>}>` + búsqueda (input con icono `Search`) + listado (`ResourceListItem`) / tabla / kanban + `Pager`. Acciones por ítem: `Btn small ghost` con iconos `Eye`/`Pencil` ("Ver", "Editar").
- **Show** (`/[module]/show/:id`): `<CustomPage goBack backTo="/[module]" actions={…}>` + `Card` con `InfoGrid`.
- **Form new/edit**: `<CustomPage goBack backTo={…}>` + `Card className="p-5"` **sin `maxWidth` propio**; botones al pie alineados a la derecha: `Cancelar` (`ghost`) + acción primaria.
- **Anchos**: toda pantalla ocupa el ancho completo del contenedor (1180px de `App.tsx`); nada de `style={{ maxWidth: N }}` en la pantalla. Si una pantalla necesita otra cáscara, se crea otro componente en `src/components/pages/` — no se añaden condicionales a `CustomPage`.
- **Not found**: toda pantalla con `:id` renderiza `ResourceNotFound` si el recurso no existe.
- **Sidebar**: fondo `T.dark`, ancho 232 (72 colapsado, transición `width .22s ease`); ítem activo `rgba(255,255,255,0.11)` con texto blanco; inactivo `rgba(255,255,255,0.62)`.

## 7. Estados semánticos (mapa exacto)

Los valores de estado se muestran en español tal cual están en los datos:

| Dominio | Estado → tono de Badge |
|---|---|
| Citas | `pendiente`→amber · `confirmada`→green · `completada`→blue · `cancelada`→gray |
| Peluquería | `pendiente`→amber · `proceso`→blue · `terminado`→green · `entregado`→gray |
| Laboratorio | `solicitado`→amber · `resultado`→green |
| Facturación (origen del cargo) | `Clínica`→green · `Peluquería`→blue · `Laboratorio`→amber |
| Deuda / caducidad / agresivo | red |

## 8. Iconografía y motion

- Iconos: **lucide-react** exclusivamente. Tamaños: 11 dentro de badges, 12–14 en botones, 14–19 en headers y avatares. Especies: `Dog`/`Cat`/`Bird`, fallback `PawPrint` (mapa `SPECIES_ICON` en constants).
- Animaciones existentes (definidas en `src/index.css`): `vsSpin` (spinner, .7s linear), `vsPulse` (skeletons, 1.2s ease-in-out), transición de ancho del sidebar (.22s), hover `.vs-opt` → `#F4F1E9`. No agregues librerías de animación.

## 9. Voz y copy

- Español, "tú", cercano-profesional: instructivo sin ser frío ("Busca al cliente para abrir un expediente").
- Emojis con moderación y solo donde ya se usan: 🐾 👋 ✨ 📷 🎒 ✂️ ⏱ ℞.
- Toasts siempre informativos y con nombre propio: "Cliente Ana Cevallos creado.", "WhatsApp a Carolina Ríos: …".
- Los mensajes de automatización WhatsApp van en toast `wa` y citan el mensaje enviado entre comillas.
