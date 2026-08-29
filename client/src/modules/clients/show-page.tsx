import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, ClipboardList, FileText, PawPrint, Pencil, Plus } from "lucide-react";
import { F, money, SPECIES_ICON, T } from "@/lib/constants";
import type { Patient } from "@/lib/types";
import { useVetStore } from "@/states/app.state";
import { Badge, Btn, Card, PatientAlerts } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { InfoGrid } from "@/components/info-grid";
import { ResourceNotFound } from "@/components/resource-not-found";
import { PatientFormModal } from "./components/patient-form-modal";

export default function ClientShowPage() {
  const { id } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const [modal, setModal] = useState<{ patient?: Patient } | null>(null);
  const client = s.clients.find((c) => c.id === id);
  if (!client) return <ResourceNotFound backTo="/clients" label="el cliente" />;
  const pets = s.patients.filter((p) => p.clientId === client.id);
  const visit = s.visits.find((v) => v.clientId === client.id);
  const visitTotal = visit ? s.services.filter((x) => x.visitId === visit.id).reduce((t, x) => t + x.price, 0) : 0;
  return (
    <CustomPage goBack backTo="/clients" title={client.name} description="Ficha del cliente y sus mascotas."
      actions={
        <>
          <Btn kind="ghost" onClick={() => navigate(`/clients/edit/${client.id}`)}><Pencil size={14} /> Editar</Btn>
          <Btn kind="ghost" onClick={() => setModal({})}><Plus size={14} /> Mascota</Btn>
          <Btn onClick={() => { const fp = pets[0]?.id ?? ""; navigate(`/visits/edit/${s.openVisit(client.id, fp)}`); }}><ClipboardList size={14} /> Iniciar visita</Btn>
        </>
      }>
      <Card className="p-5 mb-4">
        <InfoGrid items={[
          { label: "Teléfono", value: client.phone },
          { label: "Correo", value: client.email },
          { label: "Deuda", value: client.debt > 0 ? <Badge tone="red">{money(client.debt)}</Badge> : "Sin deuda" },
          { label: "Visita abierta", value: visit ? <Badge tone="blue">{money(visitTotal)}</Badge> : "Sin visita abierta" },
        ]} />
      </Card>
      <h2 style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Mascotas ({pets.length})</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {pets.map((p) => {
          const Icon = SPECIES_ICON[p.species] || PawPrint;
          return (
            <Card key={p.id} className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center shrink-0" style={{ width: 40, height: 40, borderRadius: 12, background: T.greenSoft }}>
                  <Icon size={19} color={T.green} />
                </div>
                <div className="min-w-0 flex-1">
                  <div style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: T.sub }}>{p.species} · {p.breed} · {p.age}</div>
                </div>
              </div>
              <div className="mb-3"><PatientAlerts patient={p} /></div>
              <div className="flex gap-2 flex-wrap">
                <Btn small kind="ghost" onClick={() => navigate(`/clinic/show/${p.id}`)}><FileText size={12} /> Historial</Btn>
                <Btn small kind="ghost" onClick={() => navigate(`/appointments/new?patientId=${p.id}`)}><CalendarDays size={12} /> Agendar</Btn>
                <Btn small kind="ghost" onClick={() => setModal({ patient: p })}><Pencil size={12} /> Editar</Btn>
              </div>
            </Card>
          );
        })}
        {pets.length === 0 && (
          <Card className="p-6 sm:col-span-2 text-center">
            <p style={{ fontSize: 13, color: T.sub }}>Este cliente aún no tiene pacientes. Añade la primera mascota para habilitar citas, estética y clínica.</p>
          </Card>
        )}
      </div>
      {modal && <PatientFormModal clientId={client.id} patient={modal.patient} onClose={() => setModal(null)} />}
    </CustomPage>
  );
}
