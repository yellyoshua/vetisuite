import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Pencil, Receipt } from "lucide-react";
import { SERVICE_FLOWS, F, isServiceDone, money, T } from "@/lib/constants";
import type { ServiceType } from "@/lib/types";
import { useVetStore } from "@/states/app.state";
import { Badge, Btn, Card } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { InfoGrid } from "@/components/info-grid";
import { ResourceNotFound } from "@/components/resource-not-found";

const TYPE_TONE: Record<ServiceType, "green" | "blue" | "amber" | "gray"> = {
  veterinaria: "green", peluqueria: "blue", laboratorio: "amber", medicamento: "gray", vacuna: "gray",
};

/* Visita comenzada: cada servicio avanza en su kanban (en su módulo si lo tiene). Cuando todos terminan, se factura. */
export default function VisitShowPage() {
  const { id } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const visit = s.visits.find((v) => v.id === id);
  if (!visit) return <ResourceNotFound backTo="/visits" label="la visita" />;
  const client = s.clients.find((c) => c.id === visit.clientId)!;
  const svcs = s.services.filter((x) => x.visitId === visit.id);
  const subtotal = svcs.reduce((t, x) => t + x.price, 0);
  const pending = svcs.filter((x) => !isServiceDone(x.type, x.status)).length;
  const billed = !!visit.invoiceId;
  const ready = svcs.length > 0 && pending === 0 && !billed;

  return (
    <CustomPage goBack backTo="/visits" title={`Visita · ${client.name}`} description="Avanza cada servicio en su kanban. Cuando todos terminen, factura."
      actions={billed
        ? <Btn kind="ghost" onClick={() => navigate(`/billing/show/${visit.invoiceId}`)}><Receipt size={14} /> Ver factura</Btn>
        : <Btn kind="ghost" onClick={() => navigate(`/visits/edit/${visit.id}`)}><Pencil size={14} /> Editar</Btn>}>
      {billed && (
        <Card className="p-4 mb-4" style={{ borderColor: T.green }}>
          <p style={{ fontSize: 13, color: T.ink }}>
            <b>Visita facturada.</b> Queda en solo lectura como historial de la atención.
          </p>
        </Card>
      )}
      <Card className="p-5 mb-4">
        <InfoGrid items={[
          { label: "Cliente", value: client.name },
          { label: "Teléfono", value: client.phone },
          { label: "Saldo anterior", value: <span style={{ color: client.debt > 0 ? T.red : T.ink }}>{money(client.debt)}</span> },
          { label: "Iniciada", value: new Date(visit.createdAt).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }) },
        ]} />
      </Card>

      <Card className="p-5">
        <h2 style={{ fontFamily: F.head, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Servicios de la atención ({svcs.length})</h2>
        {svcs.map((sv) => {
          const cols = SERVICE_FLOWS[sv.type].columns;
          const idx = cols.indexOf(sv.status);
          const done = isServiceDone(sv.type, sv.status);
          const pet = s.patients.find((p) => p.id === sv.patientId);
          // Al detalle concreto (resuelto por serviceId), no al índice del módulo.
          const job = sv.type === "peluqueria" ? s.grooming.find((g) => g.serviceId === sv.id) : null;
          const boardPath = sv.type === "peluqueria"
            ? (job ? `/grooming/show/${job.id}` : "/grooming")
            : sv.type === "laboratorio" ? `/clinic/show/${sv.patientId}` : null;
          return (
            <div key={sv.id} className="py-3" style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 min-w-0">
                  <Badge tone={TYPE_TONE[sv.type]}>{SERVICE_FLOWS[sv.type].label}</Badge>
                  <span className="truncate" style={{ fontSize: 13, color: T.ink, fontWeight: 600 }}>{sv.label}</span>
                  <span className="truncate" style={{ fontSize: 12, color: T.sub }}>· {pet?.name}</span>
                </span>
                <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, fontSize: 13 }}>{money(sv.price)}</span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {cols.map((c, i) => (
                    <span key={c} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: i === idx ? 700 : 500,
                      background: i <= idx ? T.greenSoft : T.track, color: i <= idx ? T.green : T.sub }}>{c}</span>
                  ))}
                </div>
                {done || billed
                  ? <Badge tone="green"><CheckCircle2 size={11} /> {sv.status}</Badge>
                  : boardPath
                    ? <Btn small kind="ghost" onClick={() => navigate(boardPath)}>Gestionar en {SERVICE_FLOWS[sv.type].label} <ArrowRight size={12} /></Btn>
                    : <Btn small kind="dark" onClick={() => s.advanceService(sv.id)}>Avanzar <ArrowRight size={12} /></Btn>}
              </div>
            </div>
          );
        })}
        {svcs.length === 0 && <p className="py-3" style={{ fontSize: 13, color: T.sub }}>Esta visita no tiene servicios. Agrégalos en Editar.</p>}

        <div className="flex items-center justify-between mt-4">
          <span style={{ fontFamily: F.head, fontSize: 15, fontWeight: 700 }}>Subtotal</span>
          <span style={{ fontFamily: F.head, fontSize: 15, fontWeight: 700 }}>{money(subtotal)}</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
          <Btn disabled={!ready} onClick={() => navigate(`/billing/collect/${visit.id}`)}><Receipt size={14} /> Cobrar y facturar</Btn>
        </div>
        {!ready && svcs.length > 0 && <p style={{ fontSize: 12, color: T.amber, textAlign: "right", marginTop: 8 }}>Faltan {pending} servicio{pending !== 1 ? "s" : ""} por terminar antes de facturar.</p>}
      </Card>
    </CustomPage>
  );
}
