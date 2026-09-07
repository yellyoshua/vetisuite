# Veti Suite — cómo construir con este design system

SPA de gestión para clínicas veterinarias. **UI siempre en español** (trato de "tú",
Ecuador: `es-EC`, moneda `$`). Los identificadores del código van en inglés.

**Tema claro únicamente.** No existe modo oscuro y no debe introducirse: no emitas
variantes `dark:`, ni paletas oscuras, ni un conmutador de tema.

Este design system es **solo la base**: primitivos y controles. Las pantallas y los
componentes de módulo (fichas de cliente, tarjetas de laboratorio, editores de horario…)
**se componen con estas piezas**, no vienen dadas. Si necesitas una fila de listado, una
cabecera de pantalla o una rejilla de datos, constrúyela con `Card` + `Avatar` + `Badge` +
`Btn` siguiendo §2 y §3 — no supongas que existe un componente para eso.

## 1. Montaje

No hace falta nada: ningún componente base lee contexto. No hay provider de tema (los
tokens son variables CSS que llegan en `styles.css`) y ninguno usa `Link` ni `useNavigate`,
así que tampoco hace falta un Router para renderizarlos.

La única excepción es `ToastProvider`, que se monta **una vez** en la raíz del árbol si vas
a mostrar notificaciones. Las pantallas nunca llaman a `showToast` directamente: lo hacen
las acciones del store.

```jsx
<ToastProvider>
  <App />
</ToastProvider>
```

## 2. Rutas y pantallas (la directriz que da consistencia)

### Forma de la ruta

`/[modulo]/[accion]/[id]` — siempre en este orden, siempre en inglés y en minúsculas.

- **Módulo**: un solo nombre. Si es compuesto, se separa con **guion medio**:
  `/pets`, `/clients`, `/lab-orders`, `/service-types`. Nunca `camelCase`, nunca `_`.
- **Acción**: el segundo segmento. `new`, `show`, `edit`.
- **Id**: el tercer segmento, solo cuando la acción lo necesita.

| Pantalla | Ruta |
|---|---|
| Índice | `/pets` |
| Crear | `/pets/new` |
| Detalle | `/pets/show/:id` |
| Editar | `/pets/edit/:id` |

**Borrar no es una ruta.** No existe `/pets/delete/:id`. Borrar es siempre un `Modal` de
confirmación disparado desde el índice o el detalle, con la acción principal en
`kind="danger"` y un texto que nombra el recurso concreto. Ninguna otra acción destructiva
navega.

Ningún módulo vive anidado bajo la ruta base de otro. Los ids se leen con `useParams`; los
filtros, la página y los presets del listado viven en `useSearchParams`, no en estado local
— la URL es la fuente de verdad de un listado.

### Anatomía de cada pantalla

Las tres pantallas comparten la misma estructura; lo que cambia es el cuerpo.

| Pantalla | Cabecera | Cuerpo |
|---|---|---|
| **Índice** | título + descripción a la izquierda; acción primaria (`Btn` "Nuevo X") a la derecha | filtros (`Input` de búsqueda + `Select`) → filas en `Card` → `Pager` al pie |
| **Detalle** | enlace "Volver" al índice + título; acciones (`Editar`, destructiva) a la derecha | `Card className="p-5"` con pares label/valor en rejilla |
| **Formulario** (`new` / `edit`) | enlace "Volver" + título; sin acciones en la cabecera | `Card className="p-5"` con `Field` por control; al pie y a la derecha: `Cancelar` (ghost) + acción primaria |

Reglas que no se negocian:

- El cuerpo **ocupa todo el ancho disponible**. Nada de `maxWidth` a nivel de pantalla.
- Toda ruta con `:id` gestiona el recurso inexistente con un mensaje propio y un camino de
  vuelta al índice — nunca una pantalla en blanco ni un error crudo.
- Las precondiciones de negocio (no hay consulta abierta, no hay cliente seleccionado)
  llevan su propio mensaje explicando **qué hacer**, no el mensaje de "no encontrado".
