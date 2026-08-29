import { useNavigate } from "react-router-dom";
import { ClipboardList, Eye, Pencil, Plus } from "lucide-react";
import { F, isServiceDone, money, T } from "@/lib/constants";
import { useVetStore } from "@/states/app.state";
import { Badge, Btn, Card } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";

/* Recepción: cada visita abierta agrupa los servicios de una atención, cada uno con su propio kanban. */
export default function VisitsPage() {
  const s = useVetStore();
  const navigate = useNavigate();
  return (
    <CustomPage title="Visitas" description="Check-in general por cliente: agrega los servicios de la atención; cada uno avanza en su propio kanban y al terminar queda listo para facturar."
      actions={<Btn onClick={() => navigate("/visits/new")}><Plus size={14} /> Check-in general</Btn>}>
      <div className="grid md:grid-cols-2 gap-3">
        {s.visits.map((v) => {
          const client = s.clients.find((c) => c.id === v.clientId)!;
          const svcs = s.services.filter((x) => x.visitId === v.id);
          const done = svcs.filter((x) => isServiceDone(x.type, x.status)).length;
          const total = svcs.reduce((t, x) => t + x.price, 0);
          const ready = svcs.length > 0 && done === svcs.length;
          return (
            <Card key={v.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontFamily: F.head, fontSize: 14.5, fontWeight: 700 }}>{client.name}</span>
                <span style={{ fontSize: 12, color: T.sub }}>{new Date(v.createdAt).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span style={{ fontSize: 12.5, color: T.sub }}>{svcs.length} servicio{svcs.length !== 1 ? "s" : ""} · <b style={{ color: T.ink }}>{money(total)}</b></span>
                  {!v.started
                    ? <Badge tone="gray">Borrador · sin comenzar</Badge>
                    : <Badge tone={ready ? "green" : svcs.length === 0 ? "gray" : "amber"}>{svcs.length === 0 ? "Sin servicios" : ready ? "Listo para facturar" : `${done}/${svcs.length} terminados`}</Badge>}
                </div>
                {v.started
                  ? <Btn small kind="ghost" onClick={() => navigate(`/visits/show/${v.id}`)}><Eye size={13} /> Abrir</Btn>
                  : <Btn small kind="ghost" onClick={() => navigate(`/visits/edit/${v.id}`)}><Pencil size={13} /> Editar</Btn>}
              </div>
            </Card>
          );
        })}
        {s.visits.length === 0 && (
          <Card className="p-8 text-center md:col-span-2">
            <ClipboardList size={24} color={T.sub} className="mx-auto mb-3" />
            <p style={{ fontSize: 13, color: T.sub }}>No hay visitas abiertas. Haz un check-in general para iniciar una atención.</p>
          </Card>
        )}
      </div>
    </CustomPage>
  );
}
