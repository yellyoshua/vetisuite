import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { slotsForDate } from "@/lib/availability";
import { T } from "@/lib/constants";
import { useVetStore } from "@/states/app.state";
import { Badge, Btn, Card, Field, Input, Select } from "@/components/ui";
import { CustomPage } from "@/components/pages/custom-page";
import { ResourceNotFound } from "@/components/resource-not-found";

export default function AppointmentEditPage() {
  const { id } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const appointment = s.appointments.find((a) => a.id === id);
  const [form, setForm] = useState(appointment
    ? { vetId: appointment.vetId, time: appointment.time, reason: appointment.reason }
    : { vetId: "", time: "", reason: "" });
  if (!appointment) return <ResourceNotFound backTo="/appointments" label="la cita" />;
  if (appointment.status === "cancelada" || appointment.status === "completada") {
    return (
      <CustomPage goBack backTo={`/appointments/show/${appointment.id}`} title="Cita cerrada" description="Una cita cancelada o completada ya no se reprograma.">
        <Card className="p-6 text-center">
          <div className="mb-3"><Badge tone="gray">{appointment.status}</Badge></div>
          <p style={{ fontSize: 13, color: T.sub, marginBottom: 16 }}>Agenda una cita nueva si necesitas volver a atender a este paciente.</p>
          <Btn kind="ghost" onClick={() => navigate(`/appointments/show/${appointment.id}`)}>Volver al detalle</Btn>
        </Card>
      </CustomPage>
    );
  }
  const patient = s.patients.find((p) => p.id === appointment.patientId)!;
  // La hora actual siempre está en la lista: si el horario cambió, reprogramar no la reasigna sola.
  const hours = [...new Set([...slotsForDate(s.availability, new Date()), appointment.time])].sort();
  return (
    <CustomPage goBack backTo={`/appointments/show/${appointment.id}`} title="Reprogramar cita" description={`Paciente: ${patient.name}. Se valida que el médico no tenga otra cita en el nuevo horario.`}>
      <Card className="p-5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Médico">
            <Select value={form.vetId} onChange={(e) => setForm({ ...form, vetId: e.target.value })}>
              {s.vets.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </Select>
          </Field>
          <Field label="Hora">
            <Select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
              {hours.map((h) => <option key={h}>{h}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Motivo"><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field>
        <div className="flex justify-end gap-2">
          <Btn kind="ghost" onClick={() => navigate(`/appointments/show/${appointment.id}`)}>Cancelar</Btn>
          <Btn disabled={!form.reason} onClick={() => { if (s.updateAppointment(appointment.id, form)) navigate(`/appointments/show/${appointment.id}`); }}>Guardar cambios</Btn>
        </div>
      </Card>
    </CustomPage>
  );
}