- Acciones por fila: `Btn small kind="ghost"` con icono — `Eye` para "Ver", `Pencil` para
  "Editar", `Trash2` para la destructiva (que abre el `Modal`).

## 3. Idioma de estilos: Tailwind para el layout, tokens inline para el color

Es un sistema **mixto y deliberado**:

- **Layout, espaciado y flujo → utilidades Tailwind**: `flex`, `grid`, `grid-cols-2`,
  `items-center`, `justify-between`, `gap-2`, `flex-wrap`, `p-5`, `px-4`, `mt-3`,
  `w-full`, `min-w-0`, `shrink-0`, `truncate`, `overflow-x-auto`, `sm:` y `lg:`.
- **Color, tipografía, radios y tamaños puntuales → estilo inline con `var(--…)`**:
  `style={{ color: "var(--color-ink)", fontFamily: "var(--font-head)", fontSize: 14.5, borderRadius: 16 }}`.

Las mismas variables existen también como utilidades cuando ya estás escribiendo clases:
`bg-card`, `bg-bg`, `bg-green-soft`, `bg-amber-soft`, `bg-red-soft`, `bg-blue-soft`,
`bg-gray-soft`, `bg-input`, `bg-track`, `text-ink`, `text-sub`, `text-green`, `text-amber`,
`text-red`, `text-blue`, `border-line`, `border-line-soft`, `font-head`, `font-body`.

**Prohibido escribir un hex.** Color nuevo = variable nueva en el `@theme` de la hoja, nunca
un literal en el componente.

### Paleta

| Variable | Uso |
|---|---|
| `--color-bg` `#F6F4EE` | fondo de página (crema) |
| `--color-card` `#FFFFFF` | tarjetas, modales |
| `--color-line` / `--color-line-soft` | bordes 1px / divisores internos |
| `--color-ink` / `--color-sub` | texto principal / secundario y labels |
| `--color-green` / `--color-green-soft` | primario: acción principal, éxito, selección |
| `--color-dark` / `--color-dark-hover` | superficies oscuras y botones `dark` |
| `--color-amber` / `--color-amber-soft` | advertencia, "pendiente" |
| `--color-red` / `--color-red-soft` | peligro, deuda, caducado, agresivo |
| `--color-blue` / `--color-blue-soft` | informativo, "en proceso" |
| `--color-input` / `--color-track` | fondo de control / carril de `Toggle` |

Regla de pareja: el tono `*-soft` es **siempre fondo** y el fuerte **siempre texto/icono**.
Nunca al revés.

### Tipografía

`--font-head` = Sora (títulos y cifras), `--font-body` = Inter (todo lo demás).
H1 de pantalla 22/700 (`letterSpacing: -0.3`); cifra KPI 26/700 (`-0.5`); H2 15/600;
título de card 13.5–15/600; cuerpo 12.5–13.5; metadatos 11–12 en `--color-sub`; labels de
formulario y cabeceras de tabla 11–11.5/600 en UPPERCASE. Horas, montos y stock llevan
`fontVariantNumeric: "tabular-nums"`.

### Forma

Radios: controles y botones 10 · avatares 12 · filas de listado y toasts 14 · cards 16 ·
modales 18 · badges 999. Sombra **solo** en elementos flotantes (`shadow-lg` en dropdowns
y toasts, `shadow-2xl` en modales); las cards no llevan sombra en reposo.

## 4. Los componentes base

Nunca construyas un botón, badge, card, modal, control de formulario, avatar, paginación,
spinner ni toggle ad-hoc: úsalos de aquí.

