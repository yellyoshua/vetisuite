import {
  Calendar,
  FlaskConical,
  LayoutDashboard,
  Package,
  PawPrint,
  Receipt,
  Scissors,
  Search,
  Settings,
  Users,
} from "lucide-react";
import Sidebar from "./sidebar";

const sections = [
  {
    items: [
      {
        label: "Inicio",
        href: "#inicio",
        icon: <LayoutDashboard />,
        active: true,
      },
    ],
  },
  {
    label: "Atención",
    items: [
      { label: "Tutores", href: "#tutores", icon: <Users /> },
      { label: "Pacientes", href: "#pacientes", icon: <PawPrint /> },
      {
        label: "Citas",
        href: "#citas",
        icon: <Calendar />,
        children: [
          { label: "Agenda del día", href: "#citas-hoy" },
          { label: "Pendientes", href: "#citas-pendientes", badge: "4" },
          { label: "Canceladas", href: "#citas-canceladas" },
        ],
      },
      { label: "Peluquería", href: "#peluqueria", icon: <Scissors /> },
      {
        label: "Laboratorio",
        href: "#laboratorio",
        icon: <FlaskConical />,
        disabled: true,
        badge: "Pronto",
      },
    ],
  },
  {
    label: "Gestión",
    items: [
      { label: "Inventario", href: "#inventario", icon: <Package /> },
      { label: "Facturación", href: "#facturacion", icon: <Receipt /> },
      {
        label: "Configuración",
        href: "#configuracion",
        icon: <Settings />,
        children: [
          { label: "Horarios", href: "#horarios" },
          { label: "Equipo", href: "#equipo" },
        ],
      },
    ],
  },
];

export default function SidebarDemo() {
  return (
    <div className="flex h-[560px] overflow-hidden rounded-card border border-border bg-background">
      <Sidebar
        sections={sections}
        header={
          <span className="min-w-0 truncate px-1 text-sm font-medium text-foreground">
            Clínica Central
          </span>
        }
        search={
          <label className="flex h-8 items-center gap-2 rounded-control border border-border bg-card pr-2 pl-2.5 focus-within:border-muted-foreground">
            <Search
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
            <span className="sr-only">Buscar en el menú</span>
            <input
              type="search"
              placeholder="Buscar"
              className="min-w-0 flex-1 bg-transparent text-[13px] placeholder:text-muted-foreground"
            />
          </label>
        }
        footer={
          <div className="flex items-center gap-2 rounded-card border border-border bg-card py-2 pr-2.5 pl-2">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium"
            >
              LM
            </span>
            <span className="flex min-w-0 flex-col gap-1 leading-none">
              <span className="truncate text-sm font-medium">Laura Méndez</span>
              <span className="truncate text-xs text-neutral-faint">
                laura@clinicacentral.vet
              </span>
            </span>
          </div>
        }
      />
      <div className="flex-1 p-3 text-sm text-muted-foreground">
        Contenido de la página
      </div>
    </div>
  );
}
