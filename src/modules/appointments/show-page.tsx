import { useNavigate, useParams } from "react-router-dom";
import { MessageCircle, Pencil, Stethoscope } from "lucide-react";
import { useVetStore } from "../../states/app.state";
import { Badge, Btn, Card, PatientAlerts } from "../../components/ui";
import { PageHeader } from "../../components/page-header";
import { InfoGrid } from "../../components/info-grid";
import { ResourceNotFound } from "../../components/resource-not-found";

const STATUS_TONE = { pendiente: "amber", confirmada: "green", completada: "blue", cancelada: "gray" } as const;

export default function AppointmentShowPage() {
  const { id } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const appointment = s.appointments.find((a) => a.id === id);
  if (!appointment) return <ResourceNotFound backTo="/appointments" label="la cita" />;
  const patient = s.patients.find((p) => p.id === appointment.patientId)!;
  const owner = s.clients.find((c) => c.id === patient.clientId)!;
  const vet = s.vets.find((v) => v.id === appointment.vetId)!;
  const editable = appointment.status === "pendiente" || appointment.status === "confirmada";
  return (
    <div>
      <PageHeader backTo="/appointments" title={`Cita · ${appointment.time}`} sub={`${patient.name} (${patient.species} · ${patient.breed})`}
        action={editable && <Btn kind="ghost" onClick={() => navigate(`/appointments/edit/${appointment.id}`)}><Pencil size={14} /> Editar</Btn>} />
      <Card className="p-5 mb-4">
        <InfoGrid items={[
          { label: "Paciente", value: patient.name },
          { label: "Dueño", value: owner.name },
          { label: "Teléfono", value: owner.phone },
          { label: "Médico", value: vet.name },
          { label: "Hora", value: appointment.time },
          { label: "Estado", value: <Badge tone={STATUS_TONE[appointment.status]}>{appointment.status}</Badge> },
          { label: "Motivo", value: appointment.reason },
        ]} />
        <div className="mt-4"><PatientAlerts patient={patient} /></div>
      </Card>
      <div className="flex flex-col gap-2" style={{ maxWidth: 420 }}>
        {appointment.status === "pendiente" && <Btn kind="wa" full onClick={() => s.setAppointmentStatus(appointment.id, "confirmada")}><MessageCircle size={14} /> Confirmar por WhatsApp</Btn>}
        {appointment.status !== "completada" && appointment.status !== "cancelada" && (
          <Btn kind="dark" full onClick={() => { s.setAppointmentStatus(appointment.id, "completada"); navigate(`/clinic/show/${patient.id}`); }}><Stethoscope size={14} /> Pasar a consulta médica</Btn>
        )}
        {appointment.status !== "completada" && appointment.status !== "cancelada" && (
          <Btn kind="danger" full onClick={() => { s.setAppointmentStatus(appointment.id, "cancelada"); navigate("/appointments"); }}>Cancelar y liberar espacio</Btn>
        )}
      </div>
    </div>
  );
}
