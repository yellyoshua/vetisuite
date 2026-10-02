---
name: Veti Suite
colors:
  background: { light: '#f6f4ee', dark: '#101815' }
  foreground: { light: '#1e2a26', dark: '#e8ece9' }
  card: { light: '#ffffff', dark: '#17221e' }
  muted: { light: '#f1efe7', dark: '#1f2b27' }
  muted-foreground: { light: '#616e67', dark: '#9aa8a1' }
  accent: { light: '#efebe1', dark: '#22302b' }
  border: { light: '#e6e1d5', dark: '#3a4b45' }
  neutral-faint: { light: '#6a756f', dark: '#8e9b94' }
  neutral-frame: { light: '#f1efe7', dark: '#141e1a' }
  neutral-stripe: { light: '#ebe7dd', dark: '#18221e' }
  neutral-soft: { light: '#eeece4', dark: '#eeece4' }
  neutral-scroll: { light: '#d8d3c5', dark: '#3a4b45' }
  neutral-shade: { light: '#121c18', dark: '#121c18' }
  primary: { light: '#186653', dark: '#4fb393' }
  primary-foreground: { light: '#ffffff', dark: '#101815' }
  primary-soft: { light: '#e2efe9', dark: '#1b3a31' }
  primary-strong: { light: '#14312a', dark: '#14312a' }
  primary-strong-foreground: { light: '#ffffff', dark: '#ffffff' }
  danger: { light: '#b3402f', dark: '#e0735f' }
  danger-soft: { light: '#f9e7e3', dark: '#f9e7e3' }
  warning: { light: '#976311', dark: '#d9a650' }
  warning-soft: { light: '#fbf0da', dark: '#fbf0da' }
  info: { light: '#2c6e8f', dark: '#6fb0d0' }
  info-soft: { light: '#e4eff4', dark: '#e4eff4' }
typography:
  head:
    fontFamily: Sora
    fontWeight: 700
    letterSpacing: 0
  body:
    fontFamily: Inter
    fontWeight: 400
  loadedWeights:
    Sora: [400, 600, 700]
    Inter: [400, 500, 600, 700]
  scale:
    xs: 12px/16px
    control: 13px
    sm: 14px/20px
    base: 16px/24px
    lg: 18px/28px
    xl: 20px/28px
    2xl: 24px/32px
    3xl: 30px/36px
spacing:
  0.5: 2px
  1: 4px
  1.5: 6px
  2: 8px
  2.5: 10px
  3: 12px
  3.5: 14px
  4: 16px
  5: 20px
  6: 24px
  8: 32px
  10: 40px
rounded:
  sm: 6px
  md: 8px
  control: 10px
  lg: 10px
  avatar: 12px
  row: 14px
  xl: 14px
  card: 16px
  modal: 18px
  2xl: 18px
  3xl: 22px
---

# Sistema de diseño: Veti Suite (`client/`)

