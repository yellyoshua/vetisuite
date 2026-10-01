import {
  CalendarDays,
  ChevronDown,
  EllipsisVertical,
  LayoutDashboard,
} from "lucide-react";
import PageHeader from "./page-header";

const outlineButtonClassName =
  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control border border-border bg-card px-2.5 text-[13px] leading-none font-medium text-muted-foreground transition-[color,border-color] duration-150 ease-out-expo hover:border-muted-foreground/40 hover:text-foreground motion-reduce:transition-none [&_svg]:size-4";

const iconButtonClassName =
  "inline-flex size-8 cursor-pointer items-center justify-center rounded-control border border-border bg-card text-muted-foreground transition-colors duration-150 ease-out-expo hover:text-foreground motion-reduce:transition-none [&_svg]:size-4";

export default function PageHeaderDemo() {
  return (
    <PageHeader
      breadcrumb={
        <nav aria-label="Ruta de navegación">
          <ol className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <a
                href="#inicio"
                className="flex items-center gap-1.5 hover:text-foreground"
              >
                <LayoutDashboard aria-hidden="true" className="size-4" />
                Inicio
              </a>
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true" className="text-neutral-faint">
                /
              </span>
              <span aria-current="page" className="font-medium text-foreground">
                Resumen
              </span>
            </li>
          </ol>
        </nav>
      }
      title="Buenos días, Laura"
      subtitle="Tienes 14 citas hoy y 4 pendientes de confirmar."
      actions={
        <>
          <button type="button" className={outlineButtonClassName}>
            <CalendarDays aria-hidden="true" />
            Esta semana
            <ChevronDown aria-hidden="true" />
          </button>
          <button
            type="button"
            className={iconButtonClassName}
            aria-label="Más acciones"
          >
            <EllipsisVertical aria-hidden="true" />
          </button>
        </>
      }
    />
  );
}
