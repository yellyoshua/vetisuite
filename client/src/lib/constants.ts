import type { CSSProperties } from "react";
import { Dog, Cat, Bird, type LucideIcon } from "lucide-react";
import type { ServiceType } from "./types";

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
  wa: "var(--color-wa)",
  /* Neutrales auxiliares */
  input: "var(--color-input)", track: "var(--color-track)", skeleton: "var(--color-skeleton)",
  optHover: "var(--color-opt-hover)", dropdownFoot: "var(--color-dropdown-foot)",
  done: "var(--color-done)", graySoft: "var(--color-gray-soft)", scrollThumb: "var(--color-scroll-thumb)",
};

export const F = { head: "var(--font-head)", body: "var(--font-body)" };

export const inputStyle: CSSProperties = {
  border: `1px solid ${T.line}`, borderRadius: 10, padding: "9px 12px", fontSize: 14,
  width: "100%", background: T.input, color: T.ink, outline: "none", fontFamily: F.body,
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
// ponytail: click-to-chat deep link, sin WhatsApp Business API (needs backend).
// ponytail: country code EC (593) hardcoded — parametrizar si hay multipaís.
export const waLink = (phone: string, text: string) =>
  `https://wa.me/593${phone.replace(/\D/g, "").replace(/^0/, "")}?text=${encodeURIComponent(text)}`;
export const daysUntil = (dateStr: string) => Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
export const todayLabel = new Date().toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" });

export const CONSULT_FEE = 25;
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
