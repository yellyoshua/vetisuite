import { useEffect, useId, useRef, useState, type CSSProperties, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, ShieldAlert, X } from "lucide-react";
import { F, T, inputStyle } from "@/lib/constants";
import type { Patient } from "@/lib/types";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block mb-3">
      <div style={{ fontSize: 11.5, fontWeight: 600, color: T.sub, marginBottom: 5, letterSpacing: 0.3, textTransform: "uppercase" }}>{label}</div>
      {children}
    </label>
  );
}

/* Controles de formulario: el estilo base vive en `inputStyle` (lib/constants).
   `style` propio se fusiona encima, así que los ajustes puntuales de ancho o
   padding siguen siendo posibles sin volver a escribir el estilo entero. */
/* `inputStyle` fija `background` y `color`, así que pisa el estilo nativo de
   `:disabled`. El atenuado se aplica aquí, con el mismo tratamiento que `Btn`. */
const disabledStyle = { opacity: 0.5, cursor: "not-allowed" } as const;

export function Input({ style, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...(props.disabled ? disabledStyle : null), ...style }} />;
}

export function Select({ style, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...inputStyle, ...(props.disabled ? disabledStyle : null), ...style }} />;
}

export function DateInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <Input type="date" {...props} />;
}

/* Avatar cuadrado de iniciales o icono — la marca visual de cada fila y ficha. */
export function Avatar({ children, size = 40, style }: { children: ReactNode; size?: number; style?: CSSProperties }) {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{ width: size, height: size, borderRadius: 12, background: T.greenSoft, color: T.green, fontFamily: F.head, fontWeight: 700, fontSize: Math.round(size * 0.375), ...style }}
    >
      {children}
    </div>
  );
}

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  kind?: "primary" | "dark" | "ghost" | "danger" | "amber";
  small?: boolean;
  disabled?: boolean;
  full?: boolean;
}
export function Btn({ children, onClick, kind = "primary", small, disabled, full }: BtnProps) {
  const styles = {
    primary: { background: T.green, color: "#fff", border: "1px solid transparent" },
    dark: { background: T.dark, color: "#fff", border: "1px solid transparent" },
    ghost: { background: "transparent", color: T.ink, border: `1px solid ${T.line}` },
    danger: { background: T.redSoft, color: T.red, border: "1px solid transparent" },
    amber: { background: T.amberSoft, color: T.amber, border: "1px solid transparent" },
  }[kind];
  return (
    <button
      type="button"
      onClick={onClick} disabled={disabled}
      className="inline-flex items-center justify-center gap-1 font-medium transition-opacity"
      style={{
        ...styles, borderRadius: 10, fontFamily: F.body, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, fontSize: small ? 12.5 : 13.5,
        padding: small ? "6px 10px" : "9px 15px", width: full ? "100%" : undefined,
      }}
    >
      {children}
    </button>
  );
}

export function Badge({ tone = "green", children }: { tone?: "green" | "amber" | "red" | "blue" | "gray"; children: ReactNode }) {
  const m = {
    green: [T.greenSoft, T.green], amber: [T.amberSoft, T.amber], red: [T.redSoft, T.red],
    blue: [T.blueSoft, T.blue], gray: [T.graySoft, T.sub],
  }[tone];
  return (
    <span className="inline-flex items-center gap-1" style={{ background: m[0], color: m[1], fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 999 }}>
      {children}
    </span>
  );
}

export function Card({ children, className = "", style = {} }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={className} style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 16, ...style }}>
      {children}
    </div>
  );
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({ title, onClose, children, width = 460 }: { title: string; onClose: () => void; children: ReactNode; width?: number }) {
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  // `onClose` por ref: el efecto se monta una sola vez aunque el padre pase una
  // lambda nueva en cada render (si dependiera de ella, robaría el foco al teclear).
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; });
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close.current(); return; }
      if (e.key !== "Tab" || !dialog.current) return;
      const items = [...dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); opener?.focus(); };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(18,28,24,0.5)" }} onClick={onClose}>
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId}
        className="w-full shadow-2xl" style={{ background: T.card, borderRadius: 18, maxWidth: width, maxHeight: "88vh", overflowY: "auto", overscrollBehavior: "contain" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10" style={{ borderBottom: `1px solid ${T.line}`, background: T.card, borderRadius: "18px 18px 0 0" }}>
          <h3 id={titleId} style={{ fontFamily: F.head, fontSize: 16, fontWeight: 600, color: T.ink }}>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Cerrar" style={{ color: T.sub }}><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Elapsed({ since }: { since: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const s = Math.max(0, Math.floor((now - since) / 1000));
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{String(Math.floor(s / 60)).padStart(2, "0")}:{String(s % 60).padStart(2, "0")}</span>;
}

export function PatientAlerts({ patient, small }: { patient: Patient; small?: boolean }) {
  return (
    <span className="inline-flex gap-1 flex-wrap">
      {patient.aggressive && <Badge tone="red"><ShieldAlert size={11} /> Agresivo</Badge>}
      {patient.allergies.map((a) => <Badge key={a} tone="amber"><AlertTriangle size={11} /> {small ? "Alergia" : a}</Badge>)}
    </span>
  );
}

export function Spinner({ size = 14 }: { size?: number }) {
  return <span className="shrink-0" style={{ width: size, height: size, border: `2px solid ${T.line}`, borderTopColor: T.green, borderRadius: 99, display: "inline-block", animation: "vsSpin .7s linear infinite" }} />;
}

export function Pager({ page, total, pageSize, onPage }: { page: number; total: number; pageSize: number; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap mt-3">
      <span style={{ fontSize: 11.5, color: T.sub }}>Mostrando {from}–{to} de {total}</span>
      <div className="flex gap-1.5">
        <Btn small kind="ghost" disabled={page === 0} onClick={() => onPage(page - 1)}><ChevronLeft size={13} /> Anterior</Btn>
        <Btn small kind="ghost" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>Siguiente <ChevronRight size={13} /></Btn>
      </div>
    </div>
  );
}