| Componente | Para | API |
|---|---|---|
| `Btn` | toda acción | `kind`: `primary` · `dark` · `ghost` · `danger` · `amber`; `small`, `full`, `disabled` |
| `Badge` | etiqueta de estado | `tone`: `green` · `amber` · `red` · `blue` · `gray` |
| `Card` | toda superficie de contenido | `className`, `style` |
| `Modal` | diálogo y confirmación destructiva | `title`, `onClose`, `width` (460 por defecto) |
| `Field` | label uppercase sobre un control | `label` + `children` (el control) |
| `Input` | texto y tipos nativos | props nativas de `<input>`; `style` se fusiona sobre el base |
| `Select` | desplegable | props nativas de `<select>`; mismo aspecto que `Input` |
| `DateInput` | fecha | `Input` con `type="date"` fijado |
| `Avatar` | iniciales o icono de identidad | `size` (40 por defecto), `children`; la tipografía escala con el tamaño |
| `Pager` | paginación de listados | `page`, `total`, `pageSize`, `onPage` |
| `Spinner` | carga en línea o dentro de un botón | `size` (14 por defecto) |
| `Toggle` | booleano | `checked`, `onChange`, `label`, pista opcional |
| `ToastProvider` | notificaciones | se monta una vez; se dispara con `showToast` |

**No hay componente de `textarea`.** Usa el elemento crudo con el estilo base del control
más el alto: `style={{ ...inputStyle, minHeight: 76 }}`.

Iconos: **lucide-react** exclusivamente. 11 dentro de badges, 12–14 en botones, 14–19 en
cabeceras y avatares.

### Estado → tono de `Badge` (mapa exacto)

Citas: `pendiente`→amber · `confirmada`→green · `completada`→blue · `cancelada`→gray.
Peluquería: `pendiente`→amber · `proceso`→blue · `terminado`→green · `entregado`→gray.
Laboratorio: `solicitado`→amber · `resultado`→green. Deuda, caducidad y "agresivo": red.
Los valores de estado se muestran en español, tal cual están en los datos.

## 5. Accesibilidad y copy

Existe una regla global `:focus-visible` (anillo verde de 2px, `outline-offset: 2px`).
**Nunca escribas `outline: "none"`.** Los modales atrapan el foco, cierran con `Escape` y lo
devuelven al disparador.

Copy cercano-profesional, con nombre propio: "Cliente Ana Cevallos creado.", "Busca al
cliente para abrir un expediente". El copy nunca anuncia un cobro, un envío ni una
publicación que el código no ejecuta.

## 6. Dónde está la verdad

`styles.css` y sus `@import` (ahí viven las variables y las utilidades) y
`guidelines/DESIGN.md`, que es la especificación completa del sistema — paleta, escala
tipográfica, radios y mapa de estados. Léelos antes de inventar un valor. Cada componente
trae además su `<Nombre>.prompt.md`.

## 7. Ejemplo idiomático

Un índice completo, compuesto solo con la base:

```jsx
<div className="p-5">
  <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
    <div>
      <h1 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700, color: "var(--color-ink)", letterSpacing: -0.3 }}>
        Inventario
      </h1>
      <p style={{ fontSize: 12.5, color: "var(--color-sub)", marginTop: 2 }}>
        Catálogo, stock mínimo y caducidad.
      </p>
    </div>
    <Btn><Plus size={14} /> Nuevo producto</Btn>
  </div>

  <div className="flex items-center gap-2 flex-wrap mb-3">
    <Input placeholder="Buscar producto…" style={{ flex: 1, minWidth: 200 }} />
    <Select defaultValue="Todas" style={{ width: "auto", minWidth: 140 }}>
      <option>Todas</option>
      <option>Vacunas</option>
      <option>Medicamentos</option>
    </Select>
  </div>

  <Card className="flex items-center gap-3 p-3.5 mb-2">
    <Avatar>VA</Avatar>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="truncate" style={{ fontFamily: "var(--font-head)", fontSize: 14.5, fontWeight: 600, color: "var(--color-ink)" }}>
          Vacuna Antirrábica
        </span>
        <Badge tone="red">Stock bajo</Badge>
      </div>
      <div className="truncate" style={{ fontSize: 12, color: "var(--color-sub)", marginTop: 1 }}>
        Vacunas · $12.00 · 3 / mín. 5
      </div>
    </div>
    <div className="flex gap-1.5 shrink-0">
      <Btn small kind="ghost"><Eye size={13} /> Ver</Btn>
      <Btn small kind="ghost"><Pencil size={13} /> Editar</Btn>
    </div>
  </Card>

  <Pager page={0} total={48} pageSize={8} onPage={setPage} />
</div>
```
