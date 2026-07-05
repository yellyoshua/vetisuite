import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { HOURS, inputStyle, T } from "../../../lib/constants";
import type { Client } from "../../../lib/types";
import { useVetStore } from "../../../states/app.state";
import { Btn, Field, Modal } from "../../../components/ui";
import { ClientSearch } from "../../../components/client-search";
import { PatientPicker } from "../../../components/patient-picker";

/* The appointment starts from the client: first search the owner
   (async typeahead), then pick among THEIR pets. */
interface NewAppointmentModalProps {
  preset: { vetId: string; time: string } | null;
  onClose: () => void;
}

export function NewAppointmentModal({ preset, onClose }: NewAppointmentModalProps) {
  const s = useVetStore();
  const [searchParams] = useSearchParams();
  const ctxPatientId = searchParams.get("patientId");
  const ctxPatient = ctxPatientId ? s.patients.find((p) => p.id === ctxPatientId) : null;
  const [client, setClient] = useState<Client | null>(ctxPatient ? s.clients.find((c) => c.id === ctxPatient.clientId)! : null);
  const [patientId, setPatientId] = useState<string | null>(ctxPatient ? ctxPatient.id : null);
  const [form, setForm] = useState({ vetId: preset?.vetId || s.vets[0].id, time: preset?.time || "08:00", reason: "" });
  return (
    <Modal title="Nueva cita" onClose={onClose} width={500}>
      <Field label="1 · Cliente">
        <ClientSearch autoFocus selected={client} onSelect={(c) => { setClient(c); setPatientId(null); }} />
      </Field>
      <Field label="2 · Paciente (mascotas del cliente)">
        <PatientPicker clientId={client?.id} value={patientId} onChange={setPatientId} />
      </Field>
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
      <Field label="Motivo"><input style={inputStyle} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Ej: Vacunación, control, cirugía…" /></Field>
      <p style={{ fontSize: 12, color: T.sub, marginBottom: 14 }} className="flex items-center gap-1.5">
        <MessageCircle size={13} color={T.wa} /> Al agendar se envía confirmación automática por WhatsApp, con recordatorios 24 h y 2 h antes.
      </p>
      <Btn full disabled={!patientId || !form.reason} onClick={() => { if (s.createAppointment({ ...form, patientId: patientId! })) onClose(); }}>Agendar y notificar</Btn>
    </Modal>
  );
}
