# 09 · Componentes

## Propósito

Fija los componentes compartidos que usan todas las pantallas: las primitivas visuales de
`src/components/ui/`, los campos de formulario de `src/components/form/`, el marco de página
(`CustomPage`), la tabla paginada (`CustomTable`), los estados de carga y error (`PageState`), el
tooltip (`CustomTooltip`), el tema claro/oscuro y los toasts. Se usa en la **Fase 4**
(componentes), después de tener configuración, core, hooks y stores (fases 1 a 3), porque los campos
de formulario dependen de `useForm` ([05-hooks.md](05-hooks.md#useform)) y `CustomTable` de
`useQueryParams` ([05-hooks.md](05-hooks.md#usequeryparams)).

Los componentes de subida (`FormUploadAvatar`, `FormUploadFiles`) pertenecen a esta misma carpeta
pero se documentan en [11-subida-de-archivos.md](11-subida-de-archivos.md#formuploadavatar) y
[11-subida-de-archivos.md](11-subida-de-archivos.md#formuploadfiles), junto al flujo que los
sostiene.

## ui/

`src/components/ui/` contiene trece componentes. Son componentes de shadcn/ui **copiados a mano**:
el proyecto no usa la CLI de shadcn y no tiene `components.json`. Cada archivo es el fuente de
shadcn en JavaScript (JSX, sin tipos), con `cn` importado de `@/lib/utils`
([04-core.md](04-core.md#libutilsjs)) y las clases de Tailwind v4 que leen los tokens de
`globals.css` ([03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#globalscss)).

Por qué a mano y no con la CLI: la CLI escribe un `components.json`, decide rutas, alias y estilo, y
puede reescribir archivos existentes o `globals.css`. Copiar el fuente deja un solo lugar de verdad
(la carpeta) y hace que cada componente nuevo pase por una revisión explícita: qué primitiva trae y
qué dependencia suma.

Estos archivos conservan el estilo de shadcn (comillas dobles, `import * as React`, `data-slot`,
exports agrupados al final) y **no** siguen el estilo del resto de `src/`. No se reformatean: así un
diff contra el fuente de shadcn sigue siendo legible cuando haya que actualizarlos.

Dependencias que traen, todas declaradas en `package.json`
([03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#packagejson)):

| Componente | Primitiva / librería |
|---|---|
| `alert-dialog.jsx` | `@radix-ui/react-alert-dialog` (+ `buttonVariants` de `button.jsx`) |
| `avatar.jsx` | `@radix-ui/react-avatar` |
| `badge.jsx` | `@radix-ui/react-slot`, `class-variance-authority` |
| `button.jsx` | `@radix-ui/react-slot`, `class-variance-authority` |
| `calendar.jsx` | `react-day-picker`, `lucide-react` (+ `button.jsx`) |
| `field.jsx` | `class-variance-authority` (+ `label.jsx`, `separator.jsx`) |
| `input.jsx` | ninguna |
| `label.jsx` | `@radix-ui/react-label` |
| `popover.jsx` | `@radix-ui/react-popover` |
| `select.jsx` | `@radix-ui/react-select`, `lucide-react` |
| `separator.jsx` | `@radix-ui/react-separator` |
| `textarea.jsx` | ninguna |
| `tooltip.jsx` | `@radix-ui/react-tooltip` |

Las animaciones (`animate-in`, `fade-in-0`, `zoom-in-95`…) vienen de `tw-animate-css`, importado en
`globals.css`. `card`, `command` y `dialog` no forman parte del plan: solo los usaban piezas de
producto o piezas quitadas (ver la desviación de `Form.jsx` más abajo), y con ellos se van `cmdk` y
`@radix-ui/react-dialog`.

### Agregar un componente nuevo

1. Copia el fuente del componente desde la documentación de shadcn/ui, variante JavaScript.
2. Déjalo en `src/components/ui/<nombre>.jsx`, con el nombre en kebab-case que le da shadcn.
3. Ajusta los imports al estilo de la carpeta: `cn` desde `@/lib/utils`, los demás componentes
   desde `@/components/ui/<nombre>`.
4. Instala **solo** su primitiva Radix (o la librería que pida), con versión exacta, en
   `client/package.json`. Nada de paquetes paraguas.
5. Repórtalo como patrón y dependencia nuevos, para aprobar, antes de usarlo en una pantalla.

### alert-dialog.jsx

Path: `src/components/ui/alert-dialog.jsx`.

```jsx
import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function AlertDialog({
  ...props
}) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
  ...props
}) {
  return (<AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />);
}

function AlertDialogPortal({
  ...props
}) {
  return (<AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />);
}

function AlertDialogOverlay({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props} />
  );
}

function AlertDialogContent({
  className,
  ...props
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props} />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props} />
  );
}

function AlertDialogFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props} />
  );
}

function AlertDialogTitle({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props} />
  );
}

function AlertDialogDescription({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />
  );
}

function AlertDialogAction({
  className,
  ...props
}) {
  return (<AlertDialogPrimitive.Action className={cn(buttonVariants(), className)} {...props} />);
}

function AlertDialogCancel({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props} />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
```

Lo usa el diálogo de confirmación global ([06-stores.md](06-stores.md#confirmationdialog)).
`AlertDialogAction` y `AlertDialogCancel` se pintan con `buttonVariants`, así que heredan las
variantes de `button.jsx` sin duplicar clases.

### avatar.jsx

Path: `src/components/ui/avatar.jsx`.

```jsx
import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  size = "default",
  ...props
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6",
        className
      )}
      {...props} />
  );
}

function AvatarImage({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props} />
  );
}

function AvatarFallback({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full text-sm group-data-[size=sm]/avatar:text-xs",
        className
      )}
      {...props} />
  );
}

function AvatarBadge({
  className,
  ...props
}) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full ring-2 select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props} />
  );
}

function AvatarGroup({
  className,
  ...props
}) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "*:data-[slot=avatar]:ring-background group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2",
        className
      )}
      {...props} />
  );
}

function AvatarGroupCount({
  className,
  ...props
}) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "bg-muted text-muted-foreground ring-background relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm ring-2 group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      {...props} />
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
}
```

`AvatarFallback` se muestra mientras la imagen carga o si falla: por eso las pantallas siempre le
pasan iniciales (`getInitials`, [04-core.md](04-core.md#libutilsjs)) o un ícono.

### badge.jsx

Path: `src/components/ui/badge.jsx`.

```jsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
```

### button.jsx

Path: `src/components/ui/button.jsx`.

```jsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
```

Los tamaños `icon`, `icon-sm` e `icon-lg` son los que usan los botones de acción de las tablas, el
botón de volver de `CustomPage` y los de subida. `asChild` (vía `Slot`) permite pintar un `<span>` o
un `<Link>` con aspecto de botón sin anidar botones.

### calendar.jsx

Path: `src/components/ui/calendar.jsx`.

```jsx
import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("flex gap-4 flex-col md:flex-row relative", defaultClassNames.months),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn("absolute bg-popover inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn("select-none font-medium", captionLayout === "label"
          ? "text-sm"
          : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5", defaultClassNames.caption_label),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn("select-none w-(--cell-size)", defaultClassNames.week_number_header),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md"
            : "[&:first-child[data-selected=true]_button]:rounded-l-md",
          defaultClassNames.day
        ),
        range_start: cn("rounded-l-md bg-accent", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (<div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />);
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (<ChevronLeftIcon className={cn("size-4", className)} {...props} />);
          }

          if (orientation === "right") {
            return (<ChevronRightIcon className={cn("size-4", className)} {...props} />);
          }

          return (<ChevronDownIcon className={cn("size-4", className)} {...props} />);
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div
                className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props} />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props} />
  );
}

export { Calendar, CalendarDayButton }
```

Lo usa `FormInputDatePicker` dentro de un `Popover`.

### field.jsx

Path: `src/components/ui/field.jsx`.

```jsx
import { useMemo } from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

function FieldSet({
  className,
  ...props
}) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-6",
        "has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className
      )}
      {...props} />
  );
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-3 font-medium",
        "data-[variant=legend]:text-base",
        "data-[variant=label]:text-sm",
        className
      )}
      {...props} />
  );
}

function FieldGroup({
  className,
  ...props
}) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
        className
      )}
      {...props} />
  );
}

const fieldVariants = cva("group/field flex w-full gap-3 data-[invalid=true]:text-destructive", {
  variants: {
    orientation: {
      vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
      horizontal: [
        "flex-row items-center",
        "[&>[data-slot=field-label]]:flex-auto",
        "has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      ],
      responsive: [
        "flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto",
        "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
        "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      ],
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

function Field({
  className,
  orientation = "vertical",
  ...props
}) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props} />
  );
}

function FieldContent({
  className,
  ...props
}) {
  return (
    <div
      data-slot="field-content"
      className={cn("group/field-content flex flex-1 flex-col gap-1.5 leading-snug", className)}
      {...props} />
  );
}

function FieldLabel({
  className,
  ...props
}) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4",
        "has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10",
        className
      )}
      {...props} />
  );
}

function FieldTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50",
        className
      )}
      {...props} />
  );
}

function FieldDescription({
  className,
  ...props
}) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-muted-foreground text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance",
        "last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props} />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className
      )}
      {...props}>
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
          data-slot="field-separator-content">
          {children}
        </span>
      )}
    </div>
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map((error, index) =>
          error?.message && <li key={index}>{error.message}</li>)}
      </ul>
    );
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-destructive text-sm font-normal", className)}
      {...props}>
      {content}
    </div>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
```

Es la base de todos los campos de formulario: `Field` recibe `data-invalid` y tiñe el bloque,
`FieldLabel` asocia la etiqueta, `FieldDescription` pinta la ayuda y `FieldError` acepta tanto
`children` (un mensaje propio) como `errors` (el arreglo de errores de react-hook-form, deduplicado
por mensaje).

### input.jsx

Path: `src/components/ui/input.jsx`.

```jsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props} />
  );
}

export { Input }
```

### label.jsx

Path: `src/components/ui/label.jsx`.

```jsx
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props} />
  );
}

export { Label }
```

### popover.jsx

Path: `src/components/ui/popover.jsx`.

```jsx
import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

function Popover({
  ...props
}) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props} />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
```

### select.jsx

Path: `src/components/ui/select.jsx`.

```jsx
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({
  ...props
}) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        {...props}>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn("p-1", position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1")}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props} />
  );
}

function SelectItem({
  className,
  children,
  ...props
}) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}>
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props} />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}>
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}>
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
```

### separator.jsx

Path: `src/components/ui/separator.jsx`.

```jsx
import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props} />
  );
}

export { Separator }
```

### textarea.jsx

Path: `src/components/ui/textarea.jsx`.

```jsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props} />
  );
}

export { Textarea }
```

### tooltip.jsx

Path: `src/components/ui/tooltip.jsx`.

```jsx
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}) {
  return (<TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />);
}

function Tooltip({
  ...props
}) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}>
        {children}
        <TooltipPrimitive.Arrow
          className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

`Tooltip` envuelve su propio `TooltipProvider`: por eso la app no monta un provider global en
`App.jsx` y cada tooltip funciona aislado.

## Formularios

Path: `src/components/form/Form.jsx`.

```jsx
import {useController} from 'react-hook-form';
import {useState} from 'react';
import {ChevronDownIcon} from 'lucide-react';
import {Field, FieldDescription, FieldError, FieldLabel} from '@/components/ui/field';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {Calendar} from '@/components/ui/calendar';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';

export default function Form ({children, onSubmit, ...props}) {
  return (
    <form onSubmit={onSubmit} {...props}>{children}</form>
  );
}

export function FormInput ({control, name, label, description, placeholder, labelClassName, inputClassName, ...props}) {
  const {field, fieldState} = useController({name, control});

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={name} className={labelClassName}>{label}</FieldLabel>
      <Input
        {...field}
        {...props}
        id={name}
        placeholder={placeholder}
        aria-invalid={fieldState.invalid}
        autoComplete="off"
        className={inputClassName}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
    </Field>
  );
}

export function FormTextarea ({control, name, label, description, placeholder, labelClassName, inputClassName, ...props}) {
  const {field, fieldState} = useController({name, control});

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={name} className={labelClassName}>{label}</FieldLabel>
      <Textarea {...field} {...props} id={name} placeholder={placeholder} aria-invalid={fieldState.invalid} className={inputClassName}/>
      {description && <FieldDescription>{description}</FieldDescription>}
      {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
    </Field>
  );
}

export function FormInputSelect ({control, name, label, description, placeholder, options, labelClassName, className, ...props}) {
  const {field, fieldState} = useController({name, control});

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={name} className={labelClassName}>{label}</FieldLabel>
      <Select value={field.value ?? undefined} onValueChange={field.onChange} {...props}>
        <SelectTrigger id={name} aria-invalid={fieldState.invalid} className={className || 'w-full'}>
          <SelectValue placeholder={placeholder}/>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
    </Field>
  );
}

function toDateOnly (date) {
  const pad = (value) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateOnly (value) {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = String(value).split('-').map(Number);

  return new Date(year, month - 1, day);
}

function toFieldValue (date, isDateOnly) {
  if (!date) {
    return null;
  }

  return isDateOnly ? toDateOnly(date) : date;
}

export function FormInputDatePicker ({control, name, label, valueFormat}) {
  const [open, setOpen] = useState(false);
  const isDateOnly = valueFormat === 'date';
  const {field, fieldState} = useController({name, control, defaultValue: isDateOnly ? null : new Date()});
  const selectedDate = isDateOnly ? parseDateOnly(field.value) : field.value;

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={name} className="px-1">
        {label}
      </Label>
      <Field data-invalid={fieldState.invalid}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id={name}
              className="w-full justify-between font-normal"
            >
              {selectedDate ? new Date(selectedDate).toLocaleDateString() || '' : 'Seleccionar fecha'}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              captionLayout="dropdown"
              className="w-full"
              onSelect={(date) => {
                field.onChange(toFieldValue(date, isDateOnly));
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
      </Field>
    </div>
  );
}

export {FormUploadAvatar} from './FormUploadAvatar';
export {FormUploadFiles} from './FormUploadFiles';
```

Cada campo se usa con el `control` que devuelve `useForm`
([05-hooks.md](05-hooks.md#useform)) y un `name` que coincide con una clave del schema Zod. Todos
leen su estado con `useController`, así que no hay `register` ni `ref` manuales en las pantallas:

```jsx
<Form onSubmit={form.handleSubmit} className="space-y-6">
  <FormInput control={form.control} name="name" label="Nombre" placeholder="Nombre" />
</Form>
```

Decisiones:

- **`Form` es un `<form>` sin lógica.** El envío, la validación y los toasts viven en `useForm`; el
  componente solo existe para que todas las pantallas importen el formulario desde el mismo lugar.
- **El error se pinta desde `fieldState`.** `useForm` vuelca en los campos tanto los errores de Zod
  como los que devuelve el servidor en `fields` (`applyServerFieldErrors`,
  [05-hooks.md](05-hooks.md#useform)); cada campo los muestra con `FieldError` sin código extra.
- **`FormInput` pasa `...props` al `<input>`.** Así `type="email"`, `type="number"` o `disabled`
  llegan al elemento nativo. `autoComplete="off"` va después de `...props` y no se puede pisar.
- **`FormInputSelect` pasa `field.value ?? undefined` a `Select`.** Radix solo muestra el
  placeholder cuando el valor es `undefined`; un valor por defecto `null` del formulario no coincide
  con ningún ítem y dejaba el trigger vacío en vez de mostrar el placeholder.
- **En `FormInputSelect`, `id` y `aria-invalid` van en `SelectTrigger`, no en `Select`.** El `Select`
  de Radix es un Root que no pinta DOM: el `id` puesto ahí se descarta, el `htmlFor` de la etiqueta
  queda apuntando a nada y el combobox se queda sin nombre accesible.
- **`FormInputDatePicker` tiene dos formatos de valor.** Con `valueFormat="date"` el campo emite y
  consume `"YYYY-MM-DD"` armado con partes locales (`toDateOnly`/`parseDateOnly`), sin el corrimiento
  de zona que produce serializar un `Date` a UTC; sin la prop, trabaja con objetos `Date`.
- **`toFieldValue` protege la deselección.** Con `mode="single"`, react-day-picker envía `undefined`
  cuando se vuelve a tocar el día ya elegido; sin el guard, `toDateOnly(undefined)` lanzaba y
  tumbaba el formulario entero. El campo queda en `null`.
- **Los componentes de subida se re-exportan desde `Form.jsx`.** Las pantallas importan
  `FormUploadAvatar` y `FormUploadFiles` junto con el resto de los campos
  (`import Form, {FormInput, FormUploadAvatar} from '@/components/form/Form'`). Su código está en
  [11-subida-de-archivos.md](11-subida-de-archivos.md#formuploadavatar) y
  [11-subida-de-archivos.md](11-subida-de-archivos.md#formuploadfiles).

Recorte respecto del origen: el origen exporta además `FormInputMultiSelect` y re-exporta
`FormInputRadioCards` y `FormKeyValueEditor`. Se quitan: el primero solo lo usa producto y los otros
dos no los usa nadie. Con `FormInputMultiSelect` se van sus imports (`Badge`, `command`, `twMerge` y
los íconos `Check`, `ChevronsUpDown`, `X`); `useState` se queda porque lo usa
`FormInputDatePicker`.

## FormPermissionsEditor

Path: `src/components/form/FormPermissionsEditor.jsx`.

```jsx
import {useFieldArray, useController, useFormState} from 'react-hook-form';
import {PlusIcon, Trash2Icon} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';

function PermissionRow ({control, index, onRemove, error}) {
  const {field} = useController({
    name: `permissions.${index}`,
    control,
    defaultValue: ''
  });

  return (
    <div className="space-y-1">
      <div className="flex gap-2 items-center">
        <Input
          {...field}
          value={field.value || ''}
          placeholder="rol::modulo::general"
          className="font-mono text-sm flex-1"
          autoComplete="off"
          aria-label={`Permiso ${index + 1}`}
          aria-invalid={Boolean(error)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          aria-label="Eliminar permiso"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive cursor-pointer"
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </div>
      {error && error.message && (
        <p className="text-sm font-medium text-destructive">{error.message}</p>
      )}
    </div>
  );
}

export function FormPermissionsEditor ({control, name = 'permissions', label = 'Permisos', description}) {
  const {fields, append, remove} = useFieldArray({control, name});
  const {errors} = useFormState({control});
  const permissionsErrors = errors && errors[name];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium">{label}</label>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append('')}
          className="gap-1 text-xs cursor-pointer"
        >
          <PlusIcon className="h-3 w-3" />
          Agregar permiso
        </Button>
      </div>

      {fields.length > 0 && (
        <div className="space-y-2">
          {fields.map((item, index) => {
            const rowError = permissionsErrors && permissionsErrors[index];

            return (
              <PermissionRow
                key={item.id}
                control={control}
                index={index}
                onRemove={remove}
                error={rowError}
              />
            );
          })}
        </div>
      )}

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          Sin permisos asignados. Haz clic en &quot;Agregar permiso&quot; para añadir uno.
        </p>
      )}
    </div>
  );
}

export default FormPermissionsEditor;
```

Edita una lista de identificadores de permiso (`rol::modulo::general`) como un arreglo de strings.
Lo usan las pantallas de edición de permisos de la gestión de cuentas
([08-modulos.md](08-modulos.md#gestión-de-cuentas)). Uso:

```jsx
<FormPermissionsEditor
  control={form.control}
  name="permissions"
  label="Permisos del miembro"
  description="Define los identificadores de permisos con formato rol::modulo::general"
/>
```

El schema de esa pantalla valida cada elemento con una expresión regular sobre los roles del
destino (`^(superadmin|member)::[a-z0-9-]+::general$`), así que un identificador mal escrito se marca
en su fila antes de llegar al servidor.

Decisiones:

- **`useFieldArray` para la lista.** Cada fila tiene un `key` estable (`item.id`) que pone
  react-hook-form; usar el índice como key haría que al borrar una fila el foco y los valores
  saltaran a la siguiente.
- **Cada fila es su propio `useController`.** Así cada input se suscribe solo a su valor y el
  error se pinta en la fila que falla (`errors[name][index]`), leído con `useFormState`.
- **El botón de agregar es `type="button"`.** Dentro de un `<form>`, un botón sin tipo envía el
  formulario.
- **Se exporta con nombre y por defecto.** Las pantallas lo importan por defecto; el export con
  nombre queda para quien prefiera importarlo junto a otros.
- **`PermissionRow` registra `permissions.${index}` fijo.** No usa la prop `name` del editor: el
  editor solo funciona con `name="permissions"`, que es el valor por defecto y el único que usan las
  pantallas. Si el destino necesita otro nombre, se reporta como cambio; no se corrige al portar.

## CustomPage

Path: `src/components/CustomPage/CustomPage.jsx`.

```jsx
import {twMerge} from 'tailwind-merge';
import {useNavigate} from 'react-router';
import {ArrowLeftIcon} from 'lucide-react';
import {Button} from '../ui/button';

export default function CustomPage ({className, children, title, description, goBack = false, goBackPath, actions}) {
  const navigate = useNavigate();

  return (
    <div className={twMerge('space-y-6 mb-10', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        </div>
        <div className="flex gap-2 justify-end items-center">
          {actions && <div className="flex min-w-0 flex-1 gap-2 justify-end items-center sm:flex-none">{actions}</div>}
          {(goBack || goBackPath) && <Button
            variant="destructive" size="icon-lg" aria-label="Regresar"
            className="cursor-pointer shrink-0"
            onClick={() => navigate(goBackPath ?? -1)}>
            <ArrowLeftIcon className="text-white" />
          </Button>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function CustomPageContainer ({children, className = ''}) {
  return (
    <div className={twMerge('bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  );
}
```

Es el marco de toda pantalla del panel: título, descripción, zona de acciones a la derecha y el
botón de volver. `CustomPageContainer` es la tarjeta que agrupa contenido dentro de la página.

- **`goBackPath` gana sobre `goBack`.** Con `goBackPath` se navega a una ruta fija (por ejemplo,
  del formulario de edición al detalle); con solo `goBack` se usa `navigate(-1)`. Una ruta fija es
  preferible cuando se puede llegar a la pantalla por URL directa, porque el historial puede estar
  vacío o apuntar fuera de la app.
- **`actions` recibe nodos, no configuración.** Cada pantalla pone sus botones o enlaces; el marco
  solo los alinea.
- **`className` se mezcla con `twMerge`.** Una pantalla puede cambiar espaciados sin duplicar las
  clases base.

## CustomTable

Path: `src/components/CustomTable/CustomTable.jsx`.

```jsx
import {twMerge} from 'tailwind-merge';

export default function CustomTable ({children, dataSize = 0, currentPage = 1, nextPage, prevPage}) {
  const page = Number(currentPage) || 1;

  if (dataSize === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No se encontraron datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">{children}</table>
        </div>
      </div>

      <nav aria-label="Paginación" className="flex justify-between items-center">
        <button
          type="button"
          onClick={prevPage}
          disabled={page === 1}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Anterior
        </button>
        <span aria-live="polite" className="text-sm text-gray-600 dark:text-gray-400">
          Página {page}
        </span>
        <button
          type="button"
          onClick={nextPage}
          disabled={dataSize < 10}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Siguiente
        </button>
      </nav>
    </>
  );
}

CustomTable.Thead = function Thead ({children}) {
  return (
    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
      {children}
    </thead>
  );
};

CustomTable.TableRow = function TableRow ({children, header = false}) {
  if (header) {
    return <tr>{children}</tr>;
  }

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      {children}
    </tr>
  );
};

CustomTable.TheadItem = function TheadItem ({children, className}) {
  return (
    <th scope="col" className={twMerge('px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider', className)}>
      {children}
    </th>
  );
};

CustomTable.TBody = function TBody ({children}) {
  return (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {children}
    </tbody>
  );
};

CustomTable.TBodyItem = function TBodyItem ({children, className, type}) {
  if (type === 'actions') {
    return (
      <td className="px-6 py-4 gap-2 flex justify-end whitespace-nowrap text-right text-sm font-medium">
        {children}
      </td>
    );
  }

  return (
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={twMerge('text-sm font-normal text-gray-900 dark:text-white', className)}>
        {children}
      </span>
    </td>
  );
};
```

Tabla con paginación "anterior / siguiente" para los listados. Se compone con sus subcomponentes
estáticos (`CustomTable.Thead`, `CustomTable.TableRow`, `CustomTable.TheadItem`, `CustomTable.TBody`,
`CustomTable.TBodyItem`) y se alimenta con `useQueryParams`
([05-hooks.md](05-hooks.md#usequeryparams)):

```jsx
<CustomTable dataSize={items.length} currentPage={query.page} nextPage={nextPage} prevPage={prevPage}>
  <CustomTable.Thead>
    <CustomTable.TableRow header>
      <CustomTable.TheadItem>Nombre</CustomTable.TheadItem>
      <CustomTable.TheadItem className="text-right">Acciones</CustomTable.TheadItem>
    </CustomTable.TableRow>
  </CustomTable.Thead>
  <CustomTable.TBody>
    {items.map((item) => (
      <CustomTable.TableRow key={item.id}>
        <CustomTable.TBodyItem>{item.name}</CustomTable.TBodyItem>
        <CustomTable.TBodyItem type="actions">{null}</CustomTable.TBodyItem>
      </CustomTable.TableRow>
    ))}
  </CustomTable.TBody>
</CustomTable>
```

El listado completo del recurso de ejemplo está en [13-templates.md](13-templates.md#listado).

- **`Number(currentPage) || 1`.** `currentPage` llega del query string vía
  `useQueryParams().query`, que devuelve todo como string. Comparado a secas, `"1" === 1` nunca era
  verdadero y el botón "Anterior" quedaba habilitado en la primera página.
- **"Siguiente" se deshabilita con `dataSize < 10`.** El API devuelve 10 filas por página cuando no se
  pide otro `limit`: si llegaron menos, no hay página siguiente. El número está fijo en el componente; si el destino pagina con otro
  tamaño, ese valor tiene que coincidir con el del API.
- **Sin filas no hay tabla ni paginación.** Con `dataSize === 0` pinta un único aviso.
- **`<nav aria-label="Paginación">` y `aria-live` en el número de página.** El lector de pantalla
  anuncia el cambio de página sin mover el foco.

## PageState

Path: `src/components/PageState/PageState.jsx`.

```jsx
export function PageLoading () {
  return (
    <output aria-live="polite" className="flex items-center justify-center py-16">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent dark:border-gray-600 dark:border-t-transparent" />
      <span className="sr-only">Cargando…</span>
    </output>
  );
}

export function PageError ({message}) {
  return (
    <div role="alert" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
      <p className="text-red-800 dark:text-red-400">Error: {message}</p>
    </div>
  );
}
```

Los dos estados que pinta cada `page.jsx` mientras `useResolver` trabaja
([05-hooks.md](05-hooks.md#useresolver)). No hay render en el servidor: cada pantalla pide sus datos
al montar y necesita mostrar algo mientras la respuesta viaja. Vive en un solo archivo para no
repetir el mismo bloque en todas las pantallas. La forma de uso está en
[08-modulos.md](08-modulos.md#pagejsx-y-resolversjs).

- **`PageLoading` usa `<output aria-live="polite">`** con un texto `sr-only`: el spinner es
  decorativo y el lector de pantalla anuncia "Cargando…".
- **`PageError` usa `role="alert"`** para que el error se anuncie al aparecer.

## CustomTooltip

Path: `src/components/CustomTooltip/CustomTooltip.jsx`.

```jsx
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip';

export default function CustomTooltip ({children, content, side}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}
```

Atajo sobre `ui/tooltip.jsx` para el caso de todas las tablas: un texto sobre un botón de acción.
`TooltipTrigger asChild` hace que el trigger sea el propio hijo, sin un `<button>` extra. El tooltip
no reemplaza el nombre accesible: el botón de ícono lleva además su `aria-label`.

```jsx
<CustomTooltip content="Editar">
  <Button variant="outline" size="icon" aria-label={`Editar ${item.name}`}>
    <PencilIcon className="w-4 h-4" />
  </Button>
</CustomTooltip>
```

## Tema

Path: `src/components/theme-provider.jsx`.

```jsx
import {ThemeProvider as NextThemesProvider} from 'next-themes';

export default function ThemeProvider ({children, ...props}) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}
```

Envoltorio de `next-themes`. Se monta en la raíz de `App.jsx`
([07-rutas-y-sesion.md](07-rutas-y-sesion.md#appjsx)) así:

Extracto de `App.jsx` (solo la apertura del provider):

```jsx
<ThemeProvider attribute="class" enableSystem={true}>
```

- **`attribute="class"`.** `next-themes` pone la clase `dark` en `<html>` cuando el tema es oscuro.
- **`enableSystem`.** Sin elección guardada, sigue la preferencia del sistema operativo. La elección
  del usuario la persiste `next-themes` en `localStorage`; no pasa por Zustand.
- **La variante `dark` de Tailwind se define en `globals.css`** con
  `@custom-variant dark (&:is(.dark *));` ([03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#globalscss)).
  Tailwind v4 usa por defecto `prefers-color-scheme`; esta línea la ata a la clase que pone
  `next-themes`, así el selector manual y el tema del sistema pintan igual.
- **El selector de tema vive en el `Header` de cada rol**
  ([07-rutas-y-sesion.md](07-rutas-y-sesion.md#layouts-por-rol)), con
  `useTheme()` y `setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')`.

## Toasts

Los toasts son de `sonner`. El `<Toaster />` se monta una sola vez en `App.jsx`
([07-rutas-y-sesion.md](07-rutas-y-sesion.md#appjsx)), dentro del `ThemeProvider`.

Extracto de `App.jsx` (solo los imports y el elemento del `Toaster`; el archivo completo está en 07):

```jsx
import {Toaster} from 'sonner';
import {CheckCircleIcon, InfoIcon, TriangleAlertIcon, XCircleIcon} from 'lucide-react';

<Toaster position="top-right" closeButton={true} icons={{
  success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
  error: <XCircleIcon className="w-5 h-5 text-red-500" />,
  warning: <TriangleAlertIcon className="w-5 h-5 text-yellow-500" />,
  info: <InfoIcon className="w-5 h-5 text-blue-500" />
}} duration={5000} richColors={true} />
```

Quién dispara toasts:

| Origen | Cuándo |
|---|---|
| `useForm` ([05-hooks.md](05-hooks.md#useform)) | `toast.success(successMessage)` al enviar bien; `toast.error(message)` al fallar. `disableToast` apaga ambos. |
| `useMutation` ([05-hooks.md](05-hooks.md#usemutation)) | Igual que `useForm`, para acciones sin formulario (deshabilitar una cuenta, cerrar sesión). |
| `useNotifications` (opcional, [05-hooks.md](05-hooks.md#usenotifications-opcional)) | `toast.info(title, {description})` por cada notificación nueva. |

Las pantallas no llaman a `toast` directamente: el mensaje de éxito se pasa como `successMessage` y
el de error llega del servidor. Así todos los avisos tienen la misma forma y un solo lugar donde
cambiarla.

## Reglas de uso

- **Antes de escribir un componente visual, busca en `ui/`.** Si no está, sigue el procedimiento de
  "Agregar un componente nuevo" y repórtalo; no escribas un botón, un input o un popover propios.
- **No edites los `ui/` para una pantalla.** Pasa `className` (se mezcla con `cn`) o usa una
  variante existente. Cambiar el archivo cambia todas las pantallas.
- **No instales paquetes paraguas de Radix ni la CLI de shadcn.** Una primitiva exacta por
  componente.
- **Todo campo de formulario usa un `Form*` con `control`.** Un `<input>` suelto no recibe los
  errores del servidor ni el estado de envío.
- **No agregues un `Form*` para un solo formulario.** Si un campo lo usa una sola pantalla, vive en
  el `components/` de esa pantalla; sube a `components/form/` cuando lo usan dos.
- **Toda pantalla del panel empieza con `CustomPage`** y usa `PageLoading`/`PageError` para los
  estados de `useResolver`. Sin esto cada pantalla inventa su propio encabezado y su propio spinner.
- **Los listados usan `CustomTable` con `useQueryParams`.** La página vive en la URL, no en estado
  local: recargar o compartir el enlace conserva la página.
- **Los botones de ícono llevan `aria-label`** aunque tengan `CustomTooltip`.
- **No llames a `toast` desde una pantalla.** Usa `successMessage` en `useForm`/`useMutation`.
- **No uses `dark:` con otra estrategia.** El tema depende de la clase `dark` que pone
  `next-themes`; un `@media (prefers-color-scheme)` propio se desincroniza del selector manual.

## Checklist del ejecutor

- [ ] Los trece archivos de `src/components/ui/` están copiados sin cambios de estilo.
- [ ] No existe `components.json` ni se usó la CLI de shadcn.
- [ ] `package.json` declara cada primitiva Radix de la tabla con versión exacta, más
      `class-variance-authority`, `react-day-picker`, `lucide-react`, `clsx`, `tailwind-merge`,
      `sonner`, `next-themes` y `tw-animate-css`.
- [ ] No hay `ui/card.jsx`, `ui/command.jsx` ni `ui/dialog.jsx`, ni `cmdk` ni `@radix-ui/react-dialog`.
- [ ] `Form.jsx` exporta `Form`, `FormInput`, `FormTextarea`, `FormInputSelect`, `FormInputDatePicker`
      y re-exporta `FormUploadAvatar` y `FormUploadFiles`; nada más.
- [ ] `FormPermissionsEditor.jsx` está copiado completo y el schema de permisos del destino usa sus
      roles.
- [ ] `CustomPage`, `CustomTable`, `PageState` y `CustomTooltip` están en sus carpetas PascalCase.
- [ ] El tamaño de página del API coincide con el `10` de `CustomTable`.
- [ ] `App.jsx` monta `ThemeProvider` con `attribute="class"` y `enableSystem`, y el `Toaster`
      dentro.
- [ ] `globals.css` tiene `@custom-variant dark (&:is(.dark *));`.
- [ ] Ninguna pantalla importa `toast` de `sonner`.
