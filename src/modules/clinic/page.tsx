import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FlaskConical, History, Send, Stethoscope, Syringe } from "lucide-react";
import { F, T } from "../../lib/constants";
import type { Client } from "../../lib/types";
import { useVetStore } from "../../states/app.state";
import { Badge, Btn, Card, Field, PatientAlerts, SectionHead } from "../../components/ui";
import { ClientSearch } from "../../components/client-search";
import { PatientPicker } from "../../components/patient-picker";
import { LabOrderCard } from "./components/lab-order-card";
import { ConsultationModal } from "./components/consultation-modal";
import { ApplyProductModal } from "./components/apply-product-modal";
import { LabOrderModal } from "./components/lab-order-modal";
import { PrescriptionModal } from "./components/prescription-modal";

/* ================================================================
   CLINIC — the medical record also starts from the client: search
   the owner, pick their pet, open the history. Adds a "recently
   seen" list (the recents pattern of big EHRs) to reopen records
   without repeating the search.
================================================================ */
type ClinicModal = "consultation" | "product" | "lab" | "prescription" | null;

export default function ClinicPage() {
  const s = useVetStore();
  // The URL is the single source of truth for the selected patient (deep-linkable);
  // the client is derived from the patient, or comes from the search box while no patient is picked.
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPatientId = searchParams.get("patientId");
  const selectPatient = (patientId: string) => setSearchParams({ patientId }, { replace: true });
  const [searchedClient, setSearchedClient] = useState<Client | null>(null);
  const [modal, setModal] = useState<ClinicModal>(null);
  const patient = s.patients.find((p) => p.id === selectedPatientId) || null;
  const owner = patient ? s.clients.find((c) => c.id === patient.clientId)! : null;
  const client = owner || searchedClient;
  const patientRecords = s.records.filter((r) => r.patientId === selectedPatientId);
  const latestRecord = patientRecords[0];
  const recentPatientIds = useMemo(() => {
    const seen = new Set<string>(); const out: string[] = [];
    for (const r of s.records) {
      if (!seen.has(r.patientId)) { seen.add(r.patientId); out.push(r.patientId); if (out.length >= 5) break; }
    }
    return out;
  }, [s.records]);
  const patientOrders = s.labOrders.filter((o) => o.patientId === selectedPatientId);
  const otherPending = s.labOrders.filter((o) => o.status === "solicitado" && o.patientId !== selectedPatientId);
  return (
    <div>
      <SectionHead title="Clínica y Laboratorio" sub="Historial clínico estructurado e inalterable. Cada insumo aplicado descuenta inventario y carga la cuenta del cliente automáticamente."
        action={patient && <Btn onClick={() => setModal("consultation")}><Stethoscope size={14} /> Nueva consulta</Btn>} />
      <div className="grid lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <Field label="1 · Cliente">
            <ClientSearch selected={client} onSelect={(c) => { setSearchedClient(c); setSearchParams({}, { replace: true }); }} />
          </Field>
          <Field label="2 · Paciente">
            <PatientPicker clientId={client?.id} value={selectedPatientId} onChange={selectPatient} />
          </Field>
          <div className="mt-4">
            <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 11, fontWeight: 600, color: T.sub, letterSpacing: 0.3, textTransform: "uppercase" }}>
              <History size={12} /> Atendidos recientemente
            </div>
            {recentPatientIds.map((patientId) => {
              const p = s.patients.find((x) => x.id === patientId);
              const o = p && s.clients.find((c) => c.id === p.clientId);
              if (!p) return null;
              return (
                <button key={patientId} onClick={() => selectPatient(patientId)} className="vs-opt w-full text-left px-2.5 py-2 mb-1" style={{ borderRadius: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: T.ink }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: T.sub }}> · {o?.name}</span>
                </button>
              );
            })}
            {recentPatientIds.length === 0 && <p style={{ fontSize: 12, color: T.sub }}>Aún no hay consultas registradas.</p>}
          </div>
        </Card>
        <div className="lg:col-span-2 flex flex-col gap-3">
          {!patient && (
            <Card className="p-8 text-center">
              <Stethoscope size={22} color={T.sub} className="mx-auto mb-2" />
              <p style={{ fontSize: 13.5, color: T.ink, fontWeight: 600 }}>Busca al cliente para abrir un expediente</p>
              <p style={{ fontSize: 12.5, color: T.sub, marginTop: 4 }}>Escribe el nombre, teléfono o correo del dueño, elige la mascota y verás su historial completo. También puedes reabrir un paciente reciente.</p>
            </Card>
          )}
          {patient && (
            <Card className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span style={{ fontFamily: F.head, fontSize: 16, fontWeight: 700 }}>{patient.name}</span>
                  <span style={{ fontSize: 12.5, color: T.sub }}> · {patient.breed} · {patient.age} · Dueño: {owner?.name}</span>
                </div>
                <PatientAlerts patient={patient} />
              </div>
            </Card>
          )}
          {patient && latestRecord && (
            <div className="flex gap-2 flex-wrap">
              <Btn small kind="ghost" onClick={() => setModal("product")}><Syringe size={13} /> Aplicar insumo</Btn>
              <Btn small kind="ghost" onClick={() => setModal("lab")}><FlaskConical size={13} /> Orden de laboratorio</Btn>
              <Btn small kind="ghost" onClick={() => setModal("prescription")}><Send size={13} /> Emitir receta</Btn>
            </div>
          )}
          {patient && patientRecords.map((r, i) => {
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
                    <span key={key} style={{ background: "#F1EFE7", borderRadius: 8, padding: "3px 9px", fontSize: 11.5, color: T.ink }}>
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
          {patient && patientRecords.length === 0 && (
            <Card className="p-6 text-center">
              <p style={{ fontSize: 13, color: T.sub }}>Sin consultas registradas para {patient.name}. Abre la primera con “Nueva consulta”.</p>
            </Card>
          )}
        </div>
        <Card className="p-4">
          <h3 className="flex items-center gap-2 mb-3" style={{ fontFamily: F.head, fontSize: 14, fontWeight: 600 }}>
            <FlaskConical size={15} color={T.blue} /> Laboratorio
          </h3>
          {patient && (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 8 }}>Órdenes de {patient.name}</div>
              <div className="flex flex-col gap-2.5 mb-4">
                {patientOrders.map((o) => <LabOrderCard key={o.id} order={o} />)}
                {patientOrders.length === 0 && <p style={{ fontSize: 12.5, color: T.sub }}>Sin órdenes para este paciente.</p>}
              </div>
            </>
          )}
          <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 8 }}>
            Cola pendiente de la clínica ({otherPending.length})
          </div>
          <div className="flex flex-col gap-2.5">
            {otherPending.slice(0, 4).map((o) => <LabOrderCard key={o.id} order={o} />)}
            {otherPending.length > 4 && <p style={{ fontSize: 11.5, color: T.sub }}>+{otherPending.length - 4} órdenes más en cola.</p>}
            {otherPending.length === 0 && <p style={{ fontSize: 12.5, color: T.sub }}>No hay resultados pendientes de otros pacientes.</p>}
          </div>
        </Card>
      </div>
      {modal === "consultation" && patient && <ConsultationModal patientId={patient.id} onClose={() => setModal(null)} />}
      {modal === "product" && latestRecord && <ApplyProductModal record={latestRecord} onClose={() => setModal(null)} />}
      {modal === "lab" && patient && <LabOrderModal patientId={patient.id} onClose={() => setModal(null)} />}
      {modal === "prescription" && latestRecord && <PrescriptionModal record={latestRecord} onClose={() => setModal(null)} />}
    </div>
  );
}
