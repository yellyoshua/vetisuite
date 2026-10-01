import { Download, ListFilter, Plus, Users } from "lucide-react";
import Toolbar from "./toolbar";

const outlineButtonClassName =
  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control border border-border bg-card px-2.5 text-[13px] leading-none font-medium text-muted-foreground transition-[color,border-color] duration-150 ease-out-expo hover:border-muted-foreground/40 hover:text-foreground motion-reduce:transition-none [&_svg]:size-4";

const primaryButtonClassName =
  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control bg-primary px-2.5 text-[13px] leading-none font-medium text-primary-foreground transition-colors duration-150 ease-out-expo hover:bg-primary/90 motion-reduce:transition-none [&_svg]:size-4";

export default function ToolbarDemo() {
  return (
    <div className="overflow-hidden rounded-row border border-border">
      <Toolbar
        start={
          <nav aria-label="Ruta de navegación">
            <ol className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <a
                  href="#tutores"
                  className="flex items-center gap-1.5 hover:text-foreground"
                >
                  <Users aria-hidden="true" className="size-4" />
                  Tutores
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-neutral-faint">
                  /
                </span>
                <span
                  aria-current="page"
                  className="font-medium text-foreground"
                >
                  Pacientes
                </span>
              </li>
            </ol>
          </nav>
        }
        end={
          <>
            <button type="button" className={outlineButtonClassName}>
              <ListFilter aria-hidden="true" />
              Filtrar
            </button>
            <button type="button" className={outlineButtonClassName}>
              <Download aria-hidden="true" />
              Exportar
            </button>
            <button type="button" className={primaryButtonClassName}>
              <Plus aria-hidden="true" />
              Nuevo paciente
            </button>
          </>
        }
        className="border-b-0"
      />
    </div>
  );
}
