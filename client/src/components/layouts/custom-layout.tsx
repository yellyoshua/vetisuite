import { useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  CalendarDays, ChevronsLeft, ChevronsRight, ClipboardList, FlaskConical, Globe,
  LayoutDashboard, Menu, Package, PawPrint, Receipt, Scissors, Users, Wallet, X,
} from "lucide-react";
import { F, isOpenVisit, T } from "@/lib/constants";
import { useVetStore } from "@/states/app.state";

/* ================================================================
   CÁSCARA DE LA APLICACIÓN — todo lo que envuelve a las rutas:
   sidebar de escritorio, drawer y barra superior móviles y contenedor
   del contenido. Las notificaciones no viven aquí: el provider de
   toasts se monta junto a `<App />` (`components/toast`).

   Es un único componente a propósito: el archivo se lee de arriba a
   abajo y no exporta nada más. El menú vive aquí quemado en código
   porque solo lo usa esta cáscara; `T` y `F` sí se importan, son los
   tokens de diseño de toda la app (los hex viven en `index.css`).
================================================================ */

const MODULES = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/clients", label: "Clientes y Pacientes", icon: Users },
  { path: "/appointments", label: "Citas", icon: CalendarDays },
  { path: "/visits", label: "Visitas", icon: ClipboardList },
  { path: "/grooming", label: "Peluquería y Estética", icon: Scissors },
  { path: "/clinic", label: "Clínica y Laboratorio", icon: FlaskConical },
  { path: "/inventory", label: "Inventario", icon: Package },
  { path: "/billing", label: "Facturación", icon: Receipt },
  { path: "/finance", label: "Finanzas", icon: Wallet },
  { path: "/portals", label: "Portales", icon: Globe },
];

/* Rótulo de la barra móvil. No es el menú: la disponibilidad tiene ruta base
   propia pero no fila en el sidebar (es configuración, no área de trabajo). */
const PAGE_LABELS = [...MODULES, { path: "/appointments-clinics", label: "Disponibilidad de la clínica" }];
const matchesPath = (pathname: string, path: string) => pathname === path || pathname.startsWith(path + "/");

