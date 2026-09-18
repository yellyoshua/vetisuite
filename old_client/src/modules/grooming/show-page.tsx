import { useParams } from "react-router-dom";
import { CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { money, T } from "@/lib/constants";
import { useVetStore } from "@/states/app.state";
import { Badge, Btn, Card, Elapsed } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { InfoGrid } from "@/components/info-grid";
import { ResourceNotFound } from "@/components/resource-not-found";

const STATUS_TONE = { pendiente: "amber", proceso: "blue", terminado: "green", entregado: "gray" } as const;
const STATUS_LABEL = { pendiente: "Pendiente", proceso: "En proceso", terminado: "Terminado", entregado: "Entregado" } as const;

export default function GroomingShowPage() {
  const { id } = useParams();
  const s = useVetStore();
  const job = s.grooming.find((g) => g.id === id);
  if (!job) return <ResourceNotFound backTo="/grooming" label="el trabajo de estética" />;
  const patient = s.patients.find((p) => p.id === job.patientId)!;
  const owner = s.clients.find((c) => c.id === patient.clientId)!;
  const duration = job.finishedAt && job.startedAt ? Math.round((job.finishedAt - job.startedAt) / 60000) : null;
  return (
    <CustomPage goBack backTo="/grooming" title={`${job.service} · ${patient.name}`} description="Detalle del trabajo de estética.">
      <Card className="p-5 mb-4">
        <InfoGrid items={[
          { label: "Mascota", value: `${patient.name} (${patient.species} · ${patient.breed})` },
          { label: "Dueño", value: `${owner.name} · ${owner.phone}` },
          { label: "Servicio", value: job.service },
          { label: "Precio", value: money(job.price) },
          { label: "Peluquero", value: job.groomer },
          { label: "Pertenencias", value: job.belongings || "Sin pertenencias" },
          { label: "Estado", value: <Badge tone={STATUS_TONE[job.status]}>{STATUS_LABEL[job.status]}</Badge> },
          ...(job.status === "proceso" && job.startedAt ? [{ label: "Tiempo transcurrido", value: <span className="inline-flex items-center gap-1.5" style={{ color: T.blue }}><Clock size={13} /> <Elapsed since={job.startedAt} /></span> }] : []),
          ...(duration !== null ? [{ label: "Duración", value: `${duration} min` }] : []),
        ]} />
        {patient.aggressive && <div className="mt-4"><Badge tone="red"><ShieldAlert size={11} /> Manejo con precaución</Badge></div>}
      </Card>
      <div style={{ maxWidth: 420 }}>
        {job.status === "pendiente" && <Btn full kind="dark" onClick={() => s.moveGrooming(job.id, "proceso")}>Iniciar servicio</Btn>}
        {job.status === "proceso" && <Btn full onClick={() => s.moveGrooming(job.id, "terminado")}><CheckCircle2 size={13} /> Terminar</Btn>}
        {job.status === "terminado" && <Btn full kind="ghost" onClick={() => s.moveGrooming(job.id, "entregado")}>Marcar entregado</Btn>}
      </div>
    </CustomPage>
  );
}