Guía para agentes de IA que crean o modifican UI en la SPA de los paneles. Estructura adaptada de la
[referencia de extracción de DESIGN.md de Google Labs](https://github.com/google-labs-code/stitch-skills/blob/main/plugins/stitch-design/skills/extract-design-md/SKILL.md)
(documentación externa: aquí no se usa la skill ni Stitch). Las claves de `colors` en el frontmatter
son los nombres de token del código, no nombres descriptivos, para que coincidan con las utilidades
de Tailwind.

## 1. Identidad, alcance y fuentes de verdad

- **Producto**: herramienta de trabajo diario para clínicas veterinarias. Densidad de información
  alta pero ordenada, texto en español.
- **Atmósfera**: fondo crema cálido, verde bosque como color primario, superficies blancas con bordes
  suaves de tono arena. En modo oscuro, verdes muy oscuros casi negros con el primario aclarado.
  Los estados usan ámbar (advertencia), rojo (destructivo) y azul (información), siempre en pareja
  tono fuerte + fondo suave.
- **Temas**: claro (por defecto) y oscuro (clase `.dark` en `<html>`). Hoy solo el catálogo
  `/ui-catalog` activa `.dark`, mediante `src/ui/theme-toggle`. Todas las pantallas usan tokens
  que se adaptan, pero el modo oscuro solo se revisó visualmente en el catálogo (ver §2.4).

**Fuentes de verdad**, por orden:

1. **Tokens**: `client/src/globals.css`. Los colores literales viven en `:root` (claro) y `.dark`
   (oscuro); `@theme inline` los expone como utilidades; `@theme` guarda fuentes, radios, sombras
   y curvas.
2. **Comportamiento y dimensiones**: los componentes. Hay dos conjuntos (ver §5):
   `client/src/components/ui/` (shadcn, lo usan unas 52 pantallas) y `client/src/ui/` (nuevo, cada
   componente con `*.handlers.ts` + `*.tsx` + `*.demo.tsx`; hoy solo lo consume el catálogo).
3. **Esta guía** describe lo anterior. Si contradice al código, manda el código. Quien cambie un token,
   una sombra, un radio o las dimensiones de un componente actualiza esta guía en el mismo cambio.

Cada valor está marcado como **observado** (leído en el código) o **propuesta** (recomendación, no
aplicada).

## 2. Colores

### 2.1 Nomenclatura

Cada color empieza por el nombre de su grupo: `neutral`, `primary`, `danger`, `warning` o `info`.
Los neutros de uso general conservan los nombres de rol de shadcn (`background`, `foreground`,
`card`, `muted`, `accent`, `border`…). Ningún token de la paleta usa el nombre de un color
(`green`, `red`, `blue`, `amber`, `gray`). Así, la paleta por defecto de Tailwind (`green-600`,
`red-500`…) queda libre y nunca se confunde con la marca. En `client/src` no se usa: todo color
sale de la paleta.

Cada token **se adapta al tema**. `:root` define el valor claro y `.dark` redefine solo lo que
cambia. `@theme inline` expone cada variable como utilidad (`--color-primary: var(--primary)` →
`bg-primary`, `text-primary`, `border-primary/40`…). Los literales hexadecimales viven solo en
`:root` y `.dark`, y los alias se escriben con `var()`.

| Forma | Ejemplo | Cuándo |
|---|---|---|
| Utilidad Tailwind | `bg-primary-soft text-primary`, `border-border`, `text-muted-foreground` | Siempre que se escriben clases |
| `var()` en TS | `var(--color-primary)` en `DonutChart` | Solo cuando una API pide un color en JS (SVG, gradientes) |

Prohibido: hex fuera de `globals.css`, valores arbitrarios (`bg-[#…]`), estilos inline con color y
la paleta por defecto de Tailwind en la UI. Un color nuevo se agrega a su grupo en `:root`, más
`.dark` si cambia y `@theme inline`, y después se documenta aquí.

### 2.2 Paleta por grupo

«Oscuro» es el valor bajo `.dark`. «Igual» significa que el valor no cambia; en esos casos no
existe variante oscura y no debe inventarse una.

**neutral**: superficies, bordes y texto

| Token | Claro | Oscuro | Función |
|---|---|---|---|
| `background` | `#f6f4ee` | `#101815` | Fondo de página (`body`, `WorkspaceLayout`) |
| `foreground` | `#1e2a26` | `#e8ece9` | Texto principal |
| `card` | `#ffffff` | `#17221e` | Tarjetas, inputs, menús |
| `card-foreground` · `popover-foreground` · `accent-foreground` | alias de `foreground` | ídem | Texto sobre esas superficies |
| `popover` | alias de `card` | ídem | Menús, tooltips, popovers |
| `muted` | `#f1efe7` | `#1f2b27` | Pistas (`Meter`, `DonutChart`), rellenos suaves, hover neutro |
| `muted-foreground` | `#616e67` | `#9aa8a1` | Texto secundario, labels, placeholders |
| `accent` | `#efebe1` | `#22302b` | Hover de filas y botones fantasma, divisores suaves |
| `border` | `#e6e1d5` | `#3a4b45` | Bordes de 1px |
| `input` | alias de `border` | ídem | Borde de controles shadcn |
| `ring` | alias de `primary` | ídem | Foco visible |
| `neutral-faint` | `#6a756f` | `#8e9b94` | Texto terciario: descripciones, fechas, separadores |
| `neutral-frame` | alias de `muted` | `#141e1a` | Marco de `FramedCard` y `Dialog` |
| `neutral-stripe` | `#ebe7dd` | `#18221e` | Trama de la utilidad `bg-stripes` |
| `neutral-soft` | `#eeece4` | igual | Fondo del badge neutro |
| `neutral-scroll` | `#d8d3c5` | alias de `border` | Barra de scroll |
| `neutral-shade` | `#121c18` | igual | Velos de drawer y diálogo (`bg-neutral-shade/55`); color base de las sombras |

**primary**: marca, acción principal, éxito

| Token | Claro | Oscuro | Función |
|---|---|---|---|
| `primary` | `#186653` | `#4fb393` | Botón principal, selección activa, éxito, foco |
| `primary-foreground` | alias de `card` (`#ffffff`) | alias de `background` (`#101815`) | Texto sobre `primary`, `danger`, `info` y `warning` sólidos |
| `primary-soft` | `#e2efe9` | `#1b3a31` | Fondo de selección, avatares, badge primario |
| `primary-strong` | `#14312a` | igual | Superficie profunda: sidebar, período activo, tono fuerte de KPI/Meter |
| `primary-strong-foreground` | `#ffffff` | igual | Texto e iconos sobre `primary-strong` o sobre imágenes |

**danger**: error y acción destructiva

| Token | Claro | Oscuro | Función |
|---|---|---|---|
| `danger` | `#b3402f` | `#e0735f` | Texto, icono y borde de error; botón destructivo |
| `danger-soft` | `#f9e7e3` | igual | Fondo de badge y alerta de error |

**warning**: advertencia, pendiente

| Token | Claro | Oscuro | Función |
|---|---|---|---|
| `warning` | `#976311` | `#d9a650` | Texto e icono de advertencia, estado «pendiente» |
| `warning-soft` | `#fbf0da` | igual | Fondo de badge y alerta de advertencia |

**info**: informativo, en proceso

| Token | Claro | Oscuro | Función |
|---|---|---|---|
| `info` | `#2c6e8f` | `#6fb0d0` | Texto e icono informativo, estado «en proceso» |
| `info-soft` | `#e4eff4` | igual | Fondo de badge y alerta informativa |

Las claves de tono en TS siguen el mismo nombre de grupo (`BadgeTone`, `KpiTone`, `MeterTone`,
`DonutTone`: `primary`, `warning`, `danger`, `info`, `neutral`…). Las variantes de componente que
no son colores no cambian (Button `variant="secondary"` / `"destructive"`).

### 2.3 Equivalencias con los nombres anteriores

Para leer historial o ramas viejas. Todos estos nombres ya no existen.

| Antes | Ahora |
|---|---|
| `bg` · `ink` · `sub` · `faint` | `background` · `foreground` · `muted-foreground` · `neutral-faint` |
| `line` · `line-soft` · `track` | `border` · `accent` · `muted` |
| `frame` · `stripe` · `gray-soft` · `scroll-thumb` · `shade` | `neutral-frame` · `neutral-stripe` · `neutral-soft` · `neutral-scroll` · `neutral-shade` |
| `green` · `green-soft` · `dark` | `primary` · `primary-soft` · `primary-strong` |
| `red` · `red-soft` · `destructive` | `danger` · `danger-soft` · `danger` |
| `amber` · `amber-soft` · `blue` · `blue-soft` | `warning` · `warning-soft` · `info` · `info-soft` |
| `secondary` · `secondary-foreground` | `primary-soft` · `primary` |
| `accent-green` · `brand-secondary` · `brand-text-primary` | `primary` · `card` · `foreground` |
| `*-dark` (`green-dark`, `card-dark`…) | valor del token en `.dark` |

### 2.4 Modo oscuro

- Todo token se adapta a `.dark` en `<html>`. Los `*-soft` de estado, `neutral-soft`,
  `neutral-shade`, `primary-strong` y `primary-strong-foreground` tienen un único valor.
- `dark:` es `&:is(.dark *)`: aplica a los descendientes de `.dark`. No hace falta para colores,
  porque los tokens ya cambian solos. Úsalo solo para diferencias que no son de color
  (`dark:shadow-none`) o de opacidad sobre un token (`dark:bg-input/30`).
- Hoy solo el catálogo `/ui-catalog` activa `.dark` (`src/ui/theme-toggle`).
- En oscuro, `warning` pasa a `#d9a650` pero `warning-soft` sigue en `#fbf0da` (1.95:1). Lo mismo
  pasa con `danger-soft` e `info-soft`: no combines un fondo `*-soft` con su tono dentro de `.dark`
  hasta que existan valores oscuros para los fondos suaves (§7.2).

### 2.5 Parejas texto/fondo

Pareja de estado: el `*-soft` siempre es **fondo** y el tono del grupo siempre es **texto o
icono** (`constants/badge-tones.ts`: `bg-warning-soft text-warning`). Nunca al revés. Sobre un
relleno sólido (`bg-primary`, `bg-danger`…) el texto es `text-primary-foreground`; sobre
`bg-primary-strong`, `text-primary-strong-foreground`. Los contrastes medidos están en §7.

## 3. Tipografía

Observado:

- **Familias**: `font-head` = `'Sora', sans-serif` y `font-body` = `'Inter', system-ui, sans-serif`,
  cargadas desde Google Fonts en `index.html` (Sora 400/600/700, Inter 400/500/600/700). `<body>`
  usa `font-body`; `h1`–`h6` usan Sora 700 con `letter-spacing: 0` (`@layer base`).
- **Pesos en uso**: `font-medium` (500) es el más frecuente, seguido de `font-semibold` (600) y
  `font-bold` (700). `font-black` (900) aparece 4 veces y no está cargado: el navegador lo sintetiza.
- **Tamaños más usados**: `text-sm` 14px/20px y `text-xs` 12px/16px. `text-[13px]` es el tamaño de
  control de `src/ui` (botón `md`, input, select, textarea, ítems de menú). Otros: `text-lg` 18px,
  `text-base` 16px, `text-2xl` 24px. Tamaños arbitrarios en legacy: 10, 10.5, 11, 11.5, 12.5, 13.5,
  15, 17, 22 y 26px.
- **Interlineado**: el del token de Tailwind. En controles de `src/ui`, `leading-none`; en textos
  compuestos, `leading-snug`/`leading-normal`.
- **Usos comprobados**: el valor de `KpiCard` usa `font-head text-[26px] font-bold
  tracking-[-0.5px] tabular-nums`. Su etiqueta usa `text-[11.5px] font-semibold uppercase
  tracking-[0.2px] text-muted-foreground`. `CardTitle` usa `text-sm font-medium text-muted-foreground`.
  `CardDescription` usa `text-xs text-neutral-faint`.
- Las cifras de tablas y KPI usan `tabular-nums`.

Propuesta (no aplicada): en código nuevo, limitarse a 12, 13, 14, 16, 18 y 24px, y no usar
`font-black`.

## 4. Espaciados

Escala observada. Tailwind usa unidades de 4px: `N` = `N × 4px`.

| px | Utilidad | Usos típicos observados |
|---|---|---|
| 2 | `0.5` | `gap-0.5`, `mt-0.5` bajo valores de KPI |
| 4 | `1` | `p-1` del marco de `FramedCard`/`Dialog`, `mt-1`, `gap-1` |
| 6 | `1.5` | `gap-1.5` dentro de botones `src/ui` y encabezados de tarjeta |
| 8 | `2` | `gap-2` (el gap más usado), `py-2`, `p-2` |
| 10 | `2.5` | `px-2.5` de controles `src/ui`, `gap-2.5` |
| 12 | `3` | `p-3` del cuerpo de tarjeta `src/ui`, `gap-3`, `px-3` |
| 14 | `3.5` | `p-3.5` de columnas del tablero de visitas |
| 16 | `4` | `p-4` de `KpiCard`/`CustomPageContainer`, `px-4` del contenedor del catálogo en móvil |
| 20 | `5` | `p-5`, `mb-5` |
| 24 | `6` | `p-6`, `gap-6` entre bloques, `space-y-6` de `CustomPage` |
| 32 | `8` | `gap-8` entre secciones del catálogo |
| 40 | `10` | `mb-10` al pie de `CustomPage` |

- **Padding**: controles de 10–12px en horizontal; tarjetas de 12px (`src/ui`) o 16px (legacy).
- **Gap**: 8px entre controles vecinos; 12px entre campos; 24–32px entre bloques o secciones.
- **Margin**: poco usado. Se prefiere `gap`/`space-y` en contenedores flex/grid.
- Los valores arbitrarios (`[3px]`, `[7px]`, `[9px]`, `[11px]`, `[18px]`…) son excepciones de
  legacy. En código nuevo, usa la escala.

## 5. Componentes

Hay dos conjuntos con dimensiones distintas. **No los mezcles en la misma pantalla y no migres uno al
otro sin que se pida**. En una pantalla legacy, usa `components/ui`. En componentes nuevos del
sistema, usa `src/ui`.

### 5.1 Botones

| | `components/ui/button.tsx` (legacy) | `src/ui/button` |
|---|---|---|
| Variantes | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` | `primary`, `secondary`, `outline`, `ghost`, `destructive` |
| Alturas | `sm` 32px · `default` 36px · `lg` 40px · `icon` 36×36 (`icon-sm` 32, `icon-lg` 40) | `sm` 28px · `md` 32px (defecto) · `lg` 36px · `icon` 32×32 |
| Padding horizontal | 12 / 16 / 24px (menos con icono) | 10 / 10 / 14px |
| Texto | 14px, 500 | 12 / 13 / 14px, 500, `leading-none` |
| Radio | `rounded-md` 8px | `rounded-control` 10px |
| Gap icono | 8px (6px en `sm`), icono 16px | 6px, icono 16px |
| Borde | solo `outline`: 1px `border` + `shadow-xs` | solo `outline`: 1px `border-border` |
| Hover | `primary/90`, `primary-soft/80`, `accent` | `primary/90`; `secondary`: `muted` → `accent`; `outline`: borde `muted-foreground/40` |
| Active | — | `scale(0.98)` (desactivado con `motion-reduce`) |
| Focus-visible | borde `ring` + anillo 3px `ring/50` + contorno global | contorno global (§7) |
| Disabled | `opacity: .5`, sin eventos | igual |
| Error | `aria-invalid` → borde `danger` + anillo `danger/20` | — |
| Transición | `transition-all` | `color, background-color, border-color, transform` 150ms `ease-out-expo` |

Discrepancias: la variante `secondary` pinta `bg-primary-soft text-primary` en legacy y
`bg-muted text-foreground` en `src/ui`. La variante `destructive` pinta `bg-danger` con
`text-primary-foreground` en ambos (blanco en claro, `#101815` en oscuro); legacy además aclara el
relleno en oscuro (`dark:bg-danger/60`). Los nombres de variante (`secondary`, `destructive`) son API
de componente, no colores.

### 5.2 Inputs (input, textarea, select)

| | `components/ui/input.tsx` · `textarea` · `select` (legacy) | `src/ui/input` · `textarea` · `select` |
|---|---|---|
| Altura | 36px (select `sm` 32px); textarea mín. 64px | 32px; textarea mín. 80px |
| Padding | 12px horizontal, 4px vertical (textarea 8px) | 10px izquierda, 8px derecha (textarea 10px × 8px) |
| Texto | 16px en móvil, 14px desde `md` (768px) | 13px siempre |
| Fondo | transparente; oscuro `input/30` | `card` |
| Borde | 1px sólido `input` (alias de `border`) | 1px sólido `border` |
| Radio | 8px | 10px |
| Sombra | `shadow-xs`: `0 1px 2px 0 #0000000d` | `shadow-lift`: `0 4px 8px #121c180a`; ninguna en oscuro |
| Hover | — (select oscuro: `input/50`) | borde `muted-foreground/40` |
| Focus | borde `ring` + anillo 3px `ring/50` | borde `muted-foreground` + contorno global en `:focus-visible` |
| Disabled | `opacity: .5`, `cursor: not-allowed` | igual, sin cambio de borde en hover |
| Error | `aria-invalid` → borde `danger` + anillo `danger/20` | `aria-invalid` → borde `danger` |
| Placeholder | `muted-foreground` | `muted-foreground` |

En legacy, las etiquetas y los errores los pone `components/ui/field.tsx`: `FieldLabel` con
`htmlFor`, `FieldError` con `role="alert"` en `text-danger`. El envoltorio de react-hook-form
es `components/form/Form.tsx`.

### 5.3 Tarjetas y superficies

| Pieza | Clases observadas | Resultado |
|---|---|---|
| `src/ui/card` raíz | `rounded-row border border-border bg-card` | radio 14px, borde 1px, sin sombra |
| `src/ui/card` header / content / footer | `p-3 gap-1.5` · `px-3 pb-3 text-[13px]` · `border-t border-dashed px-3 py-2.5` | 12px; pie con divisor punteado |
| `src/ui/framed-card` | marco `rounded-card bg-neutral-frame p-1 ring-1 ring-inset ring-border` + `bg-stripes`; cuerpo `rounded-row border bg-card p-3` | marco 16px con trama, cuerpo 14px |
| Legacy `CustomPageContainer` | `bg-card rounded-xl p-4 shadow-sm border border-border` | radio 14px, sombra negra de Tailwind |
| Legacy tarjetas de módulo | `rounded-card border border-border bg-card p-3.5` (`VisitBoardColumn`) | radio 16px, borde 1px |
| Legacy alerta de formulario | `rounded-card border border-danger bg-danger-soft px-4 py-3 text-xs text-danger` | pareja de estado |

## 6. Elevación

Todas las sombras propias usan el color de `neutral-shade` (`#121c18`) con alfa en hex. Las
sombras arbitrarias de pantallas usan `shadow-[0_3px_0_var(--neutral-shade)]` más
`shadow-neutral-shade/NN`: nunca un color literal.

| Token | Valor completo | Uso observado |
|---|---|---|
| `shadow-control` | `0 1px 2px #121c180d` (≈5%) | Switch y selección de tabla (`src/ui`) |
| `shadow-lift` | `0 4px 8px #121c180a` (≈4%) | Inputs, select, textarea, search, user-menu (`src/ui`) |
| `shadow-tooltip` | `0 6px 16px #121c1838` (≈22%) | Definido, sin consumidores |
| `shadow-menu` | `0 16px 34px #121c182e` (≈18%) | Menús de cuenta y módulos (`layouts/AccountMenu`, `ModuleSwitcher`) |
| `shadow-popup` | `0 20px 25px -5px #121c181a, 0 8px 10px -6px #121c181a` (≈10%) | Dropdown, dialog, tooltip, toast, combo-box, selection-bar (`src/ui`) |
| `shadow-drawer` | `0 20px 50px #121c1873` (≈45%) | Sidebar legacy en modo drawer; se quita desde `lg` |
| `shadow-sticky` | `10px 0 12px -12px #121c1847` (≈28%) | Definido, sin consumidores |

Formato: desplazamiento x, desplazamiento y, desenfoque, expansión (si existe) y color. Las sombras
por defecto de Tailwind que usa legacy son negras: `shadow-xs` `0 1px 2px 0 #0000000d`, `shadow-sm`
`0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a`, `shadow-md` `0 4px 6px -1px #0000001a,
0 2px 4px -2px #0000001a`, `shadow-lg` `0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a` y
`shadow-xl` `0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a`.

Escala por capa:

| Capa | `src/ui` | Legacy |
|---|---|---|
| Superficie (tarjeta) | sin sombra, borde 1px | `shadow-sm` o sin sombra |
| Control | `shadow-lift` / `shadow-control` | `shadow-xs` |
| Menú / popover | `shadow-popup`, `bg-popover`, radio 14px | `shadow-menu` (layouts) · `shadow-md` (popover, select) |
| Tooltip | `shadow-popup`, `bg-popover`, borde | sin sombra, invertido `bg-foreground text-background` |
| Diálogo | `shadow-popup`, `bg-neutral-frame`, radio 16px, fondo `foreground/40` | `shadow-lg` (`alert-dialog`) · `shadow-xl` (`modalWrapper`), velo `bg-neutral-shade/50` |
| Drawer | — | `shadow-drawer` + velo `bg-neutral-shade/55` |

**Por tema**: en modo oscuro, `src/ui` quita las sombras (`dark:shadow-none`) y separa las capas
con borde y cambio de superficie (`card` `#17221e` sobre `background` `#101815`). Los tokens de sombra no se
redefinen en `.dark`.

## 7. Accesibilidad, adaptación y reglas de uso

### 7.1 Foco visible

- Una sola regla global: `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px }`.
  Es verde `#186653` en claro y `#4fb393` en oscuro. Se comprobó con teclado en el catálogo, en
  modo oscuro (input: contorno `#4fb393` de 2px).
- Prohibido `outline-none`, `outline-hidden` u `outline: none` sin un reemplazo equivalente. Hoy no
  hay ninguno en `client/src`.
- El anillo de 3px `ring/50` de legacy no alcanza 3:1 por sí solo (2.30:1 sobre blanco). El
  indicador válido es el contorno global.

### 7.2 Contraste medido (WCAG 2.2)

Umbrales: [1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) exige 4.5:1
para texto normal y 3:1 para texto grande (≥24px, o ≥18.66px en negrita).
[1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) exige 3:1 para lo que
hace falta para identificar un control o su estado. Los controles deshabilitados y los decorados
puramente decorativos están exentos. Valores calculados con la fórmula de luminancia relativa.
Estas mediciones no equivalen a una auditoría de conformidad de toda la app.

Cumplen (texto normal, ≥4.5:1):

| Pareja | Claro | Oscuro |
|---|---|---|
| `foreground` / `background` | 13.50 | 15.13 |
| `foreground` / `card` | 14.85 | 13.71 |
| `muted-foreground` / `card` | 5.34 | 6.61 |
| `muted-foreground` / `background` | 4.85 | 7.30 |
| `muted-foreground` / `muted` | 4.64 | 5.92 |
| `neutral-faint` / `card` | 4.79 | 5.66 |
| `primary-foreground` / `primary` | 6.85 | 7.05 |
| `primary` / `primary-soft` | 5.79 | 4.84 |
| `danger` / `card` | 5.69 | 5.29 |
| `primary-foreground` / `danger` (botón destructivo) | 5.69 | 5.83 |
| `warning` / `warning-soft` · `danger` / `danger-soft` · `info` / `info-soft` (solo claro) | 4.52 · 4.76 · 4.81 | — |
| `muted-foreground` / `neutral-soft` (badge neutro) | 4.51 | — |
| `primary-strong-foreground` / `primary-strong` (sidebar) | 13.98 | 13.98 |
| `primary-foreground` / `neutral-faint` (botón deshabilitado de perfiles) | 4.79 | — |

No cumplen. Todas son preexistentes y no se corrigieron: sería un cambio de identidad.

| Pareja | Ratio | Mínimo | Dónde puede aparecer |
|---|---|---|---|
| `neutral-faint` / `background` (claro) | 4.35 | 4.5 | texto terciario sobre el fondo de página |
| `neutral-faint` / `neutral-frame` (claro) | 4.16 | 4.5 | texto terciario dentro de un marco sin cuerpo blanco |
| `muted-foreground` / `accent` (claro) | 4.48 | 4.5 | texto secundario sobre el hover `accent` |
| `border` / `card`: `#e6e1d5` sobre `#ffffff` (claro) | 1.30 | 3 | borde de inputs: incumple 1.4.11 si es el único indicador del control |
| `border` / `card` (oscuro) | 1.77 | 3 | ídem en oscuro |
| hover `muted-foreground/40` / `card` (claro) | 1.75 | 3 | informativo: hover no exigido |
| `warning` / `warning-soft` (oscuro) | 1.95 | 4.5 | badge de advertencia dentro de `.dark` (el fondo suave no tiene valor oscuro) |

Propuesta (no aplicada): oscurecer `border` para los bordes de controles, o dar a los inputs un
indicador adicional que llegue a 3:1. Definir valores oscuros para `warning-soft`, `danger-soft`,
`info-soft` y `neutral-soft` antes de usar badges de estado en modo oscuro. Requiere decisión de diseño.

### 7.3 Etiquetas y estados

- Cada input lleva etiqueta visible asociada (`htmlFor`/`id` o control envuelto). Los botones de
  solo icono llevan `aria-label` (p. ej. cerrar diálogo: `aria-label="Cerrar"`).
- Un error se comunica con **color + texto**: borde `danger` más el mensaje de `FieldError`
  (`role="alert"`), más `aria-invalid` en el control. Nunca solo con el color del borde.
- Estados de badge/alerta: tono + icono o texto («Pendiente», «Stock bajo»). Nunca solo el color.
- Movimiento: `src/ui` usa `motion-reduce:transition-none`. Las animaciones `animate-bounce-gentle` y
  `animate-pulse-gentle` de `globals.css` (usadas en `NotFoundScreen`) son bucles infinitos sin
  variante para `prefers-reduced-motion` (preexistente).

### 7.4 Móvil y escritorio

- El escritorio empieza en `lg` (1024px = `DESKTOP_QUERY` en `WorkspaceLayout`). Por debajo, el
  sidebar es un drawer con velo (`bg-neutral-shade/55`) y `shadow-drawer`. Desde `lg`, el sidebar es
  estático y no tiene sombra.
- Contenedor del catálogo: `max-w-6xl`, `px-4` (16px) en móvil y `px-6` (24px) desde `sm`.
  Comprobado sin scroll horizontal a 390px de ancho.
- Los controles `src/ui` usan `touch-manipulation`. Sus alturas de 28–36px superan el mínimo
  de 24px de WCAG 2.5.8, pero quedan por debajo de los 44px habituales en táctil: en móvil, deja
  espacio entre controles vecinos.
- Los inputs `src/ui` usan 13px también en móvil. iOS amplía la vista al enfocar campos de menos de
  16px. Legacy evita esto con `text-base md:text-sm`. Discrepancia abierta.

### 7.5 Ejemplos

Permitido:

```tsx
<span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">Pendiente</span>
<div className="rounded-row border border-border bg-card p-3 text-card-foreground">…</div>
<Button variant="primary" size="md">Guardar</Button>
```

Prohibido:

```tsx
<span className="bg-warning text-warning-soft">…</span>
<div style={{ color: '#186653' }}>…</div>
<button className="outline-none">…</button>
<div className="bg-white border-gray-200 text-gray-900">…</div>
<span className="bg-green text-green-700">…</span>
```

Motivos, en orden: pareja invertida; hex fuera de `globals.css`; foco eliminado; paleta de Tailwind en
lugar de tokens; nombre de color en lugar de grupo (`green` no existe: es `primary`).
