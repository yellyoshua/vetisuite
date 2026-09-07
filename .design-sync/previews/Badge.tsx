import { Badge } from "client";
import { AlertTriangle, ShieldAlert } from "lucide-react";

/** Los cinco tonos. El fondo es siempre el `*Soft` y el texto el tono fuerte. */
export function Tonos() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge tone="green">Confirmada</Badge>
      <Badge tone="amber">Pendiente</Badge>
      <Badge tone="red">Deuda $45.50</Badge>
      <Badge tone="blue">En proceso</Badge>
      <Badge tone="gray">Cancelada</Badge>
    </div>
  );
}

/** Mapa exacto de estados de cita (DESIGN.md §7). */
export function EstadosDeCita() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge tone="amber">pendiente</Badge>
      <Badge tone="green">confirmada</Badge>
      <Badge tone="blue">completada</Badge>
      <Badge tone="gray">cancelada</Badge>
    </div>
  );
}

/** Kanban de peluquería y estados de laboratorio. */
export function EstadosDeServicio() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge tone="amber">pendiente</Badge>
        <Badge tone="blue">proceso</Badge>
        <Badge tone="green">terminado</Badge>
        <Badge tone="gray">entregado</Badge>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge tone="amber">solicitado</Badge>
        <Badge tone="green">resultado</Badge>
      </div>
    </div>
  );
}

/** Con icono lucide a 11px — el único tamaño de icono dentro de un badge. */
export function ConIcono() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge tone="red"><ShieldAlert size={11} /> Agresivo</Badge>
      <Badge tone="amber"><AlertTriangle size={11} /> Penicilina</Badge>
      <Badge tone="green">Clínica</Badge>
    </div>
  );
}
