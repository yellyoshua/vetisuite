# DESIGN.md — Sistema de diseño de Veti Suite

Especificación de la identidad visual para agentes de IA. **Fuente de verdad: el código.** Los tokens viven en `src/lib/constants.ts` (objetos `T` y `F`); los primitivos de UI en `src/components/ui.tsx`. Si un valor de este documento contradice el código, manda el código — y este archivo debe actualizarse.

## 1. Identidad

- **Producto**: Veti Suite — sistema clínico integral para veterinarias.
- **Estética**: fondo crema cálido, verde bosque como color primario, tarjetas blancas con bordes suaves. Densidad de información alta pero ordenada (es una herramienta de trabajo diario).
- **Tema**: solo claro. No existe modo oscuro; no lo introduzcas.
- **Tono**: cálido-profesional. Español, trato de "tú".

## 2. Color

Todos los colores se usan a través del objeto `T` de `src/lib/constants.ts`. **Prohibido escribir hex sueltos en componentes**; si necesitas un color nuevo, agrégalo primero a `T`.

### Tokens principales

| Token | Hex | Uso |
|---|---|---|
| `T.bg` | `#F6F4EE` | Fondo de página (crema) |
| `T.card` | `#FFFFFF` | Fondo de tarjetas, modales, inputs de barra |
| `T.line` | `#E6E1D5` | Bordes estándar (1px) |
| `T.lineSoft` | `#EFEBE1` | Bordes/divisores suaves (filas internas) |
| `T.ink` | `#1E2A26` | Texto principal |
| `T.sub` | `#6C7A72` | Texto secundario, labels, metadatos |
| `T.green` | `#186653` | **Primario**: botones principales, éxito, selección activa |
| `T.greenSoft` | `#E2EFE9` | Fondo de selección/badges verdes/avatares |
| `T.dark` | `#14312A` | Sidebar, botones `dark` |
| `T.darkHover` | `#1C4038` | Hover sobre superficies dark |
| `T.amber` | `#B07314` | Advertencia, estado "pendiente" |
| `T.amberSoft` | `#FBF0DA` | Fondo de badges/alertas ámbar |
| `T.red` | `#B3402F` | Peligro, deuda, caducidad, "agresivo" |
| `T.redSoft` | `#F9E7E3` | Fondo de badges/alertas rojas y botón `danger` |
| `T.blue` | `#2C6E8F` | Informativo, estado "en proceso/completada" |
| `T.blueSoft` | `#E4EFF4` | Fondo de badges/alertas azules |
| `T.wa` | `#1D8F5B` | **Exclusivo** de automatización WhatsApp (botones `wa`, toasts `wa`) |

Regla de pareja: los tonos `*Soft` son siempre **fondo** y su versión fuerte es siempre **texto/icono** (ej. badge ámbar = fondo `amberSoft` + texto `amber`). Nunca al revés.

### Neutrales auxiliares (hardcodeados en componentes existentes)

| Hex | Uso |
|---|---|
| `#FCFBF8` | Fondo de inputs (`inputStyle`) |
| `#F1EFE7` | Pista del kanban, chips de signos vitales |
| `#F0EDE4` | Skeletons de carga |
| `#F4F1E9` | Hover de opciones (clase `.vs-opt`) |
| `#FAF8F2` | Pie del dropdown de búsqueda |
| `#F0EFE9` | Celda de cita completada |
| `#EEECE4` | Fondo del badge `gray` |
| `#D8D3C5` | Thumb del scrollbar |

## 3. Tipografía

Fuentes cargadas por Google Fonts en `src/index.css`; referenciadas vía `F` en `src/lib/constants.ts`.

- **`F.head`** = `'Sora', sans-serif` — títulos y cifras. Pesos: 400/600/700.
- **`F.body`** = `'Inter', system-ui, sans-serif` — todo lo demás. Pesos: 400/500/600/700.

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
| `SectionHead` | `src/components/ui.tsx` | Header de pantallas **índice** (título + sub + CTA) |
| `PageHeader` | `src/components/page-header.tsx` | Header de pantallas **show/edit/new** ("← Volver" + título + acciones) |
| `ResourceListItem` | `src/components/resource-list-item.tsx` | Fila estándar de listados: avatar/icono, título+badges, subtítulo, meta, acciones a la derecha |
| `InfoGrid` | `src/components/info-grid.tsx` | Pares label/valor en pantallas show |
| `ResourceNotFound` | `src/components/resource-not-found.tsx` | Obligatorio cuando un `:id` no existe |
| `Pager` | `src/components/ui.tsx` | Paginación "Mostrando X–Y de Z" + Anterior/Siguiente |
| `Spinner`, `Elapsed`, `PatientAlerts` | `src/components/ui.tsx` | Carga, cronómetro mm:ss, alertas de paciente (agresivo/alergias) |
| `Toasts` | `src/components/toasts.tsx` | Bottom-right, auto-dismiss 5.2s; variante `wa` verde con encabezado "Automatización · WhatsApp" |
| `ClientSearch` / `PatientPicker` | `src/components/` | Typeahead de clientes (debounce 300ms, máx. 8) y selector dependiente de mascotas |

## 6. Patrones de pantalla

- **Índice** (`/[module]`): `SectionHead` + búsqueda (input con icono `Search`) + listado (`ResourceListItem`) / tabla / kanban + `Pager` + CTA "Nuevo X" `primary` en el header. Acciones por ítem: `Btn small ghost` con iconos `Eye`/`Pencil` ("Ver", "Editar").
- **Show** (`/[module]/show/:id`): `PageHeader` con Volver + `Card` con `InfoGrid` + acciones contextuales debajo o en el header.
- **Form new/edit**: `PageHeader` + `Card` centrada-izquierda; botones al pie alineados a la derecha: `Cancelar` (`ghost`) + acción primaria.
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
