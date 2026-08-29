import { useNavigate, useParams } from "react-router-dom";
import { FlaskConical, Send, Stethoscope, Syringe } from "lucide-react";
import { F, T } from "@/lib/constants";
import { useVetStore } from "@/states/app.state";
import { Badge, Btn, Card, PatientAlerts } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { ResourceNotFound } from "@/components/resource-not-found";
import { LabOrderCard } from "./components/lab-order-card";

/* The patient's full medical record. Immutable history: no edit screen;
   each clinical action has its own screen under /clinic/[action]/:patientId. */
export default function ClinicShowPage() {
  const { patientId } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const patient = s.patients.find((p) => p.id === patientId);
  if (!patient) return <ResourceNotFound backTo="/clinic" label="el paciente" />;
  const owner = s.clients.find((c) => c.id === patient.clientId)!;
  const patientRecords = s.records.filter((r) => r.patientId === patient.id);
  const latestRecord = patientRecords[0];
  const patientOrders = s.labOrders.filter((o) => o.patientId === patient.id);
  return (
    <CustomPage goBack backTo="/clinic" title={patient.name} description={`${patient.species} · ${patient.breed} · ${patient.age} · Dueño: ${owner.name}`}
      actions={<Btn onClick={() => navigate(`/clinic/consultation/${patient.id}`)}><Stethoscope size={14} /> Nueva consulta</Btn>}>
      <div className="mb-4"><PatientAlerts patient={patient} /></div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-3">
          {latestRecord && (
            <div className="flex gap-2 flex-wrap">
              <Btn small kind="ghost" onClick={() => navigate(`/clinic/apply-product/${patient.id}`)}><Syringe size={13} /> Aplicar insumo</Btn>
              <Btn small kind="ghost" onClick={() => navigate(`/clinic/lab-order/${patient.id}`)}><FlaskConical size={13} /> Orden de laboratorio</Btn>
              <Btn small kind="ghost" onClick={() => navigate(`/clinic/prescription/${patient.id}`)}><Send size={13} /> Emitir receta</Btn>
            </div>
          )}
          {patientRecords.map((r, i) => {
            const vet = s.vets.find((v) => v.id === r.vetId);
            return (
              <Card key={r.id} className="p-4" style={i === 0 ? { borderColor: T.green } : {}}>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span style={{ fontFamily: F.head, fontSize: 13.5, fontWeight: 600 }}>
                    {new Date(r.date).toLocaleDateString("es-EC", { day: "numeric", month: "short", year: "numeric" })} · {vet?.name}
                  </span>
                  {i === 0 && <Badge tone="green">Consulta activa</Badge>}
                </div>
                <div className="flex gap-2 flex-wrap mb-2">
                  {Object.entries(r.vitals || {}).map(([key, value]) => (
                    <span key={key} style={{ background: T.track, borderRadius: 8, padding: "3px 9px", fontSize: 11.5, color: T.ink }}>
                      {key === "weight" ? "Peso" : key === "temp" ? "Temp" : "FC"}: <b>{value}</b>
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: 12.5, color: T.sub, marginBottom: 6 }}><b style={{ color: T.ink }}>Anamnesis:</b> {r.anamnesis}</p>
                <p style={{ fontSize: 12.5, color: T.sub }}><b style={{ color: T.ink }}>Diagnóstico:</b> {r.diagnosis}</p>
                {r.products.length > 0 && (
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    {r.products.map((p, j) => <Badge key={j} tone="blue"><Syringe size={11} /> {p.name} ×{p.qty}</Badge>)}
                  </div>
                )}
                {r.prescriptions.length > 0 && (
                  <div className="mt-2">
                    {r.prescriptions.map((rx, j) => (
                      <div key={j} style={{ fontSize: 12, color: T.sub }}>℞ <b style={{ color: T.ink }}>{rx.med}</b> — {rx.dosage}</div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
          {patientRecords.length === 0 && (
            <Card className="p-6 text-center">
              <p style={{ fontSize: 13, color: T.sub }}>Sin consultas registradas para {patient.name}. Abre la primera con “Nueva consulta”.</p>
            </Card>
          )}
        </div>
        <Card className="p-4">
          <h3 className="flex items-center gap-2 mb-3" style={{ fontFamily: F.head, fontSize: 14, fontWeight: 600 }}>
            <FlaskConical size={15} color={T.blue} /> Órdenes de {patient.name}
          </h3>
          <div className="flex flex-col gap-2.5">
            {patientOrders.map((o) => <LabOrderCard key={o.id} order={o} />)}
            {patientOrders.length === 0 && <p style={{ fontSize: 12.5, color: T.sub }}>Sin órdenes para este paciente.</p>}
          </div>
        </Card>
      </div>
    </CustomPage>
  );
}
