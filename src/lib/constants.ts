import type { CSSProperties } from "react";
import {
  LayoutDashboard, Users, CalendarDays, Scissors, FlaskConical, Package, Receipt,
  Dog, Cat, Bird, type LucideIcon,
} from "lucide-react";

/* Design tokens */
export const T = {
  bg: "#F6F4EE", card: "#FFFFFF", line: "#E6E1D5", lineSoft: "#EFEBE1",
  ink: "#1E2A26", sub: "#6C7A72",
  green: "#186653", greenSoft: "#E2EFE9", dark: "#14312A", darkHover: "#1C4038",
  amber: "#B07314", amberSoft: "#FBF0DA",
  red: "#B3402F", redSoft: "#F9E7E3",
  blue: "#2C6E8F", blueSoft: "#E4EFF4",
  wa: "#1D8F5B",
};

export const F = { head: "'Sora', sans-serif", body: "'Inter', system-ui, sans-serif" };

export const inputStyle: CSSProperties = {
  border: `1px solid ${T.line}`, borderRadius: 10, padding: "9px 12px", fontSize: 14,
  width: "100%", background: "#FCFBF8", color: T.ink, outline: "none", fontFamily: F.body,
};

export const uid = () => Math.random().toString(36).slice(2, 9);
export const money = (n: number) => "$" + n.toFixed(2);
export const daysUntil = (dateStr: string) => Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
export const todayLabel = new Date().toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" });

export const CONSULT_FEE = 25;
export const GROOM_SERVICES: Record<string, number> = {
  "Baño completo": 18, "Corte + baño": 28, "Corte de uñas": 6, "Limpieza dental estética": 20, "Guardería (día)": 15,
};
export const LAB_TESTS: Record<string, number> = {
  "Hemograma completo": 22, "Química sanguínea": 35, "Raspado de piel": 15, "Coprológico": 10, "Ecografía": 40, "Radiografía": 35,
};
export const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
export const SPECIES_ICON: Record<string, LucideIcon> = { Perro: Dog, Gato: Cat, Ave: Bird };

export const MODULES = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/clients", label: "Clientes y Pacientes", icon: Users },
  { path: "/appointments", label: "Citas", icon: CalendarDays },
  { path: "/grooming", label: "Peluquería y Estética", icon: Scissors },
  { path: "/clinic", label: "Clínica y Laboratorio", icon: FlaskConical },
  { path: "/inventory", label: "Inventario", icon: Package },
  { path: "/billing", label: "Facturación", icon: Receipt },
];
