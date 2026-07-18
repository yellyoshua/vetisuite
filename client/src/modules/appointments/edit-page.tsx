import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HOURS, inputStyle, T } from "../../lib/constants";
import { useVetStore } from "../../states/app.state";
import { Btn, Card, Field } from "../../components/ui";
import { PageHeader } from "../../components/page-header";
import { ResourceNotFound } from "../../components/resource-not-found";

export default function AppointmentEditPage() {
  const { id } = useParams();
  const s = useVetStore();
  const navigate = useNavigate();
  const appointment = s.appointments.find((a) => a.id === id);
  const [form, setForm] = useState(appointment
    ? { vetId: appointment.vetId, time: appointment.time, reason: appointment.reason }
    : { vetId: "", time: "", reason: "" });
  if (!appointment) return <ResourceNotFound backTo="/appointments" label="la cita" />;
  const patient = s.patients.find((p) => p.id === appointment.patientId)!;
  return (
    <div>
      <PageHeader backTo={`/appointments/show/${appointment.id}`} title="Reprogramar cita" sub={`Paciente: ${patient.name}. Se valida que el médico no tenga otra cita en el nuevo horario.`} />
      <Card className="p-5" style={{ maxWidth: 520 }}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Médico">
            <select style={inputStyle} value={form.vetId} onChange={(e) => setForm({ ...form, vetId: e.target.value })}>
              {s.vets.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </Field>
          <Field label="Hora">
            <select style={inputStyle} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
              {HOURS.map((h) => <option key={h}>{h}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Motivo"><input style={inputStyle} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field>
        <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>Al reprogramar se notifica el cambio por WhatsApp al dueño.</p>
        <div className="flex justify-end gap-2">
          <Btn kind="ghost" onClick={() => navigate(`/appointments/show/${appointment.id}`)}>Cancelar</Btn>
          <Btn disabled={!form.reason} onClick={() => { if (s.updateAppointment(appointment.id, form)) navigate(`/appointments/show/${appointment.id}`); }}>Guardar cambios</Btn>
        </div>
      </Card>
    </div>
  );
}
