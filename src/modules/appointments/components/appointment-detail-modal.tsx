import { useNavigate } from "react-router-dom";
import { MessageCircle, Stethoscope } from "lucide-react";
import { F, T } from "../../../lib/constants";
import type { Appointment } from "../../../lib/types";
import { useVetStore } from "../../../states/app.state";
import { Btn, Modal, PatientAlerts } from "../../../components/ui";

export function AppointmentDetailModal({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const s = useVetStore();
  const navigate = useNavigate();
  const patient = s.patients.find((p) => p.id === appointment.patientId)!;
  const owner = s.clients.find((c) => c.id === patient.clientId)!;
  const vet = s.vets.find((v) => v.id === appointment.vetId)!;
  return (
    <Modal title={`Cita · ${appointment.time}`} onClose={onClose}>
      <div className="mb-4">
        <div style={{ fontFamily: F.head, fontSize: 17, fontWeight: 700 }}>{patient.name} <span style={{ fontWeight: 400, fontSize: 13, color: T.sub }}>({patient.species} · {patient.breed})</span></div>
        <div style={{ fontSize: 13, color: T.sub, marginTop: 3 }}>{owner.name} · {owner.phone}</div>
        <div style={{ fontSize: 13, color: T.sub }}>{appointment.reason} · {vet.name}</div>
        <div className="mt-2"><PatientAlerts patient={patient} /></div>
      </div>
      <div className="flex flex-col gap-2">
        {appointment.status === "pendiente" && <Btn kind="wa" full onClick={() => { s.setAppointmentStatus(appointment.id, "confirmada"); onClose(); }}><MessageCircle size={14} /> Confirmar por WhatsApp</Btn>}
        {appointment.status !== "completada" && <Btn kind="dark" full onClick={() => { s.setAppointmentStatus(appointment.id, "completada"); navigate(`/clinic?patientId=${patient.id}`); }}><Stethoscope size={14} /> Pasar a consulta médica</Btn>}
        {appointment.status !== "completada" && <Btn kind="danger" full onClick={() => { s.setAppointmentStatus(appointment.id, "cancelada"); onClose(); }}>Cancelar y liberar espacio</Btn>}
      </div>
    </Modal>
  );
}
