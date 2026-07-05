import { NavLink } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, Menu, PawPrint, X } from "lucide-react";
import { F, MODULES, T } from "../lib/constants";
import { useVetStore } from "../states/app.state";

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const openAccounts = useVetStore((s) => s.accounts.length);
  return (
    <>
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
          <NavLink key={m.path} to={m.path} end={m.path === "/"} title={m.label} onClick={onNavigate}
            className={`w-full flex items-center gap-3 mb-1 transition-colors relative ${collapsed ? "justify-center" : "text-left"}`}
            style={({ isActive }) => ({
              padding: collapsed ? "11px 0" : "9px 12px", borderRadius: 10, fontSize: 13.5, fontFamily: F.body,
              background: isActive ? "rgba(255,255,255,0.11)" : "transparent",
              color: isActive ? "#fff" : "rgba(255,255,255,0.62)", fontWeight: isActive ? 600 : 400,
            })}>
            <m.icon size={17} className="shrink-0" />
            {!collapsed && <span className="flex-1">{m.label}</span>}
            {m.path === "/billing" && openAccounts > 0 && (
              collapsed
                ? <span className="absolute" style={{ top: 7, right: 12, width: 8, height: 8, borderRadius: 99, background: T.amber }} />
                : <span style={{ background: T.amber, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "1px 7px" }}>{openAccounts}</span>
            )}
          </NavLink>
        ))}
      </nav>
      {!collapsed && (
        <div className="mx-4 mb-3 p-3" style={{ background: "rgba(255,255,255,0.07)", borderRadius: 12, fontSize: 11, lineHeight: 1.5, color: "rgba(255,255,255,0.6)" }}>
          <b style={{ color: "#fff" }}>Demo MVP</b> · datos de ejemplo. Búsqueda y paginación simulan la API del backend.
        </div>
      )}
    </>
  );
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside className="hidden lg:flex flex-col shrink-0" style={{ width: collapsed ? 72 : 232, background: T.dark, color: "#fff", transition: "width .22s ease" }}>
      <SidebarContent collapsed={collapsed} />
      <button onClick={onToggle} title={collapsed ? "Expandir menú" : "Minimizar menú"}
        className={`flex items-center justify-center gap-2 mb-5 py-2.5 ${collapsed ? "mx-2" : "mx-3"}`}
        style={{ borderRadius: 10, color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.06)", fontSize: 12.5 }}>
        {collapsed ? <ChevronsRight size={16} /> : <><ChevronsLeft size={16} /> Minimizar</>}
      </button>
    </aside>
  );
}

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={`lg:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div className="absolute inset-0 transition-opacity" style={{ background: "rgba(18,28,24,0.55)", opacity: open ? 1 : 0 }} onClick={onClose} />
      <aside className="absolute inset-y-0 left-0 flex flex-col shadow-2xl transition-transform"
        style={{ width: 262, maxWidth: "82vw", background: T.dark, color: "#fff", transform: open ? "translateX(0)" : "translateX(-102%)" }}>
        <button onClick={onClose} aria-label="Cerrar menú" className="absolute" style={{ top: 20, right: 14, color: "rgba(255,255,255,0.7)" }}><X size={18} /></button>
        <SidebarContent collapsed={false} onNavigate={onClose} />
      </aside>
    </div>
  );
}

export function MobileTopBar({ onMenu, moduleLabel }: { onMenu: () => void; moduleLabel: string }) {
  return (
    <div className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 shrink-0" style={{ height: 54, background: T.card, borderBottom: `1px solid ${T.line}` }}>
      <button onClick={onMenu} aria-label="Abrir menú" style={{ color: T.ink }}><Menu size={20} /></button>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center" style={{ width: 26, height: 26, borderRadius: 8, background: T.dark, color: "#fff" }}>
          <PawPrint size={14} />
        </div>
        <span style={{ fontFamily: F.head, fontWeight: 700, fontSize: 14 }}>Veti Suite</span>
      </div>
      <span className="ml-auto truncate" style={{ fontSize: 12, color: T.sub }}>{moduleLabel}</span>
    </div>
  );
}
