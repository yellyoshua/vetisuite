import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, ShieldAlert, X } from "lucide-react";
import { F, T } from "@/lib/constants";
import type { Patient } from "@/lib/types";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block mb-3">
      <div style={{ fontSize: 11.5, fontWeight: 600, color: T.sub, marginBottom: 5, letterSpacing: 0.3, textTransform: "uppercase" }}>{label}</div>
      {children}
    </label>
  );
}

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  kind?: "primary" | "dark" | "ghost" | "danger" | "amber" | "wa";
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
    wa: { background: T.wa, color: "#fff", border: "1px solid transparent" },
  }[kind];
  return (
    <button
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

export function Modal({ title, onClose, children, width = 460 }: { title: string; onClose: () => void; children: ReactNode; width?: number }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(18,28,24,0.5)" }} onClick={onClose}>
      <div className="w-full shadow-2xl" style={{ background: T.card, borderRadius: 18, maxWidth: width, maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10" style={{ borderBottom: `1px solid ${T.line}`, background: T.card, borderRadius: "18px 18px 0 0" }}>
          <h3 style={{ fontFamily: F.head, fontSize: 16, fontWeight: 600, color: T.ink }}>{title}</h3>
          <button onClick={onClose} style={{ color: T.sub }}><X size={18} /></button>
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
