import type { CSSProperties } from "react";
import { Dog, Cat, Bird, type LucideIcon } from "lucide-react";
import type { BusinessArea, MedicalRecord, Product, ServiceType, Visit } from "./types";

/* Design tokens — los hex viven en el bloque @theme de src/index.css.
   Aquí solo se referencian: mismo color para estilos inline (T.x) y para
   utilidades Tailwind (bg-green, text-sub, border-line…). */
export const T = {
  bg: "var(--color-bg)", card: "var(--color-card)", line: "var(--color-line)", lineSoft: "var(--color-line-soft)",
  ink: "var(--color-ink)", sub: "var(--color-sub)",
  green: "var(--color-green)", greenSoft: "var(--color-green-soft)", dark: "var(--color-dark)", darkHover: "var(--color-dark-hover)",
  amber: "var(--color-amber)", amberSoft: "var(--color-amber-soft)",
  red: "var(--color-red)", redSoft: "var(--color-red-soft)",
  blue: "var(--color-blue)", blueSoft: "var(--color-blue-soft)",
  /* Neutrales auxiliares */
  input: "var(--color-input)", track: "var(--color-track)", skeleton: "var(--color-skeleton)",
  optHover: "var(--color-opt-hover)", dropdownFoot: "var(--color-dropdown-foot)",
  done: "var(--color-done)", graySoft: "var(--color-gray-soft)", scrollThumb: "var(--color-scroll-thumb)",
};

export const F = { head: "var(--font-head)", body: "var(--font-body)" };

export const inputStyle: CSSProperties = {
  border: `1px solid ${T.line}`, borderRadius: 10, padding: "9px 12px", fontSize: 14,
  width: "100%", background: T.input, color: T.ink, fontFamily: F.body,
};

export const uid = () => Math.random().toString(36).slice(2, 9);
export const money = (n: number) => "$" + n.toFixed(2);
export const round2 = (n: number) => Math.round(n * 100) / 100; // fuente única de la matemática de dinero
export const IVA_RATE = 0.15; // Ecuador 2024+ — parametrizable si hay multipaís
export const PAY_METHODS = ["Efectivo", "Tarjeta", "Transferencia"] as const;

/* Kanban por tipo de servicio. La última columna = terminado (facturable). */
export const SERVICE_FLOWS: Record<ServiceType, { label: string; columns: string[] }> = {
  veterinaria: { label: "Veterinaria", columns: ["en espera", "en consulta", "terminado"] },
  peluqueria: { label: "Peluquería", columns: ["pendiente", "en proceso", "terminado"] },
  laboratorio: { label: "Laboratorio", columns: ["solicitado", "en proceso", "resultado"] },
  medicamento: { label: "Medicamento", columns: ["pendiente", "aplicado"] },
  vacuna: { label: "Vacuna", columns: ["pendiente", "aplicado"] },
};
export const isServiceDone = (type: ServiceType, status: string) => {
  const cols = SERVICE_FLOWS[type].columns;
  return status === cols[cols.length - 1];
};

/* Área de negocio de cada tipo de servicio. Fuente única: la usan el badge de
   la factura y la agrupación de Finanzas. `SERVICE_FLOWS[t].label` es rótulo de
   kanban, NO área — por eso no se agrupa por él. */
export const SERVICE_AREA: Record<ServiceType, BusinessArea> = {
  veterinaria: "Clínica", medicamento: "Clínica", vacuna: "Clínica",
  peluqueria: "Peluquería", laboratorio: "Laboratorio",
};

/* Visita abierta = aún no facturada. Facturar no la borra: la cierra. */
export const isOpenVisit = (v: Visit) => !v.invoiceId;

/* La consulta "activa" es la del día: sobre ella se cuelgan insumos y recetas.
   Un expediente de hace semanas no vuelve a recibir cargos de hoy. */
export const isActiveRecord = (r: MedicalRecord) =>
  new Date(r.date).toDateString() === new Date().toDateString();
export const daysUntil = (dateStr: string) => Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);

/* Caducidad e inventario mínimo: predicados compartidos por catálogo, ficha,
   dashboard y el buscador de insumos clínicos. Cambiar el criterio aquí lo
   cambia en los cuatro sitios. */
export const EXPIRY_SOON_DAYS = 60;
export type ExpiryState = "sin-fecha" | "caducado" | "por-caducar" | "vigente";
export const expiryState = (expiry: string): ExpiryState => {
  const days = daysUntil(expiry);
  if (!expiry || Number.isNaN(days)) return "sin-fecha";
  if (days < 0) return "caducado";
  if (days <= EXPIRY_SOON_DAYS) return "por-caducar";
  return "vigente";
};
/* Texto del estado con días SIEMPRE positivos ("caduca en 12 días" / "vencido hace 27 días"). */
export const expiryLabel = (expiry: string) => {
  const days = daysUntil(expiry);
  switch (expiryState(expiry)) {
    case "sin-fecha": return "Sin fecha de caducidad";
    case "caducado": return `Vencido hace ${Math.abs(days)} día${Math.abs(days) === 1 ? "" : "s"}`;
    case "por-caducar": return days === 0 ? "Caduca hoy" : `Caduca en ${days} día${days === 1 ? "" : "s"}`;
    case "vigente": return `Caduca en ${days} días`;
  }
};
export const isExpiring = (p: Product) => expiryState(p.expiry) === "por-caducar";
export const isExpired = (p: Product) => expiryState(p.expiry) === "caducado";
export const isLowStock = (p: Product) => p.stock <= p.minStock;

/* Catálogo único de categorías: lo consumen el filtro del catálogo y el formulario. */
export const PRODUCT_CATEGORIES = ["Vacunas", "Medicamentos", "Estética", "Alimentos", "Insumos"] as const;
export const todayLabel = new Date().toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" });

export const CONSULT_FEE = 25;
export const GROOMERS = ["Sofía", "David", "Paola"] as const;
export const GROOM_SERVICES: Record<string, number> = {
  "Baño completo": 18, "Corte + baño": 28, "Corte de uñas": 6, "Limpieza dental estética": 20, "Guardería (día)": 15,
};
export const LAB_TESTS: Record<string, number> = {
  "Hemograma completo": 22, "Química sanguínea": 35, "Raspado de piel": 15, "Coprológico": 10, "Ecografía": 40, "Radiografía": 35,
};
/* Los horarios de la agenda ya no son fijos: salen de la disponibilidad de la
   clínica (`lib/availability.ts`, `slotsForDate`). */
export const SPECIES_ICON: Record<string, LucideIcon> = { Perro: Dog, Gato: Cat, Ave: Bird };

/* Portales públicos: cada clínica se sirve en su propio subdominio.
   ponytail: subdominio fijo en la demo — vendrá del tenant cuando haya backend. */
export const CLINIC_DOMAIN = "clinica-a.vetisuite.com";
export const portalUrl = (slug: string) => `${CLINIC_DOMAIN}/p/${slug}`;
export const slugify = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita tildes: "clínica" → "clinica"
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
export const DEFAULT_PALETTE = { primary: "#186653", accent: "#C9A227", bg: "#FFFFFF" };
/* Orden explícito de los colores del portal: iterar Object.values(palette) haría
   que reordenar el tipo cambiara los swatches de sitio en silencio. */
export const PALETTE_FIELDS = [
  { key: "primary", label: "Color principal" },
  { key: "accent", label: "Color de acento" },
  { key: "bg", label: "Fondo" },
] as const;
