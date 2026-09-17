import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, ClipboardList, Pencil, Stethoscope } from "lucide-react";
import { CONSULT_FEE, GROOM_SERVICES, LAB_TESTS, F, money, T } from "@/lib/constants";
import type { ServiceType } from "@/lib/types";
import { useVetStore } from "@/states/app.state";
import { Badge, Btn, Card, Modal, PatientAlerts } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { InfoGrid } from "@/components/info-grid";
import { ResourceNotFound } from "@/components/resource-not-found";

const STATUS_TONE = { pendiente: "amber", confirmada: "green", completada: "blue", cancelada: "gray" } as const;

export default function AppointmentShowPage() {
  const { id } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const appointment = s.appointments.find((a) => a.id === id);
  const [picked, setPicked] = useState<Record<string, boolean>>({ vet: true });
  const [confirmCancel, setConfirmCancel] = useState(false);
  if (!appointment) return <ResourceNotFound backTo="/appointments" label="la cita" />;
  const patient = s.patients.find((p) => p.id === appointment.patientId)!;
  const owner = s.clients.find((c) => c.id === patient.clientId)!;
  const vet = s.vets.find((v) => v.id === appointment.vetId)!;
  const editable = appointment.status === "pendiente" || appointment.status === "confirmada";
  const closed = appointment.status === "completada" || appointment.status === "cancelada";

  /* Tratamientos que puede incluir la visita. Sin vacunas ni medicamentos a
     propósito: son salida de inventario y solo se generan desde
     /clinic/apply-product, que es lo único que descuenta stock. */
  const treatments: { key: string; label: string; type: ServiceType; item: string; price: number }[] = [
    { key: "vet", label: "Consulta veterinaria", type: "veterinaria", item: "Consulta médica", price: CONSULT_FEE },
    { key: "groom", label: "Peluquería · Baño completo", type: "peluqueria", item: "Baño completo", price: GROOM_SERVICES["Baño completo"] },
    { key: "lab", label: "Laboratorio · Hemograma", type: "laboratorio", item: "Hemograma completo", price: LAB_TESTS["Hemograma completo"] },
  ];
  const chosen = treatments.filter((t) => picked[t.key]);

  const startVisit = () => {
    const visitId = s.openVisit(owner.id, patient.id);
    chosen.forEach((t) => s.addService(visitId, { type: t.type, label: t.item, price: t.price, patientId: patient.id }));
    s.setAppointmentStatus(appointment.id, "completada");
    navigate(`/visits/edit/${visitId}`);
  };

  return (
    <CustomPage goBack backTo="/appointments" title={`Cita · ${appointment.time}`} description={`${patient.name} (${patient.species} · ${patient.breed})`}
      actions={editable && <Btn kind="ghost" onClick={() => navigate(`/appointments/edit/${appointment.id}`)}><Pencil size={14} /> Editar</Btn>}>
      <Card className="p-5 mb-4">
        <InfoGrid items={[
          { label: "Paciente", value: patient.name },
          { label: "Dueño", value: owner.name },
          { label: "Teléfono", value: owner.phone },
          { label: "Médico", value: vet.name },
          { label: "Hora", value: appointment.time },
          { label: "Estado", value: <Badge tone={STATUS_TONE[appointment.status]}>{appointment.status}</Badge> },
          { label: "Motivo", value: appointment.reason },
          {
            label: "Origen",
            value: appointment.source === "portal" ? (
              <span className="inline-flex items-center gap-1.5 flex-wrap">
                <Badge tone="blue">Portal web</Badge>
                {appointment.submissionId && (
                  <span className="text-xs text-sub">Envío {appointment.submissionId}</span>
                )}
              </span>
            ) : (
              <Badge tone="gray">Staff interno</Badge>
            ),
          },
        ]} />
        <div className="mt-4"><PatientAlerts patient={patient} /></div>
      </Card>

      {/* INICIAR VISITA — elige los tratamientos de la atención */}
      {!closed && (
        <Card className="p-5 mb-4">
          <h2 className="flex items-center gap-2" style={{ fontFamily: F.head, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
            <ClipboardList size={16} color={T.green} /> Iniciar visita
          </h2>
          <p style={{ fontSize: 12.5, color: T.sub, marginBottom: 14 }}>Selecciona los tratamientos de esta atención. Se crea la visita con cada servicio en su kanban. Las vacunas y los medicamentos se aplican desde el expediente del paciente.</p>
          <div className="flex flex-col gap-2 mb-4">
            {treatments.map((t) => (
              <label key={t.key} className="flex items-center gap-2.5" style={{ fontSize: 13.5, color: T.ink }}>
                <input type="checkbox" checked={!!picked[t.key]} onChange={(e) => setPicked({ ...picked, [t.key]: e.target.checked })} />
                <span className="flex-1">{t.label}</span>
                <span style={{ color: T.sub, fontVariantNumeric: "tabular-nums" }}>{money(t.price)}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <Btn disabled={chosen.length === 0} onClick={startVisit}><ClipboardList size={14} /> Iniciar visita ({chosen.length})</Btn>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-2" style={{ maxWidth: 420 }}>
        {appointment.status === "pendiente" && <Btn full onClick={() => s.setAppointmentStatus(appointment.id, "confirmada")}><CheckCircle2 size={14} /> Confirmar cita</Btn>}
        {!closed && (
          <Btn kind="ghost" full onClick={() => navigate(`/clinic/show/${patient.id}`)}><Stethoscope size={14} /> Abrir expediente clínico</Btn>
        )}
        {!closed && (
          <Btn kind="danger" full onClick={() => setConfirmCancel(true)}>Cancelar y liberar espacio</Btn>
        )}
      </div>

      {confirmCancel && (
        <Modal title="Cancelar la cita" onClose={() => setConfirmCancel(false)} width={400}>
          <p style={{ fontSize: 14, color: T.ink }}>
            ¿Cancelar la cita de <b>{patient.name}</b> a las {appointment.time}? El espacio queda libre y la cita no se puede reprogramar después.
          </p>
          <div className="flex justify-end gap-2 mt-5">
            <Btn kind="ghost" onClick={() => setConfirmCancel(false)}>Volver</Btn>
            <Btn kind="danger" onClick={() => { s.setAppointmentStatus(appointment.id, "cancelada"); navigate("/appointments"); }}>Cancelar cita</Btn>
          </div>
        </Modal>
      )}
    </CustomPage>
  );
}