export function CustomLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const location = useLocation();
  const openVisits = useVetStore((s) => s.visits.filter(isOpenVisit).length);
  const moduleLabel = (PAGE_LABELS.find((m) => m.path !== "/" && matchesPath(location.pathname, m.path)) || MODULES[0]).label;

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ height: "100dvh", background: T.bg, fontFamily: F.body, color: T.ink }}>

      {/* SIDEBAR — escritorio */}
      <aside className="hidden lg:flex flex-col shrink-0" style={{ width: collapsed ? 72 : 232, background: T.dark, color: "#fff", transition: "width .22s ease" }}>
        <div className={`flex items-center gap-2 pt-6 pb-5 ${collapsed ? "justify-center px-2" : "px-5"}`}>
          <div className="flex items-center justify-center shrink-0" style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.12)" }}>
            <PawPrint size={18} />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontFamily: F.head, fontWeight: 700, fontSize: 15, letterSpacing: -0.2 }}>Veti Suite</div>
              <div style={{ fontSize: 10.5, opacity: 0.55 }}>Sistema clínico integral</div>
            </div>
          )}
        </div>
        <nav className={`flex-1 overflow-y-auto ${collapsed ? "px-2" : "px-3"}`}>
          {MODULES.map((m) => (
            <NavLink key={m.path} to={m.path} end={m.path === "/"} title={m.label}
              className={`w-full flex items-center gap-3 mb-1 transition-colors relative ${collapsed ? "justify-center" : "text-left"}`}
              style={({ isActive }) => ({
                padding: collapsed ? "11px 0" : "9px 12px", borderRadius: 10, fontSize: 13.5, fontFamily: F.body,
                background: isActive ? "rgba(255,255,255,0.11)" : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.62)", fontWeight: isActive ? 600 : 400,
              })}>
              <m.icon size={17} className="shrink-0" />
              {!collapsed && <span className="flex-1">{m.label}</span>}
              {m.path === "/visits" && openVisits > 0 && (
                collapsed
                  ? <span className="absolute" style={{ top: 7, right: 12, width: 8, height: 8, borderRadius: 99, background: T.amber }} />
                  : <span style={{ background: T.amber, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "1px 7px" }}>{openVisits}</span>
              )}
            </NavLink>
          ))}
        </nav>
        {!collapsed && (
          <div className="mx-4 mb-3 p-3" style={{ background: "rgba(255,255,255,0.07)", borderRadius: 12, fontSize: 11, lineHeight: 1.5, color: "rgba(255,255,255,0.6)" }}>
            <b style={{ color: "#fff" }}>Demo MVP</b> · datos de ejemplo. Búsqueda y paginación simulan la API del backend.
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expandir menú" : "Minimizar menú"}
          className={`flex items-center justify-center gap-2 mb-5 py-2.5 ${collapsed ? "mx-2" : "mx-3"}`}
          style={{ borderRadius: 10, color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.06)", fontSize: 12.5 }}>
          {collapsed ? <ChevronsRight size={16} /> : <><ChevronsLeft size={16} /> Minimizar</>}
        </button>
      </aside>

      {/* DRAWER — móvil */}
      <div className={`lg:hidden fixed inset-0 z-50 ${drawer ? "" : "pointer-events-none"}`}>
        <div className="absolute inset-0 transition-opacity" style={{ background: "rgba(18,28,24,0.55)", opacity: drawer ? 1 : 0 }} onClick={() => setDrawer(false)} />
        <aside className="absolute inset-y-0 left-0 flex flex-col shadow-2xl transition-transform"
          style={{ width: 262, maxWidth: "82vw", background: T.dark, color: "#fff", transform: drawer ? "translateX(0)" : "translateX(-102%)" }}>
          <button onClick={() => setDrawer(false)} aria-label="Cerrar menú" className="absolute" style={{ top: 20, right: 14, color: "rgba(255,255,255,0.7)" }}>
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 pt-6 pb-5 px-5">
            <div className="flex items-center justify-center shrink-0" style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.12)" }}>
              <PawPrint size={18} />
            </div>
            <div>
              <div style={{ fontFamily: F.head, fontWeight: 700, fontSize: 15, letterSpacing: -0.2 }}>Veti Suite</div>
              <div style={{ fontSize: 10.5, opacity: 0.55 }}>Sistema clínico integral</div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto px-3">
            {MODULES.map((m) => (
              <NavLink key={m.path} to={m.path} end={m.path === "/"} title={m.label} onClick={() => setDrawer(false)}
                className="w-full flex items-center gap-3 mb-1 transition-colors relative text-left"
                style={({ isActive }) => ({
                  padding: "9px 12px", borderRadius: 10, fontSize: 13.5, fontFamily: F.body,
                  background: isActive ? "rgba(255,255,255,0.11)" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.62)", fontWeight: isActive ? 600 : 400,
                })}>
                <m.icon size={17} className="shrink-0" />
                <span className="flex-1">{m.label}</span>
                {m.path === "/visits" && openVisits > 0 && (
                  <span style={{ background: T.amber, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "1px 7px" }}>{openVisits}</span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="mx-4 mb-3 p-3" style={{ background: "rgba(255,255,255,0.07)", borderRadius: 12, fontSize: 11, lineHeight: 1.5, color: "rgba(255,255,255,0.6)" }}>
            <b style={{ color: "#fff" }}>Demo MVP</b> · datos de ejemplo. Búsqueda y paginación simulan la API del backend.
          </div>
        </aside>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 shrink-0" style={{ height: 54, background: T.card, borderBottom: `1px solid ${T.line}` }}>
          <button onClick={() => setDrawer(true)} aria-label="Abrir menú" style={{ color: T.ink }}><Menu size={20} /></button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center" style={{ width: 26, height: 26, borderRadius: 8, background: T.dark, color: "#fff" }}>
              <PawPrint size={14} />
            </div>
            <span style={{ fontFamily: F.head, fontWeight: 700, fontSize: 14 }}>Veti Suite</span>
          </div>
          <span className="ml-auto truncate" style={{ fontSize: 12, color: T.sub }}>{moduleLabel}</span>
        </div>
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
